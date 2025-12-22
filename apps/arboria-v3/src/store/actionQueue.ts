import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

// Custom IDB Storage for Zustand
const storage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};

export type OfflineAction = {
    id: string;
    type: 'CREATE_TREE' | 'UPDATE_TREE' | 'DELETE_TREE' | 'UPLOAD_PHOTO';
    payload: any;
    timestamp: number;
    retryCount: number;
};

type ActionQueueState = {
    queue: OfflineAction[];
    isProcessing: boolean;
    addAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => void;
    removeAction: (id: string) => void;
    updateAction: (id: string, updates: Partial<OfflineAction>) => void;
    setProcessing: (isProcessing: boolean) => void;
    clearQueue: () => void;
};

export const useActionQueue = create<ActionQueueState>()(
    persist(
        (set) => ({
            queue: [],
            isProcessing: false,
            addAction: (action) =>
                set((state) => ({
                    queue: [
                        ...state.queue,
                        {
                            ...action,
                            id: crypto.randomUUID(),
                            timestamp: Date.now(),
                            retryCount: 0,
                        },
                    ],
                })),
            removeAction: (id) =>
                set((state) => ({
                    queue: state.queue.filter((item) => item.id !== id),
                })),
            updateAction: (id, updates) =>
                set((state) => ({
                    queue: state.queue.map((item) =>
                        item.id === id ? { ...item, ...updates } : item
                    ),
                })),
            setProcessing: (isProcessing) => set({ isProcessing }),
            clearQueue: () => set({ queue: [] }),
        }),
        {
            name: 'arboria-offline-queue',
            storage: createJSONStorage(() => storage),
        }
    )
);
