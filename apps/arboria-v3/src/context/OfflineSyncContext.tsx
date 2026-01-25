import { createContext, useEffect, useState, useContext } from 'react';
import { useActionQueue } from '../stores/useActionQueue';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { offlineQueue } from '../lib/offlineQueue';
import { supabase } from '../lib/supabase';
import { ConflictResolutionModal } from '../components/features/ConflictResolutionModal';
import { useQueryClient } from '@tanstack/react-query';
import { uploadService } from '../services/uploadService';
import { shouldRetryNow } from '../lib/offline/retryStrategy';
import { recheckConnectivity } from '../lib/connectivity/heartbeat';
import { logger } from '../lib/logger';

interface OfflineSyncContextType {
    processQueue: () => Promise<void>;
    pendingPhotos: number;
    pendingActions: number;
    isSyncing: boolean;
    deadLetterCount: number;  // NEW: Track actions that exceeded max retries
}

const OfflineSyncContext = createContext<OfflineSyncContextType>({
    processQueue: async () => { },
    pendingPhotos: 0,
    pendingActions: 0,
    isSyncing: false,
    deadLetterCount: 0
});

export const useOfflineSync = () => useContext(OfflineSyncContext);

export const OfflineSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { queue, isProcessing: isActionProcessing, setProcessing: setActionProcessing, removeAction, updateAction } = useActionQueue();
    const [pendingPhotos, setPendingPhotos] = useState(0);
    const [isGenericSyncing, setIsGenericSyncing] = useState(false);
    const [deadLetterCount, setDeadLetterCount] = useState(0);  // NEW: Track DLQ

    // Conflict State
    const [conflict, setConflict] = useState<{ local: any; server: any; actionId: string } | null>(null);

    // Update photo count
    const updatePhotoCount = async () => {
        const count = await offlineQueue.getCount();
        setPendingPhotos(count);
    };

    // Monitor network and queue
    useEffect(() => {
        updatePhotoCount();
        const interval = setInterval(updatePhotoCount, 5000); // Check every 5s

        const handleOnline = () => {
            processQueue();
        };

        window.addEventListener('online', handleOnline);
        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(interval);
        };
    }, [queue, user]);

    const resolveConflict = (strategy: 'local' | 'server') => {
        if (!conflict) return;

        if (strategy === 'local') {
            // Force update: Add 'force' flag to payload so it skips conflict check next time
            logger.info({ module: 'OfflineSync', action: 'resolveConflict' }, 'Conflict resolved: Force Local');
            const action = queue.find(a => a.id === conflict.actionId);
            if (action) {
                updateAction(conflict.actionId, {
                    payload: { ...action.payload, force: true }
                });
            }
        } else {
            // Use Server: Discard local changes (remove action)
            logger.info({ module: 'OfflineSync', action: 'resolveConflict' }, 'Conflict resolved: Discard Local (Use Server)');
            removeAction(conflict.actionId);
        }

        setConflict(null);
        // Resume queue processing after a short delay
        setTimeout(() => processQueue(), 100);
    };

    const processQueue = async () => {
        // Check real connectivity (not just navigator.onLine)
        const connectivity = await recheckConnectivity();
        if (!connectivity.online) {
            logger.warn({ module: 'OfflineSync', action: 'processQueue' }, 'No connectivity - skipping sync');
            toast.error('Sem conexão com a internet.');
            return;
        }

        if (conflict) {
            logger.debug({ module: 'OfflineSync', action: 'processQueue' }, 'Conflict active - pausing sync');
            return;
        }

        // 1. Process Generic IDs Actions (Photos + Execution)
        setIsGenericSyncing(true);
        try {
            const actions = await offlineQueue.getAll();
            if (actions.length > 0) {
                logger.info({ module: 'OfflineSync', action: 'processQueue' }, `Processing ${actions.length} generic actions`);
                toast.loading(`Sincronizando ${actions.length} ações pendentes...`);

                // Dynamic import once per sync cycle, not per action
                const { executionService } = await import('../services/executionService');

                for (const action of actions) {
                    // Max retry limit: Move to Dead Letter Queue
                    if (action.retryCount >= 5) {
                        logger.warn({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                            `Action exceeded max retries (${action.retryCount}) - moving to DLQ`);
                        await offlineQueue.remove(action.id);
                        setDeadLetterCount(prev => prev + 1);
                        continue;
                    }

                    // Backoff strategy: Skip if not ready for retry
                    if (!shouldRetryNow(action)) {
                        logger.debug({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                            `Action not ready for retry (attempt ${action.retryCount})`);
                        continue;
                    }

                    try {
                        logger.debug({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                            `Processing generic action: ${action.type}`);

                        // Mark attempt
                        action.lastAttempt = new Date();
                        action.retryCount = (action.retryCount || 0);

                        switch (action.type) {
                            case 'SYNC_PHOTO': {
                                const photo = action.payload;
                                const uploadResult = await uploadService.uploadTreePhoto(
                                    photo.file,
                                    photo.treeId,
                                    photo.installationId,
                                    photo.storagePath,
                                    photo.filename,
                                    photo.metadata
                                );

                                if (!uploadResult.success) {
                                    throw uploadResult.error;
                                }
                                break;
                            }
                            case 'START_TASK':
                                await executionService.startTask(action.payload.taskId, action.payload.location);
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
                                await executionService.addEvidence(
                                    action.payload.taskId,
                                    action.payload.stage,
                                    action.payload.photoUrl,
                                    action.payload.metadata,
                                    action.payload.notes,
                                    action.payload.location
                                );
                                break;
                            case 'COMPLETE_TASK':
                                await executionService.completeTask(action.payload.taskId, { notes: action.payload.notes });
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

                        // Success - remove from queue
                        logger.info({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                            `Action ${action.type} completed successfully`);
                        await offlineQueue.remove(action.id);

                    } catch (err) {
                        const newRetryCount = (action.retryCount || 0) + 1;
                        logger.error({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                            `Failed to process action ${action.id} (attempt ${newRetryCount}/5)`, err);
                        
                        // Update retry count and lastAttempt in the queue
                        await offlineQueue.update({
                            ...action,
                            retryCount: newRetryCount,
                            lastAttempt: new Date()
                        });
                    }
                }

                await updatePhotoCount();
                toast.dismiss();
            }
        } catch (error) {
            logger.error({ module: 'OfflineSync', action: 'processQueue' }, 'Generic sync error', error);
        } finally {
            setIsGenericSyncing(false);
        }

        // 2. Process Tree Actions (Zustand Queue)
        if (isActionProcessing || queue.length === 0) return;

        setActionProcessing(true);
        try {
            logger.info({ module: 'OfflineSync', action: 'processQueue' }, `Processing ${queue.length} tree actions`);

            const currentQueue = queue;
            let conflictFound = false;
            let dlqCount = 0;

            for (const action of currentQueue) {
                if (conflictFound) break;
                
                // Max retry limit: Move to Dead Letter Queue
                if (action.retryCount >= 5) {
                    logger.warn({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                        `Tree action exceeded max retries (${action.retryCount}) - moving to DLQ`);
                    removeAction(action.id);
                    dlqCount++;
                    continue;
                }

                // Backoff strategy: Skip if not ready for retry
                if (!shouldRetryNow(action)) {
                    logger.debug({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                        `Tree action not ready for retry (attempt ${action.retryCount})`);
                    continue;
                }

                try {
                    // Mark attempt timestamp
                    updateAction(action.id, { lastAttempt: new Date() });

                    let success = false;

                    switch (action.type) {
                        case 'CREATE_TREE': {
                            const { error } = await supabase
                                .from('arvores')
                                .insert(action.payload)
                                .select()
                                .single();
                            if (error) throw error;
                            success = true;
                            break;
                        }
                        case 'UPDATE_TREE': {
                            const { id, data, force } = action.payload;
                            if (!force && data.original_updated_at) {
                                const { data: serverTree, error: fetchError } = await supabase
                                    .from('arvores')
                                    .select('*')
                                    .eq('id', id)
                                    .single();

                                if (!fetchError && serverTree) {
                                    const serverTime = new Date(serverTree.updated_at).getTime();
                                    const localTime = new Date(data.original_updated_at).getTime();

                                    if (serverTime > localTime) {
                                        logger.warn({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                                            'Conflict detected - server newer than local');
                                        setConflict({
                                            local: data,
                                            server: serverTree,
                                            actionId: action.id
                                        });
                                        conflictFound = true;
                                        break;
                                    }
                                }
                            }
                            if (conflictFound) break;

                            const { error } = await supabase
                                .from('arvores')
                                .update(data)
                                .eq('id', id);

                            if (error) throw error;
                            success = true;
                            break;
                        }
                        case 'DELETE_TREE': {
                            const { error } = await supabase
                                .from('arvores')
                                .delete()
                                .eq('id', action.payload.id);
                            if (error) throw error;
                            success = true;
                            break;
                        }
                    }

                    if (conflictFound) break;

                    if (success) {
                        logger.info({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                            `Tree action ${action.type} completed successfully`);
                        removeAction(action.id);
                    }

                } catch (err) {
                    const newRetryCount = (action.retryCount || 0) + 1;
                    logger.error({ module: 'OfflineSync', action: 'processQueue', actionId: action.id }, 
                        `Failed to process tree action ${action.id} (attempt ${newRetryCount}/5)`, err);
                    updateAction(action.id, { retryCount: newRetryCount });
                }
            }

            if (dlqCount > 0) {
                setDeadLetterCount(prev => prev + dlqCount);
                toast.error(`${dlqCount} ações falharam após múltiplas tentativas.`);
            }

            if (!conflictFound && currentQueue.length > 0) {
                queryClient.invalidateQueries({ queryKey: ['trees'] });
                if (!conflictFound) toast.success('Sincronização completada!');
            }

        } catch (error) {
            logger.error({ module: 'OfflineSync', action: 'processQueue' }, 'Tree sync error', error);
        } finally {
            setActionProcessing(false);
        }
    };

    return (
        <OfflineSyncContext.Provider value={{
            processQueue,
            pendingPhotos,
            isSyncing: isGenericSyncing || isActionProcessing,
            pendingActions: queue.length,
            deadLetterCount
        }}>
            {children}
            <ConflictResolutionModal
                isOpen={!!conflict}
                localData={conflict?.local || {}}
                serverData={conflict?.server || {}}
                onResolve={resolveConflict}
            />
        </OfflineSyncContext.Provider>
    );
};
