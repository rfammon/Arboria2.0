import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { PhotoWithMetadata, SyncStatus } from '@/types/photo';

interface PhotoDB extends DBSchema {
    photos: {
        key: string;  // photo.id (UUID)
        value: {
            id: string;
            blob: Blob;  // Compressed photo blob
            metadata: {
                filename: string;
                size: number;
                capturedAt: Date;
            };
            treeId?: string;
            syncStatus: SyncStatus;
            storageUrl?: string;  // Story 1.3: Supabase Storage URL
            uploadedAt?: Date;
            uploadError?: string;
        };
        indexes: { 'by-tree': string; 'by-sync-status': string };
    };
}

let db: IDBPDatabase<PhotoDB> | null = null;

/**
 * Initialize IndexedDB for offline photo storage
 * Story 1.2 AC2: Photos stored in IndexedDB immediately when offline
 * 
 * @returns IDB database instance
 */
export async function initPhotoStorage(): Promise<IDBPDatabase<PhotoDB>> {
    if (db) return db;

    db = await openDB<PhotoDB>('arboria-photos', 1, {
        upgrade(database) {
            if (!database.objectStoreNames.contains('photos')) {
                const store = database.createObjectStore('photos', { keyPath: 'id' });
                // Create index for querying by treeId
                store.createIndex('by-tree', 'treeId');
                // Create index for querying pending photos
                store.createIndex('by-sync-status', 'syncStatus');
            }
        },
    });

    return db;
}

/**
 * Save photo to IndexedDB for offline storage
 * AC2: Photos are stored in IndexedDB immediately when offline
 * 
 * @param photo - Photo with metadata to save
 * @returns Storage key (photo.id)
 */
export async function savePhotoLocally(
    photo: PhotoWithMetadata
): Promise<string> {
    const database = await initPhotoStorage();

    if (!photo.file) {
        throw new Error('Cannot save photo locally: missing file blob');
    }

    await database.put('photos', {
        id: photo.id,
        blob: photo.file,
        metadata: {
            filename: photo.file.name,
            size: photo.metadata.compressedSize,
            capturedAt: photo.metadata.capturedAt,
        },
        treeId: photo.treeId,
        syncStatus: photo.syncStatus,
        uploadedAt: photo.uploadedAt,
        uploadError: photo.uploadError,
    });

    return photo.id;
}

/**
 * Retrieve photo blob from IndexedDB
 * 
 * @param photoId - Photo UUID
 * @returns Photo blob or null if not found
 */
export async function getPhotoFromLocal(photoId: string): Promise<Blob | null> {
    const database = await initPhotoStorage();
    const photoData = await database.get('photos', photoId);
    return photoData?.blob ?? null;
}

/**
 * Retrieve full photo data from IndexedDB
 * 
 * @param photoId - Photo UUID
 * @returns Photo data or null
 */
export async function getPhotoDataFromLocal(photoId: string): Promise<PhotoDB['photos']['value'] | null> {
    const database = await initPhotoStorage();
    return (await database.get('photos', photoId)) ?? null;
}

/**
 * Delete photo from IndexedDB
 * 
 * @param photoId - Photo UUID
 */
export async function deletePhotoFromLocal(photoId: string): Promise<void> {
    const database = await initPhotoStorage();
    await database.delete('photos', photoId);
}

/**
 * Get all photos for a specific tree
 * 
 * @param treeId - Tree UUID
 * @returns Array of photo data
 */
export async function getPhotosForTree(treeId: string): Promise<PhotoDB['photos']['value'][]> {
    const database = await initPhotoStorage();
    const index = database.transaction('photos').store.index('by-tree');
    return await index.getAll(treeId);
}

/**
 * Get all pending photos that need to be synced
 * Used by background sync service in Story 1.3
 * 
 * @returns Array of photo data with 'pending' status
 */
export async function getPendingPhotos(): Promise<PhotoDB['photos']['value'][]> {
    const database = await initPhotoStorage();
    const index = database.transaction('photos').store.index('by-sync-status');
    return await index.getAll('pending');
}

/**
 * Update sync status for a photo
 * Story 1.3: AC1 - Update IndexedDB with Storage URL
 * 
 * @param photoId - Photo UUID
 * @param status - New sync status
 * @param storageUrl - Optional Supabase Storage URL
 * @param error - Optional error message if status is 'failed'
 */
export async function updatePhotoSyncStatus(
    photoId: string,
    status: SyncStatus,
    storageUrl?: string,
    error?: string
): Promise<void> {
    const database = await initPhotoStorage();
    const photoData = await database.get('photos', photoId);

    if (!photoData) {
        throw new Error(`Photo ${photoId} not found in IndexedDB`);
    }

    await database.put('photos', {
        ...photoData,
        syncStatus: status,
        storageUrl: storageUrl || photoData.storageUrl,
        uploadedAt: status === 'synced' ? new Date() : photoData.uploadedAt,
        uploadError: error,
    });
}

/**
 * Get IndexedDB storage quota usage
 * Used for Story 1.5 (quota monitoring)
 * 
 * @returns Storage estimate {usage, quota, percentage}
 */
export async function getStorageUsage(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
}> {
    if (!navigator.storage || !navigator.storage.estimate) {
        return { usage: 0, quota: 0, percentage: 0 };
    }

    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage ?? 0;
    const quota = estimate.quota ?? 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentage };
}

/**
 * Delete all synced photos from IndexedDB to free up space
 * Keeps pending photos for later sync
 * Used for Story 1.5 (cleanup)
 * 
 * @returns Number of photos deleted
 */
export async function cleanupSyncedPhotos(): Promise<number> {
    const database = await initPhotoStorage();
    const allPhotos = await database.getAll('photos');

    let deletedCount = 0;

    for (const photo of allPhotos) {
        if (photo.syncStatus === 'synced') {
            await database.delete('photos', photo.id);
            deletedCount++;
        }
    }

    return deletedCount;
}

/**
 * Get all photos from IndexedDB
 * Used for Epic 5: Data Backup
 * 
 * @returns Array of all photo data
 */
export async function getAllPhotos(): Promise<PhotoDB['photos']['value'][]> {
    const database = await initPhotoStorage();
    return await database.getAll('photos');
}
