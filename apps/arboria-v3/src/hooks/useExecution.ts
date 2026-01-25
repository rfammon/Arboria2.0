import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executionService } from '../services/executionService';
import type {
    TaskFilters,
    EvidenceStage,
    GeolocationPosition,
    AlertType
} from '../types/execution';
import { toast } from 'sonner';
import { offlineQueue } from '@/lib/offlineQueue';
import { useAuth } from '../context/AuthContext';

export const useExecutionKeys = {
    all: ['execution'] as const,
    tasks: (filters?: TaskFilters) => [...useExecutionKeys.all, 'tasks', filters] as const,
    myTasks: (userId: string, instalacaoId: string) => [...useExecutionKeys.all, 'my-tasks', userId, instalacaoId] as const,
    task: (id: string) => [...useExecutionKeys.all, 'task', id] as const,
    statistics: (instalacaoId: string) => [...useExecutionKeys.all, 'statistics', instalacaoId] as const,
};

/**
 * Hook to fetch tasks with filters
 */
export const useTasks = (filters?: TaskFilters) => {
    return useQuery({
        queryKey: useExecutionKeys.tasks(filters),
        queryFn: () => executionService.getTasks(filters),
    });
};

/**
 * Hook to fetch detailed tasks for a specific user (Executante view)
 */
export const useMyTasks = (userId: string | undefined, instalacaoId: string | undefined) => {
    return useQuery({
        queryKey: useExecutionKeys.myTasks(userId ?? '', instalacaoId ?? ''),
        queryFn: () => executionService.getMyTasks(userId!, instalacaoId!),
        enabled: !!userId && !!instalacaoId,
    });
};

/**
 * Hook to fetch a single task details
 */
export const useTask = (taskId: string | undefined) => {
    return useQuery({
        queryKey: useExecutionKeys.task(taskId ?? ''),
        queryFn: () => executionService.getTaskById(taskId!),
        enabled: !!taskId,
    });
};

/**
 * Hook to fetch execution statistics
 */
export const useExecutionStatistics = (instalacaoId: string | undefined) => {
    return useQuery({
        queryKey: useExecutionKeys.statistics(instalacaoId ?? ''),
        queryFn: () => executionService.getStatistics(instalacaoId!),
        enabled: !!instalacaoId,
        refetchInterval: 30000, // Refresh every 30s
    });
};

/**
 * Hook for task mutations (Start, Complete, Evidence, etc)
 */
