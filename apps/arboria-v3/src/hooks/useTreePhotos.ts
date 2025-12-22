/**
 * useTreePhotos Hook
 * Story 1.4: React Query hook for fetching tree photos
 * 
 * Features:
 * - Fetch photos from tree_photos table
 * - Generate signed URLs for display
 * - React Query caching (5 minute stale time)
 * - Offline fallback to IndexedDB
 * - Optimistic updates support
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getPhotoSignedUrl } from '../lib/photoUrlService';
import { getPhotosForTree } from '../lib/photoStorage';
import type { TreePhotoWithUrl } from '../types/photo';

interface UseTreePhotosOptions {
    limit?: number;
    enabled?: boolean;
}

/**
 * Fetch tree photos from Supabase with signed URLs
 * 
 * @param treeId - Tree UUID
 * @param options - Query options (limit, enabled)
 * @returns React Query result with photos array
 */
export function useTreePhotos(treeId: string, options: UseTreePhotosOptions = {}) {
    const { limit, enabled = true } = options;

    return useQuery({
        queryKey: ['tree-photos', treeId, limit],
        queryFn: async (): Promise<TreePhotoWithUrl[]> => {
            try {
                // Fetch photos from Supabase (without user join - auth.users is in different schema)
                let query = supabase
                    .from('tree_photos')
                    .select('*')
                    .eq('tree_id', treeId)
                    .order('display_order', { ascending: true });

                if (limit) {
                    query = query.limit(limit);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('Error fetching tree photos:', error);
                    // Fallback to IndexedDB for offline support
                    return await fetchPhotosFromIndexedDB(treeId, limit);
                }

                if (!data || data.length === 0) {
                    return [];
                }

                // Generate signed URLs for all photos
                const photosWithUrls = await Promise.all(
                    data.map(async (photo: any) => {
                        const signedUrl = await getPhotoSignedUrl(photo.storage_path);

                        // Extract uploader name from user metadata
                        const uploaderName = photo.uploader?.raw_user_meta_data?.full_name
                            || photo.uploader?.email?.split('@')[0]
                            || 'Unknown';

                        return {
                            ...photo,
                            signedUrl,
                            uploaderName,
                        } as TreePhotoWithUrl;
                    })
                );

                return photosWithUrls;
            } catch (err) {
                console.error('Exception fetching tree photos:', err);
                // Fallback to IndexedDB
                return await fetchPhotosFromIndexedDB(treeId, limit);
            }
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: enabled && !!treeId,
    });
}

/**
 * Fallback: Fetch photos from IndexedDB when offline
 * 
 * @param treeId - Tree UUID
 * @param limit - Optional limit
 * @returns Array of photos with local blob URLs
 */
async function fetchPhotosFromIndexedDB(
    treeId: string,
    limit?: number
): Promise<TreePhotoWithUrl[]> {
    try {
        const localPhotos = await getPhotosForTree(treeId);

        if (!localPhotos || localPhotos.length === 0) {
            return [];
        }

        const photos = limit ? localPhotos.slice(0, limit) : localPhotos;

        return photos.map(photo => {
            // Create local blob URL for offline viewing
            const signedUrl = URL.createObjectURL(photo.blob);

            return {
                id: photo.id,
                tree_id: treeId,
                instalacao_id: '', // Not available in IndexedDB
                storage_path: '',
                filename: photo.metadata.filename,
                file_size: photo.metadata.size,
                mime_type: 'image/jpeg',
                captured_at: photo.metadata.capturedAt.toISOString(),
                uploaded_by: '',
                uploaded_at: photo.uploadedAt?.toISOString() || '',
                display_order: 0,
                created_at: '',
                updated_at: '',
                signedUrl,
                uploaderName: 'Offline',
            } as TreePhotoWithUrl;
        });
    } catch (err) {
        console.error('Error fetching from IndexedDB:', err);
        return [];
    }
}

/**
 * Get the count of photos for a tree
 * Lightweight query for badges/indicators
 */
export function useTreePhotoCount(treeId: string) {
    return useQuery({
        queryKey: ['tree-photo-count', treeId],
        queryFn: async (): Promise<number> => {
            const { count, error } = await supabase
                .from('tree_photos')
                .select('*', { count: 'exact', head: true })
                .eq('tree_id', treeId);

            if (error) {
                console.error('Error counting photos:', error);
                return 0;
            }

            return count || 0;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!treeId,
    });
}
