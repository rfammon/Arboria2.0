import { useState, useEffect } from 'react';
import { offlineQueue } from '@/lib/offlineQueue';
import { toast } from 'sonner';
import { executionService } from '@/services/executionService';

export function useSyncStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Update pending count periodically
        const interval = setInterval(async () => {
            const count = await offlineQueue.getCount();
            setPendingCount(count);
        }, 3000); // Check every 3s

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    // Function to process the queue
    const syncNow = async () => {
        if (!isOnline || isSyncing) return;

        const count = await offlineQueue.getCount();
        if (count === 0) return;

        setIsSyncing(true);
        const toastId = toast.loading(`Sincronizando ${count} ações...`);

        try {
            const actions = await offlineQueue.getAll();

            for (const action of actions) {
                try {
                    // Process generic actions
                    switch (action.type) {
                        case 'START_TASK':
                            await executionService.startTask(
                                action.payload.taskId,
                                action.payload.location
                            );
                            break;
                        case 'LOG_PROGRESS':
                            await executionService.logProgress(
                                action.payload.taskId,
                                action.payload.userId,
                                action.payload.percent,
                                action.payload.notes,
                                action.payload.location
                            );
                            break;
                        case 'ADD_EVIDENCE':
                            // Handle Blob/File upload specially if needed
                            // For now assume payload has everything ready
                            await executionService.addEvidence(
                                action.payload.taskId,
                                action.payload.stage,
                                action.payload.photoUrl, // Note: This might be a blob URL or base64. 
                                // Ideally we stored the blob in IndexedDB. 
                                // The service needs to handle Blob upload if not standard URL.
                                action.payload.metadata,
                                action.payload.notes,
                                action.payload.location
                            );
                            break;
                        case 'COMPLETE_TASK':
                            await executionService.completeTask(
                                action.payload.taskId,
                                { notes: action.payload.notes }
                            );
                            break;
                        case 'CREATE_ALERT':
                            await executionService.createAlert(
                                action.payload.taskId,
                                action.payload.userId,
                                action.payload.type,
                                action.payload.message,
                                action.payload.location
                            );
                            break;
                    }

                    // If successful, remove from queue
                    await offlineQueue.remove(action.id);

                } catch (error) {
                    console.error(`Failed to process action ${action.id}`, error);
                    // Increment retry count?
                    // Continue to next action
                }
            }

            toast.success('Sincronização concluída', { id: toastId });
        } catch (error) {
            console.error('Sync failed', error);
            toast.error('Erro na sincronização', { id: toastId });
        } finally {
            setIsSyncing(false);
            const newCount = await offlineQueue.getCount();
            setPendingCount(newCount);
        }
    };

    // Auto-sync when coming back online
    useEffect(() => {
        if (isOnline && pendingCount > 0) {
            syncNow();
        }
    }, [isOnline]);

    return { isOnline, pendingCount, isSyncing, syncNow };
}