export const useTaskMutations = () => {
    const queryClient = useQueryClient();
    const { user, activeInstallation } = useAuth();

    const startTask = useMutation({
        mutationFn: async ({ taskId, location }: { taskId: string; location?: GeolocationPosition }) => {
            if (!navigator.onLine) {
                await offlineQueue.add('START_TASK', { taskId, location });
                return { loaded: false, offline: true };
            }
            return executionService.startTask(taskId, location);
        },
        onSuccess: (data: any) => {
            if (data?.offline) {
                toast.info('Tarefa iniciada (Offline - será sincronizado)');
            } else {
                toast.success('Tarefa iniciada com sucesso');
            }
            queryClient.invalidateQueries({ queryKey: useExecutionKeys.all });
        },
        onError: (error) => {
            toast.error('Erro ao iniciar tarefa');
            console.error(error);
        }
    });

    const logProgress = useMutation({
        mutationFn: async ({ taskId, userId, percent, notes, location }: {
            taskId: string;
            userId: string;
            percent: number;
            notes?: string;
            location?: GeolocationPosition
        }) => {
            if (!navigator.onLine) {
                await offlineQueue.add('LOG_PROGRESS', { taskId, userId, percent, notes, location });
                return { loaded: false, offline: true };
            }
            return executionService.logProgress(taskId, userId, percent, notes, location);
        },
        onSuccess: (data: any) => {
            if (data?.offline) {
                toast.info('Progresso salvo (Offline)');
            } else {
                toast.success('Progresso registrado');
            }
            queryClient.invalidateQueries({ queryKey: useExecutionKeys.all });
        },
        onError: (error) => {
            toast.error('Erro ao registrar progresso');
            console.error(error);
        }
    });

    const addEvidence = useMutation({
        mutationFn: async ({ taskId, stage, photoUrl, metadata, notes, location }: {
            taskId: string;
            stage: EvidenceStage;
            photoUrl: string;
            metadata?: any;
            notes?: string;
            location?: GeolocationPosition
        }) => {
            if (!navigator.onLine) {
                // IMPORTANT: For implementation complexity with Blobs/Files, 
                // we treat photoUrl here. If it works with local Blob URLs in offlineQueue it's fine.
                // But typically we need to persist the Blob in IDB.
                // Assuming photoUrl is passed from previously persisted blob or valid local reference.
                await offlineQueue.add('ADD_EVIDENCE', { 
                    taskId, 
                    stage, 
                    photoUrl, 
                    metadata, 
                    notes, 
                    location, 
                    userId: user?.id,
                    instalacaoId: activeInstallation?.id 
                });
                return { loaded: false, offline: true };
            }
            return executionService.addEvidence(
                taskId, 
                stage, 
                photoUrl, 
                metadata, 
                notes, 
                location, 
                user?.id, 
                activeInstallation?.id
            );
        },
        onSuccess: (data: any) => {
            if (data?.offline) {
                toast.info('Evidência salva (Offline)');
            } else {
                toast.success('Evidência salva com sucesso');
            }
            queryClient.invalidateQueries({ queryKey: useExecutionKeys.all });
        },
        onError: (error) => {
            toast.error('Erro ao salvar evidência');
            console.error(error);
        }
    });

    const completeTask = useMutation({
        mutationFn: async ({ taskId, notes, progress }: { taskId: string; notes?: string; progress?: number }) => {
            if (!navigator.onLine) {
                await offlineQueue.add('COMPLETE_TASK', { taskId, notes, progress });
                return { loaded: false, offline: true };
            }
            return executionService.completeTask(taskId, { notes, progress });
        },
        onSuccess: (data: any) => {
            if (data?.offline) {
                toast.info('Conclusão salva (Offline)');
            } else {
                toast.success('Tarefa concluída!');
            }
            queryClient.invalidateQueries({ queryKey: useExecutionKeys.all });
        },
        onError: (error) => {
            toast.error('Erro ao concluir tarefa');
            console.error(error);
        }
    });

    const createAlert = useMutation({
        mutationFn: async ({ taskId, userId, type, message, location }: {
            taskId: string | null;
            userId: string;
            type: AlertType;
            message: string;
            location?: GeolocationPosition
        }) => {
            // Alerts should try to inform user if offline but maybe prioritize somehow?
            if (!navigator.onLine) {
                await offlineQueue.add('CREATE_ALERT', { taskId, userId, type, message, location });
                return { loaded: false, offline: true };
            }
            return executionService.createAlert(taskId, userId, type, message, location);
        },
        onSuccess: (data: any) => {
            if (data?.offline) {
                toast.warning('Alerta salvo (Offline - será enviado assim que possível)');
            } else {
                toast.success('Alerta enviado com prioridade!');
            }
        },
        onError: (error) => {
            toast.error('Erro ao enviar alerta');
            console.error(error);
        }
    });

    const blockTask = useMutation({
        mutationFn: async ({ taskId, reason }: { taskId: string; reason: string }) => {
            if (!navigator.onLine) {
                await offlineQueue.add('BLOCK_TASK', { taskId, reason });
                return { loaded: false, offline: true };
            }
            return executionService.blockTask(taskId, reason);
        },
        onSuccess: (data: any) => {
            if (data?.offline) {
                toast.info('Bloqueio salvo (Offline)');
            } else {
                toast.warning('Tarefa bloqueada');
            }
            queryClient.invalidateQueries({ queryKey: useExecutionKeys.all });
        },
        onError: (error) => {
            toast.error('Erro ao bloquear tarefa');
            console.error(error);
        }
    });

    return {
        startTask,
        logProgress,
        addEvidence,
        completeTask,
        createAlert,
        blockTask
    };
};
