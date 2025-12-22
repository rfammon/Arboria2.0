import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'arboria-media-cache';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

interface CachedMedia {
    url: string;
    blob: Blob;
    timestamp: number;
    contentType: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'url' });
                }
            },
        });
    }
    return dbPromise;
}

/**
 * Saves a media blob to IndexedDB
 */
export async function saveMedia(url: string, blob: Blob, contentType: string) {
    const db = await getDB();
    const data: CachedMedia = {
        url,
        blob,
        contentType,
        timestamp: Date.now(),
    };
    await db.put(STORE_NAME, data);
}

/**
 * Retrieves a media blob from IndexedDB
 */
export async function getMedia(url: string): Promise<CachedMedia | undefined> {
    const db = await getDB();
    return db.get(STORE_NAME, url);
}

/**
 * Removes old media to stay within storage limits (LRU)
 * Current limit: 100 items for simplicity
 */
export async function cleanupMedia(limit = 100) {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);

    if (all.length > limit) {
        const toDelete = all
            .sort((a, b) => a.timestamp - b.timestamp)
            .slice(0, all.length - limit);

        const tx = db.transaction(STORE_NAME, 'readwrite');
        await Promise.all([
            ...toDelete.map(item => tx.store.delete(item.url)),
            tx.done
        ]);
    }
}
