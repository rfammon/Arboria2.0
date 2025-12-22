import { supabase } from '../lib/supabase';
import { photoCache, type CachedPhoto } from '../lib/photoCache';
import { compressPhoto, extractPhotoMetadata } from '../utils/photoCompression';
import { canStorePhoto } from '../utils/quotaMonitor';

/**
 * Photo Service - Supabase Integration
 * 
 * Handles photo upload, download, and deletion with RLS security.
 * Integrates with IndexedDB cache for offline-first functionality.
 * 
 * Story 1.3: Supabase Storage Integration with RLS
 */

const BUCKET_NAME = 'tree-photos';

export interface PhotoUploadOptions {
    treeId: string;
    instalacaoId: string;
    file: File;
    compress?: boolean;
}

export interface PhotoMetadata {
    id: string;
    tree_id: string;
    instalacao_id: string;
    storage_path: string;
    filename: string;
    file_size: number;
    mime_type: string;
    gps_latitude: number | null;
    gps_longitude: number | null;
    captured_at: string | null;
    uploaded_by: string;
    uploaded_at: string;
    display_order: number;
}

/**
 * Upload photo to Supabase Storage
 * 
 * AC1: Upload to path {instalacao_id}/trees/{tree_id}/photos/{filename}
 * AC2: RLS verifies user has access to installation
 * AC3: Metadata saved to tree_photos table
 */
export async function uploadPhoto(options: PhotoUploadOptions): Promise<PhotoMetadata> {
    const { treeId, instalacaoId, file, compress = true } = options;

    try {
        // Step 1: Check quota before processing
        const quotaCheck = await canStorePhoto(file.size);
        if (!quotaCheck.canStore) {
            throw new Error(quotaCheck.reason);
        }

        // Step 2: Compress photo if needed
        const processedFile = compress ? await compressPhoto(file) : file;

        // Step 3: Extract metadata
        const metadata = await extractPhotoMetadata(processedFile);

        // Step 4: Generate unique filename
        const fileExt = processedFile.name.split('.').pop() || 'jpg';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `${instalacaoId}/trees/${treeId}/photos/${filename}`;

        // Step 5: Cache offline first (hybrid strategy)
        const tempId = `temp-${Date.now()}`;
        const cachedPhoto: CachedPhoto = {
            id: tempId,
            treeId,
            instalacaoId,
            blob: processedFile,
            url: '', // Will be updated after upload
            syncStatus: 'pending',
            cachedAt: Date.now(),
            fileSize: processedFile.size,
        };

        await photoCache.addPhoto(cachedPhoto);

        // Step 6: Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(storagePath, processedFile, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Falha no upload: ${uploadError.message}`);
        }

        // Step 7: Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        // Step 8: Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

        // Step 9: Save metadata to database
        const photoMetadata = {
            tree_id: treeId,
            instalacao_id: instalacaoId,
            storage_path: uploadData.path,
            filename: filename,
            file_size: processedFile.size,
            mime_type: processedFile.type,
            gps_latitude: metadata.gpsLatitude || null,
            gps_longitude: metadata.gpsLongitude || null,
            captured_at: metadata.capturedAt?.toISOString() || null,
            uploaded_by: user.id,
            display_order: 0, // Will be updated by UI reordering
        };

        const { data: dbData, error: dbError } = await supabase
            .from('tree_photos')
            .insert(photoMetadata)
            .select()
            .single();

        if (dbError) {
            // Rollback: delete from storage
            await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
            throw new Error(`Falha ao salvar metadata: ${dbError.message}`);
        }

        // Step 10: Update cache with synced status
        await photoCache.updateSyncStatus(tempId, 'synced', urlData.publicUrl);

        return dbData as PhotoMetadata;
    } catch (error: any) {
        console.error('Photo upload failed:', error);
        throw error;
    }
}

/**
 * Get photos for a tree
 * 
 * AC: Hybrid cache - try IndexedDB first, fallback to Supabase
 */
