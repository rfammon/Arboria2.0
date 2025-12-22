import { supabase } from './supabase';
import { updatePhotoSyncStatus, deletePhotoFromLocal } from './photoStorage';
import type { PhotoWithMetadata } from '@/types/photo';

export interface PhotoUploadResult {
    success: boolean;
    storageUrl?: string;
    photoId?: string;
    error?: string;
}

export interface BulkUploadResult {
    successful: number;
    failed: number;
    errors: string[];
    uploadedPhotoIds: string[];
}

/**
 * Upload photo to Supabase Storage and save metadata
 * Story 1.3: AC1 - Upload with path structure and RLS enforcement
 * 
 * @param photo - Photo with metadata to upload
 * @param treeId - Tree UUID
 * @param installationId - Installation UUID for RLS path structure
 * @returns Upload result with storage URL or error
 */
export async function uploadPhotoToStorage(
    photo: PhotoWithMetadata,
    treeId: string,
    installationId: string
): Promise<PhotoUploadResult> {
    try {
        // Get current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('[photoUploadService] Auth error:', authError);
            return { success: false, error: 'User not authenticated' };
        }

        if (!photo.file) {
            return { success: false, error: 'No file data found for upload' };
        }

        // AC1: Path structure - {instalacao_id}/trees/{tree_id}/photos/{filename}
        const fileExt = photo.file.name.split('.').pop() || 'jpg';
        const sanitizedFilename = photo.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${photo.id}.${fileExt}`;
        const storagePath = `${installationId}/trees/${treeId}/photos/${uniqueFilename}`;

        console.log('[photoUploadService] Uploading photo:', {
            photoId: photo.id,
            storagePath,
            fileSize: photo.metadata.compressedSize,
        });

        // AC1: Upload to Supabase Storage (RLS will verify user has access)
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('tree-photos')
            .upload(storagePath, photo.file, {
                cacheControl: '3600',
                upsert: false, // Fail if file already exists
                contentType: photo.file.type,
            });

        if (uploadError) {
            console.error('[photoUploadService] Storage upload error:', uploadError);

            // Check if it's a RLS policy violation (AC2)
            if (uploadError.message?.includes('policy')) {
                return {
                    success: false,
                    error: 'Permission denied: You do not have access to this installation'
                };
            }

            return { success: false, error: uploadError.message };
        }

        console.log('[photoUploadService] Photo uploaded to storage:', uploadData.path);

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from('tree-photos')
            .getPublicUrl(storagePath);

        const publicUrl = urlData.publicUrl;

        // AC1: Save metadata to tree_photos table (RLS enforced)
        const { data: metadataData, error: metadataError } = await supabase
            .from('tree_photos')
            .insert({
                tree_id: treeId,
                instalacao_id: installationId,
                storage_path: storagePath,
                filename: sanitizedFilename,
                file_size: photo.metadata.compressedSize,
                mime_type: photo.file.type,
                gps_latitude: photo.metadata.exifData?.latitude || null,
                gps_longitude: photo.metadata.exifData?.longitude || null,
                captured_at: photo.metadata.exifData?.timestamp || photo.metadata.capturedAt,
                uploaded_by: user.id,
                display_order: 0, // Will be updated based on gallery order in future
            })
            .select()
            .single();

        if (metadataError) {
            console.error('[photoUploadService] Metadata save error:', metadataError);

            // Rollback: Delete from storage if metadata save fails
            console.log('[photoUploadService] Rolling back storage upload...');
            await supabase.storage.from('tree-photos').remove([storagePath]);

            return { success: false, error: `Metadata save failed: ${metadataError.message}` };
        }

        console.log('[photoUploadService] Metadata saved:', metadataData.id);

        // AC1: Update IndexedDB with storage URL and synced status
        await updatePhotoSyncStatus(photo.id, 'synced', publicUrl);

        console.log('[photoUploadService] Upload complete! URL:', publicUrl);

        return {
            success: true,
            storageUrl: publicUrl,
            photoId: metadataData.id,
        };

    } catch (error: any) {
        console.error('[photoUploadService] Unexpected error:', error);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}

/**
 * Upload all pending photos for a tree
 * Story 1.3: Batch upload with error handling
 * 
 * @param photos - Array of photos to upload
 * @param treeId - Tree UUID
 * @param installationId - Installation UUID
 * @returns Summary of upload results
 */
export async function uploadTreePhotos(
    photos: PhotoWithMetadata[],
    treeId: string,
    installationId: string
): Promise<BulkUploadResult> {
    const results: BulkUploadResult = {
        successful: 0,
        failed: 0,
        errors: [],
        uploadedPhotoIds: [],
    };

    console.log(`[photoUploadService] Batch uploading ${photos.length} photos...`);

    // Upload photos sequentially to avoid rate limits
    for (const photo of photos) {
        // Skip already synced photos
        if (photo.syncStatus === 'synced') {
            console.log(`[photoUploadService] Skipping already synced photo: ${photo.id}`);
            continue;
        }

        if (!photo.file) {
            results.failed++;
            results.errors.push(`Missing file data for photo ${photo.id}`);
            continue;
        }

        const result = await uploadPhotoToStorage(photo, treeId, installationId);

        if (result.success) {
            results.successful++;
            if (result.photoId) {
                results.uploadedPhotoIds.push(result.photoId);
            }
            console.log(`[photoUploadService] ✅ ${photo.file.name} uploaded`);
        } else {
            results.failed++;
            const errorMsg = `${photo.file.name}: ${result.error}`;
            results.errors.push(errorMsg);

            // Mark as failed in IndexedDB
            await updatePhotoSyncStatus(photo.id, 'failed', undefined, result.error);

            console.error(`[photoUploadService] ❌ ${errorMsg}`);
        }
    }

    console.log('[photoUploadService] Batch upload complete:', results);

    return results;
}

/**
 * Delete photo from Storage and metadata table
 * Story 1.3: Delete with RLS enforcement
 * 
 * @param photoId - tree_photos table UUID
 * @param storagePath - Storage path to delete
 * @returns Success/error result
 */
export async function deletePhotoFromStorage(
    photoId: string,
    storagePath: string
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('[photoUploadService] Deleting photo:', { photoId, storagePath });

        // Delete metadata first (RLS enforced - only uploader can delete)
        const { error: metadataError } = await supabase
            .from('tree_photos')
            .delete()
            .eq('id', photoId);

        if (metadataError) {
            console.error('[photoUploadService] Metadata delete error:', metadataError);

            // AC2: Check if it's a RLS policy violation
            if (metadataError.message?.includes('policy') || metadataError.message?.includes('permission')) {
                return { success: false, error: 'Permission denied: You can only delete your own photos' };
            }

            return { success: false, error: metadataError.message };
        }

        // Delete from storage (RLS enforced)
        const { error: storageError } = await supabase.storage
            .from('tree-photos')
            .remove([storagePath]);

        if (storageError) {
            console.error('[photoUploadService] Storage delete error:', storageError);
            // Don't fail if storage delete fails - metadata is already deleted
            // Log for manual cleanup
            console.warn('[photoUploadService] Orphaned file in storage:', storagePath);
        }

        // Delete from IndexedDB
        await deletePhotoFromLocal(photoId);

        console.log('[photoUploadService] Photo deleted successfully');

        return { success: true };

    } catch (error: any) {
        console.error('[photoUploadService] Unexpected delete error:', error);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}

/**
 * Retry failed photo uploads
 * Story 1.3: Retry logic for failed uploads
 * 
 * @param failedPhotos - Photos with 'failed' sync status
 * @param treeId - Tree UUID
 * @param installationId - Installation UUID
 * @returns Retry results
 */
export async function retryFailedUploads(
    failedPhotos: PhotoWithMetadata[],
    treeId: string,
    installationId: string
): Promise<BulkUploadResult> {
    console.log(`[photoUploadService] Retrying ${failedPhotos.length} failed uploads...`);

    // Reset sync status to 'pending' before retry
    for (const photo of failedPhotos) {
        await updatePhotoSyncStatus(photo.id, 'pending');
    }

    return uploadTreePhotos(failedPhotos, treeId, installationId);
}
