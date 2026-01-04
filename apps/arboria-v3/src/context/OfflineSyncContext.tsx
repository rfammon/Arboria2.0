import { createContext, useEffect, useState, useContext } from 'react';
import { useActionQueue } from '../store/actionQueue';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { offlineQueue } from '../lib/offlineQueue';
import { supabase } from '../lib/supabase';
import { ConflictResolutionModal } from '../components/features/ConflictResolutionModal';
import { useQueryClient } from '@tanstack/react-query';
import { uploadService } from '../services/uploadService';

interface OfflineSyncContextType {
    processQueue: () => Promise<void>;
    pendingPhotos: number;
    pendingActions: number;
    isSyncing: boolean;
}

const OfflineSyncContext = createContext<OfflineSyncContextType>({
    processQueue: async () => { },
    pendingPhotos: 0,
    pendingActions: 0,
    isSyncing: false
});

export const useOfflineSync = () => useContext(OfflineSyncContext);

export const OfflineSyncProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { queue, isProcessing: isActionProcessing, setProcessing: setActionProcessing, removeAction, updateAction } = useActionQueue();
    const [pendingPhotos, setPendingPhotos] = useState(0);
    const [isGenericSyncing, setIsGenericSyncing] = useState(false);

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
            console.log('[Sync] Resolving conflict: Force Local');
            const action = queue.find(a => a.id === conflict.actionId);
            if (action) {
                updateAction(conflict.actionId, {
                    payload: { ...action.payload, force: true }
                });
            }
        } else {
            // Use Server: Discard local changes (remove action)
            console.log('[Sync] Resolving conflict: Discard Local (Use Server)');
            removeAction(conflict.actionId);
        }

        setConflict(null);
        // Resume queue processing after a short delay
        setTimeout(() => processQueue(), 100);
    };

    const processQueue = async () => {
        if (!navigator.onLine) {
            toast.error('Sem conexão com a internet.');
            return;
        }

        if (conflict) {
            return;
        }

        // 1. Process Generic IDs Actions (Photos + Execution)
        setIsGenericSyncing(true);
        try {
            const actions = await offlineQueue.getAll();
            if (actions.length > 0) {
                toast.loading(`Sincronizando ${actions.length} ações pendentes...`);

                // Dynamic import once per sync cycle, not per action
                const { executionService } = await import('../services/executionService');

                for (const action of actions) {
                    try {
                        console.log(`[Sync] Processing generic action: ${action.type}`);

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
                        await offlineQueue.remove(action.id);

                    } catch (err) {
                        console.error(`[Sync] Failed to process action ${action.id}:`, err);
                        // Increment retry logic could be added here
                    }
                }

                await updatePhotoCount(); // Rename this to updatePendingCount maybe?
                toast.dismiss();
            }
        } catch (error) {
            console.error('[Sync] Generic sync error:', error);
        } finally {
            setIsGenericSyncing(false);
        }

        // 2. Process Tree Actions (Zustand Queue)
        if (isActionProcessing || queue.length === 0) return;

        setActionProcessing(true);
        try {
            console.log(`[Sync] Processing ${queue.length} tree actions...`);

            const currentQueue = queue;
            let conflictFound = false;

            for (const action of currentQueue) {
                if (conflictFound) break;
                if (action.retryCount >= 3) {
                    continue;
                }

                try {
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
                        removeAction(action.id);
                    }

                } catch (err) {
                    console.error(`[Sync] Failed to process tree action ${action.id}:`, err);
                    updateAction(action.id, { retryCount: (action.retryCount || 0) + 1 });
                }
            }

            if (!conflictFound && currentQueue.length > 0) {
                queryClient.invalidateQueries({ queryKey: ['trees'] });
                if (!conflictFound) toast.success('Sincronização completada!');
            }

        } catch (error) {
            console.error('[Sync] Tree sync error:', error);
        } finally {
            setActionProcessing(false);
        }
    };

    return (
        <OfflineSyncContext.Provider value={{
            processQueue,
            pendingPhotos,
            isSyncing: isGenericSyncing || isActionProcessing,
            pendingActions: queue.length
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
