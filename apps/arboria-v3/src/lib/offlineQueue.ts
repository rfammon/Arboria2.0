import { get, set, del, keys } from 'idb-keyval';

// Action types based on execution requirements
export type OfflineActionType =
    | 'START_TASK'
    | 'LOG_PROGRESS'
    | 'ADD_EVIDENCE'
    | 'COMPLETE_TASK'
    | 'CREATE_ALERT'
    | 'BLOCK_TASK'
    | 'SYNC_PHOTO'; // Legacy/Specific photo sync if needed

export interface QueuedAction {
    id: string;
    type: OfflineActionType;
    payload: any; // Flexible payload to store arguments for service calls
    timestamp: number;
    retryCount: number;
}

const STORE_KEY_PREFIX = 'offline_action_';

export const offlineQueue = {
    /**
     * Adds an action to the offline queue
     */
    async add(type: OfflineActionType, payload: any): Promise<string> {
        const id = `${STORE_KEY_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const action: QueuedAction = {
            id,
            type,
            payload,
            timestamp: Date.now(),
            retryCount: 0
        };
        await set(id, action);
        return id;
    },

    /**
     * Gets all queued actions sorted by timestamp (FIFO)
     */
    async getAll(): Promise<QueuedAction[]> {
        const allKeys = await keys();
        const actionKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(STORE_KEY_PREFIX));

        const actions: QueuedAction[] = [];
        for (const key of actionKeys) {
            const item = await get<QueuedAction>(key);
            if (item) {
                actions.push(item);
            }
        }

        return actions.sort((a, b) => a.timestamp - b.timestamp);
    },

    /**
     * Removes an action from the queue
     */
    async remove(id: string): Promise<void> {
        await del(id);
    },

    /**
     * Updates an action (e.g. increment retry count)
     */
    async update(action: QueuedAction): Promise<void> {
        await set(action.id, action);
    },

    /**
     * Clears the entire queue
     */
    async clearAll(): Promise<void> {
        const allKeys = await keys();
        const actionKeys = allKeys.filter(k => typeof k === 'string' && k.startsWith(STORE_KEY_PREFIX));
        for (const key of actionKeys) {
            await del(key);
        }
    },

    /**
     * Gets the count of queued items
     */
    async getCount(): Promise<number> {
        const allKeys = await keys();
        return allKeys.filter(k => typeof k === 'string' && k.startsWith(STORE_KEY_PREFIX)).length;
    }
};
