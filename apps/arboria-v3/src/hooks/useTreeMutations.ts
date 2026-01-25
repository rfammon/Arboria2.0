import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useActionQueue } from '../stores/useActionQueue';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';
import { useErrorDialog } from './useErrorDialog';
import { getConnectivityStatus, recheckConnectivity } from '../lib/connectivity/heartbeat';
import { sanitizeTreeUpdate } from '../lib/validations/treeSchema';

// Helper to check connectivity with better reliability
const isOnline = () => {
    const status = getConnectivityStatus();
    return status.online && status.quality !== 'poor';
};

export const useTreeMutations = () => {
    const queryClient = useQueryClient();
    const { addAction } = useActionQueue();
    const { showError } = useErrorDialog();

    const createTree = useMutation({
        mutationFn: async (treeData: any) => {
            // Check offline status with improved connectivity check
            const connectivity = await recheckConnectivity();
            
            if (!connectivity.online || connectivity.quality === 'poor') {
                logger.info(
                    { module: 'useTreeMutations', action: 'createTree' },
                    'Offline or poor connection - queuing action'
                );
                const tempId = uuidv4();
                addAction({
                    type: 'CREATE_TREE',
                    payload: { ...treeData, id: tempId },
                });
                return { id: tempId, status: 'queued' };
            }

            try {
                // Get current user and installation from auth context
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    throw new Error('Usuário não autenticado');
                }

                // Get active installation from localStorage
                const activeInstallationId = localStorage.getItem('arboria_active_installation');
                if (!activeInstallationId) {
                    throw new Error('Nenhuma instalação ativa selecionada');
                }

                // Add required fields for RLS policy
                const payload = {
                    ...treeData,
                    user_id: user.id,
                    instalacao_id: activeInstallationId
                };

                logger.debug(
                    { module: 'useTreeMutations', action: 'createTree', userId: user.id },
                    'Creating tree with payload',
                    payload
                );

                // Online execution
                const { data, error } = await supabase
                    .from('arvores')
                    .insert(payload)
                    .select()
                    .single();

                if (error) throw error;
                return data;
                
            } catch (error: any) {
                // Fallback automático: Se falhar por erro de rede, coloca na fila
                if (error.message?.includes('network') || 
                    error.message?.includes('timeout') ||
                    error.code === 'PGRST301') {
                    
                    logger.warn(
                        { module: 'useTreeMutations', action: 'createTree' },
                        'Network error - auto-queuing action'
                    );
                    
                    const tempId = uuidv4();
                    addAction({
                        type: 'CREATE_TREE',
                        payload: { ...treeData, id: tempId },
                    });
                    
                    toast.info('Sem conexão. Árvore salva na fila offline.');
                    return { id: tempId, status: 'queued' };
                }
                
                // Outros erros (validação, RLS, etc) são lançados normalmente
                throw error;
            }
        },
        onSuccess: (data) => {
            if (data?.status !== 'queued') {
                toast.success('Árvore criada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error: any) => {
            logger.error(
                { module: 'useTreeMutations', action: 'createTree' },
                'Create tree failed',
                error
            );
            const message = error?.message || error?.details || 'Erro desconhecido';
            toast.error(`Erro ao criar árvore: ${message}`);
        }
    });

    const updateTree = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            // Sanitize payload using schema-based helper (auto-removes read-only fields)
            const sanitizedData = sanitizeTreeUpdate(data);

            logger.debug(
                { module: 'useTreeMutations', action: 'updateTree' },
                'Payload to update',
                sanitizedData
            );

            if (Object.keys(sanitizedData).length === 0) {
                logger.warn(
                    { module: 'useTreeMutations', action: 'updateTree' },
                    'No valid fields to update'
                );
                return { id }; // Nothing to update
            }

            const connectivity = await recheckConnectivity();
            
            if (!connectivity.online || connectivity.quality === 'poor') {
                logger.info(
                    { module: 'useTreeMutations', action: 'updateTree' },
                    'Offline - queuing UPDATE_TREE'
                );
                addAction({
                    type: 'UPDATE_TREE',
                    payload: { id, data: sanitizedData },
                });
                return { id, status: 'queued' };
            }

            try {
                const { data: updated, error } = await supabase
                    .from('arvores')
                    .update(sanitizedData)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    logger.error(
                        { module: 'useTreeMutations', action: 'updateTree' },
                        'Supabase update error',
                        {
                            code: error.code,
                            message: error.message,
                            details: error.details,
                            hint: error.hint
                        }
                    );
                    throw error;
                }
                return updated;
                
            } catch (error: any) {
                // Fallback automático para erros de rede
                if (error.message?.includes('network') || 
                    error.message?.includes('timeout') ||
                    error.code === 'PGRST301') {
                    
                    logger.warn(
                        { module: 'useTreeMutations', action: 'updateTree' },
                        'Network error - auto-queuing action'
                    );
                    
                    addAction({
                        type: 'UPDATE_TREE',
                        payload: { id, data: sanitizedData },
                    });
                    
                    toast.info('Sem conexão. Edição salva na fila offline.');
                    return { id, status: 'queued' };
                }
                
                throw error;
            }
        },
        onSuccess: (data, variables) => {
            const id = data?.id || variables.id;
            if (data?.status !== 'queued') {
                toast.success('Árvore atualizada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['tree', id] });
            }
        },
        onError: (error: any) => {
            logger.error(
                { module: 'useTreeMutations', action: 'updateTree' },
                'Update failed',
                error
            );
            
            // Mostra erro em dialog não-bloqueante
            showError(error, 'Erro ao Atualizar Árvore');
            
            const message = error?.message || 'Erro desconhecido ao atualizar';
            const details = error?.details ? ` (${error.details})` : '';
            toast.error(`Erro ao atualizar: ${message}${details}`);
        }
    });

    const deleteTree = useMutation({
        mutationFn: async (id: string) => {
            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing DELETE_TREE');
                addAction({
                    type: 'DELETE_TREE',
                    payload: { id }
                });
                return { id, status: 'queued' };
            }

            const { error } = await supabase
                .from('arvores')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id };
        },
        onSuccess: (data) => {
            if (data?.status === 'queued') {
                toast.info('Sem internet. Exclusão salva na fila offline.');
            } else {
                toast.success('Árvore removida!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error) => {
            console.error('[useTreeMutations] Delete error:', error);
            toast.error(`Erro ao remover: ${(error as Error).message}`);
        }
    });

    return {
        createTree,
        updateTree,
        deleteTree
    };
};