export async function getPhotosForTree(treeId: string): Promise<PhotoMetadata[]> {
    try {
        // Query from database (RLS ensures security)
        const { data, error } = await supabase
            .from('tree_photos')
            .select('*')
            .eq('tree_id', treeId)
            .order('display_order', { ascending: true })
            .order('uploaded_at', { ascending: true });

        if (error) throw error;

        return (data || []) as PhotoMetadata[];
    } catch (error: any) {
        console.error('Failed to fetch photos:', error);

        // Fallback to cache if offline
        const cachedPhotos = await photoCache.getPhotosByTree(treeId);
        console.warn(`Using ${cachedPhotos.length} cached photos (offline mode)`);

        // Convert cached photos to PhotoMetadata format
        return cachedPhotos.map((cached) => ({
            id: cached.id,
            tree_id: cached.treeId,
            instalacao_id: cached.instalacaoId,
            storage_path: '',
            filename: '',
            file_size: cached.fileSize,
            mime_type: 'image/jpeg',
            gps_latitude: null,
            gps_longitude: null,
            captured_at: null,
            uploaded_by: '',
            uploaded_at: new Date(cached.cachedAt).toISOString(),
            display_order: 0,
        }));
    }
}

/**
 * Delete photo (with cascade from storage)
 * 
 * AC: Remove from storage AND database
 * Risk Mitigation: PM-02 Orphaned Photos
 */
export async function deletePhoto(photoId: string, storagePath: string): Promise<void> {
    try {
        // Step 1: Delete from database (cascade will handle metadata)
        const { error: dbError } = await supabase
            .from('tree_photos')
            .delete()
            .eq('id', photoId);

        if (dbError) throw dbError;

        // Step 2: Delete from storage
        const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([storagePath]);

        if (storageError) {
            console.warn('Storage delete failed:', storageError);
            // Non-critical - orphaned file in storage is better than orphaned metadata
        }

        // Step 3: Delete from cache
        await photoCache.deletePhoto(photoId);
    } catch (error: any) {
        console.error('Photo deletion failed:', error);
        throw error;
    }
}

/**
 * Delete all photos for a tree (cascade)
 * 
 * AC: Triggered when tree is deleted
 * Risk Mitigation: PM-02 Orphaned Photos
 */
export async function deletePhotosForTree(treeId: string): Promise<void> {
    try {
        // Step 1: Get all photos for tree
        const photos = await getPhotosForTree(treeId);

        // Step 2: Delete each photo (database cascade + storage cleanup)
        for (const photo of photos) {
            await deletePhoto(photo.id, photo.storage_path);
        }

        // Step 3: Clean cache
        await photoCache.deletePhotosByTree(treeId);
    } catch (error: any) {
        console.error('Failed to delete tree photos:', error);
        throw error;
    }
}

/**
 * Update photo display order
 * 
 * AC: Support drag-and-drop reordering in PhotoGallery
 */
export async function updatePhotoOrder(
    photoId: string,
    newOrder: number
): Promise<void> {
    try {
        const { error } = await supabase
            .from('tree_photos')
            .update({ display_order: newOrder })
            .eq('id', photoId);

        if (error) throw error;
    } catch (error: any) {
        console.error('Failed to update photo order:', error);
        throw error;
    }
}

/**
 * Sync pending cached photos to Supabase
 * 
 * AC: Auto-sync when online after offline photo capture
 */
export async function syncPendingPhotos(): Promise<{
    synced: number;
    failed: number;
}> {
    let synced = 0;
    let failed = 0;

    try {
        const pendingPhotos = await photoCache.getPendingPhotos();

        for (const cached of pendingPhotos) {
            try {
                // Re-upload using uploadPhoto
                const blob = cached.blob;
                const file = new File([blob], `photo-${cached.id}.jpg`, { type: blob.type });

                await uploadPhoto({
                    treeId: cached.treeId,
                    instalacaoId: cached.instalacaoId,
                    file,
                    compress: false, // Already compressed
                });

                synced++;
            } catch (error) {
                console.error(`Failed to sync photo ${cached.id}:`, error);
                failed++;
            }
        }

        return { synced, failed };
    } catch (error: any) {
        console.error('Sync failed:', error);
        return { synced, failed };
    }
}
