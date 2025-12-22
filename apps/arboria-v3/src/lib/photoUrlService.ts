/**
 * Photo URL Service
 * Story 1.4: Utility service for generating and managing Supabase Storage URLs
 * 
 * Features:
 * - Generate signed URLs with configurable expiration
 * - Batch URL generation for multiple photos
 * - URL caching to avoid repeated API calls
 * - Error handling for missing/deleted photos
 */

import { supabase } from './supabase';

interface CachedUrl {
    url: string;
    expiresAt: number;
}

// In-memory cache for signed URLs
const urlCache = new Map<string, CachedUrl>();

/**
 * Generate a signed URL for a photo in Supabase Storage
 * 
 * @param storagePath - Full storage path (e.g., "{instalacao_id}/trees/{tree_id}/photos/{filename}")
 * @param expiresIn - Expiration time in seconds (default: 24 hours)
 * @returns Signed URL or placeholder on error
 */
export async function getPhotoSignedUrl(
    storagePath: string,
    expiresIn: number = 86400 // 24 hours
): Promise<string> {
    // Check cache first
    const cached = urlCache.get(storagePath);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.url;
    }

    try {
        const { data, error } = await supabase.storage
            .from('tree-photos')
            .createSignedUrl(storagePath, expiresIn);

        if (error) {
            console.error('Error generating signed URL:', error);
            return getPlaceholderImageUrl();
        }

        if (!data?.signedUrl) {
            console.warn('No signed URL returned for:', storagePath);
            return getPlaceholderImageUrl();
        }

        // Cache the URL (subtract 5 minutes for safety margin)
        const expiresAt = Date.now() + (expiresIn - 300) * 1000;
        urlCache.set(storagePath, {
            url: data.signedUrl,
            expiresAt,
        });

        return data.signedUrl;
    } catch (err) {
        console.error('Exception generating signed URL:', err);
        return getPlaceholderImageUrl();
    }
}

/**
 * Generate signed URLs for multiple photos in batch
 * 
 * @param storagePaths - Array of storage paths
 * @param expiresIn - Expiration time in seconds (default: 24 hours)
 * @returns Array of signed URLs (same order as input)
 */
export async function getBatchPhotoUrls(
    storagePaths: string[],
    expiresIn: number = 86400
): Promise<string[]> {
    return Promise.all(
        storagePaths.map(path => getPhotoSignedUrl(path, expiresIn))
    );
}

/**
 * Clear expired URLs from cache
 * Call this periodically to prevent memory leaks
 */
export function clearExpiredUrls(): void {
    const now = Date.now();
    for (const [path, cached] of urlCache.entries()) {
        if (cached.expiresAt <= now) {
            urlCache.delete(path);
        }
    }
}

/**
 * Clear all cached URLs
 * Useful for logout or installation switching
 */
export function clearAllCachedUrls(): void {
    urlCache.clear();
}

/**
 * Get placeholder image URL for missing photos
 * Returns a data URI with a simple tree icon
 */
function getPlaceholderImageUrl(): string {
    // Simple SVG tree icon as data URI
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSI0MCIgZmlsbD0iIzEwYjk4MSIvPjxyZWN0IHg9Ijg1IiB5PSIxMjAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzc4MzUwZiIvPjwvc3ZnPg==';
}

/**
 * Preload URLs for better UX
 * Call this when you know photos will be needed soon
 */
export async function preloadPhotoUrls(storagePaths: string[]): Promise<void> {
    await getBatchPhotoUrls(storagePaths);
}
