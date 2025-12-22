/**
 * Photo Cache - IndexedDB Wrapper
 * 
 * Manages offline photo storage with LRU eviction and quota monitoring.
 * Used for offline-first photo capture in tree inventory.
 * 
 * Story 1.2: Photo Preview and Management
 * Story 1.5: IndexedDB Cache Layer
 */

const DB_NAME = 'arboria-photo-cache';
const DB_VERSION = 1;
const STORE_NAME = 'photos';

export interface CachedPhoto {
    id: string; // tree_photo id or temporary id
    treeId: string;
    instalacaoId: string;
    blob: Blob;
    url: string; // Supabase storage URL (if uploaded)
    syncStatus: 'pending' | 'synced' | 'error';
    cachedAt: number; // timestamp
    fileSize: number;
}

class PhotoCache {
    private db: IDBDatabase | null = null;

    /**
     * Initialize IndexedDB connection
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                reject(new Error('Falha ao abrir IndexedDB'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

                    // Indexes for efficient queries
                    store.createIndex('treeId', 'treeId', { unique: false });
                    store.createIndex('instalacaoId', 'instalacaoId', { unique: false });
                    store.createIndex('syncStatus', 'syncStatus', { unique: false });
                    store.createIndex('cachedAt', 'cachedAt', { unique: false });
                }
            };
        });
    }

    /**
     * Add photo to cache
     * 
     * AC: Store offline immediately
     */
    async addPhoto(photo: CachedPhoto): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.put(photo);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Falha ao adicionar foto ao cache'));
        });
    }

    /**
     * Get photo from cache by ID
     */
    async getPhoto(id: string): Promise<CachedPhoto | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(new Error('Falha ao buscar foto do cache'));
        });
    }

    /**
     * Get all photos for a tree
     * 
     * AC: Efficiently query photos by tree
     */
    async getPhotosByTree(treeId: string): Promise<CachedPhoto[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('treeId');

            const request = index.getAll(treeId);

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(new Error('Falha ao buscar fotos do cache'));
        });
    }

    /**
     * Get all pending photos (not yet synced)
     */
    async getPendingPhotos(): Promise<CachedPhoto[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('syncStatus');

            const request = index.getAll('pending');

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(new Error('Falha ao buscar fotos pendentes'));
        });
    }

    /**
     * Update photo sync status
     */
    async updateSyncStatus(
        id: string,
        status: 'pending' | 'synced' | 'error',
        url?: string
    ): Promise<void> {
        if (!this.db) await this.init();

        const photo = await this.getPhoto(id);
        if (!photo) throw new Error('Foto não encontrada no cache');

        photo.syncStatus = status;
        if (url) photo.url = url;

        await this.addPhoto(photo);
    }

    /**
     * Delete photo from cache
     */
    async deletePhoto(id: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Falha ao deletar foto do cache'));
        });
    }

    /**
     * Delete all photos for a tree (cascade)
     * 
     * AC: Prevent orphaned photos
     */
    async deletePhotosByTree(treeId: string): Promise<void> {
        const photos = await this.getPhotosByTree(treeId);

        for (const photo of photos) {
            await this.deletePhoto(photo.id);
        }
    }

    /**
     * Get total cache size in bytes
     */
    async getCacheSize(): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.getAll();

            request.onsuccess = () => {
                const photos = request.result as CachedPhoto[];
                const totalSize = photos.reduce((sum, photo) => sum + photo.fileSize, 0);
                resolve(totalSize);
            };

            request.onerror = () => reject(new Error('Falha ao calcular tamanho do cache'));
        });
    }

    /**
     * LRU Eviction - Remove oldest photos
     * 
     * AC: LRU eviction when quota exceeded
     */
    async evictOldest(count: number = 1): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('cachedAt');

            // Get all photos sorted by cached time (oldest first)
            const request = index.openCursor();
            let evicted = 0;

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;

                if (cursor && evicted < count) {
                    const photo = cursor.value as CachedPhoto;

                    // Only evict synced photos (don't lose pending uploads)
                    if (photo.syncStatus === 'synced') {
                        cursor.delete();
                        evicted++;
                    }

                    cursor.continue();
                } else {
                    resolve(evicted);
                }
            };

            request.onerror = () => reject(new Error('Falha ao evict fotos'));
        });
    }

    /**
     * Clear all cache (danger zone!)
     */
    async clearAll(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Falha ao limpar cache'));
        });
    }
}

// Singleton instance
export const photoCache = new PhotoCache();
