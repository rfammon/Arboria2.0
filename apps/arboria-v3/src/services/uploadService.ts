import { supabase } from '../lib/supabase';

export interface PhotoMetadata {
    file_size: number;
    mime_type: string;
    gps_latitude: number | null;
    gps_longitude: number | null;
    captured_at: string;
    uploaded_by: string;
}

export interface UploadResult {
    success: boolean;
    error?: any;
    storagePath?: string;
}

export const uploadService = {
    /**
     * Uploads a photo to storage and records it in the database.
     * Handles cleanup if database insertion fails.
     */
    async uploadTreePhoto(
        file: Blob | File,
        treeId: string,
        installationId: string,
        storagePath: string,
        filename: string,
        metadata: PhotoMetadata
    ): Promise<UploadResult> {
        try {
            // 1. Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('tree-photos')
                .upload(storagePath, file, {
                    contentType: metadata.mime_type || 'image/jpeg',
                    upsert: false
                });

            if (uploadError) {
                // If it's a duplicate, we might want to proceed or handle it
                if (!uploadError.message.includes('Duplicate') && !uploadError.message.includes('already exists')) {
                    return { success: false, error: uploadError };
                }
            }

            // 2. Insert into Database
            const { error: dbError } = await supabase
                .from('tree_photos')
                .insert({
                    tree_id: treeId,
                    instalacao_id: installationId,
                    storage_path: storagePath,
                    filename: filename,
                    file_size: metadata.file_size,
                    mime_type: metadata.mime_type,
                    gps_latitude: metadata.gps_latitude,
                    gps_longitude: metadata.gps_longitude,
                    captured_at: metadata.captured_at,
                    uploaded_by: metadata.uploaded_by,
                    display_order: 0
                });

            if (dbError) {
                // Critical: Rollback storage upload if DB entry fails
                // But only if we actually just uploaded it (and didn't hit a duplicate)
                if (dbError.code !== '23505') { // 23505 is unique violation, might mean it's already there
                    await supabase.storage.from('tree-photos').remove([storagePath]);
                    return { success: false, error: dbError };
                }
            }

            return { success: true, storagePath };
        } catch (error) {
            console.error('[uploadService] Unexpected error:', error);
            return { success: false, error };
        }
    }
};
