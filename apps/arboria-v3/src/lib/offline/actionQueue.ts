import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'arboria-sync-queue';
const STORE_NAME = 'actions';
const DB_VERSION = 1;

export type ActionType = 'CREATE_TREE' | 'UPDATE_TREE' | 'DELETE_TREE';

export interface PendingAction {
    id: string; // Internal UUID for the action
    type: ActionType;
    payload: any;
    treeId: string;
    timestamp: number;
    status: 'pending' | 'syncing' | 'error';
    errorMessage?: string;
    retryCount: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('by-timestamp', 'timestamp');
                }
            },
        });
    }
    return dbPromise;
}

/**
 * Adds a new action to the queue
 */
export async function queueAction(type: ActionType, treeId: string, payload: any) {
    const db = await getDB();
    const action: PendingAction = {
        id: crypto.randomUUID(),
        type,
        treeId,
        payload,
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0
    };
    await db.put(STORE_NAME, action);
    return action;
}

/**
 * Retrieves all pending actions sorted by timestamp
 */
export async function getPendingActions(): Promise<PendingAction[]> {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-timestamp');
    return index.getAll();
}

/**
 * Updates an action status
 */
export async function updateActionStatus(id: string, status: PendingAction['status'], error?: string) {
    const db = await getDB();
    const action = await db.get(STORE_NAME, id);
    if (action) {
        action.status = status;
        if (error) {
            action.errorMessage = error;
            action.retryCount += 1;
        }
        await db.put(STORE_NAME, action);
    }
}

/**
 * Removes an action from the queue
 */
export async function removeAction(id: string) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}

/**
 * Clears the entire queue (DANGEROUS)
 */
export async function clearQueue() {
    const db = await getDB();
    await db.clear(STORE_NAME);
}
