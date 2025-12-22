import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useActionQueue } from '../store/actionQueue';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';


// Helper to check connectivity
const isOnline = () => navigator.onLine;

export const useTreeMutations = () => {
    const queryClient = useQueryClient();
    const { addAction } = useActionQueue();

    const createTree = useMutation({
        mutationFn: async (treeData: any) => {
            // Check offline status
            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing CREATE_TREE');
                const tempId = uuidv4();
                addAction({
                    type: 'CREATE_TREE',
                    payload: { ...treeData, id: tempId }, // Ensure ID for queue
                });
                return { id: tempId, status: 'queued' };
            }

            // Online execution
            const { data, error } = await supabase
                .from('arvores')
                .insert(treeData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            if (data?.status === 'queued') {
                toast.info('Sem internet. Árvore salva na fila offline.');
            } else {
                toast.success('Árvore criada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error: any) => {
            console.error('[useTreeMutations] Create error:', error);
            const message = error?.message || error?.details || 'Erro desconhecido';
            toast.error(`Erro ao criar árvore: ${message}`);
        }
    });

    const updateTree = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            // Sanitize payload: only keep fields defined in the schema and allow updates
            const { id: _, created_at, updated_at, ...updateLoad } = data;

            // Further filter to strictly what matches the arvores table expected update fields
            const allowedFields = [
                'especie', 'data', 'dap', 'altura', 'pontuacao', 'risco', 'observacoes',
                'latitude', 'longitude', 'easting', 'northing', 'utmzonenum', 'utmzoneletter',
                'failure_prob', 'impact_prob', 'target_category', 'residual_risk', 'risk_factors', 'mitigation'
            ];

            const sanitizedData = Object.keys(updateLoad)
                .filter(key => allowedFields.includes(key))
                .reduce((obj: any, key) => {
                    obj[key] = updateLoad[key];
                    return obj;
                }, {});

            console.log('[useTreeMutations] Payload to update:', sanitizedData);

            if (Object.keys(sanitizedData).length === 0) {
                console.warn('[useTreeMutations] No valid fields to update');
                return { id }; // Nothing to update
            }

            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing UPDATE_TREE');
                addAction({
                    type: 'UPDATE_TREE',
                    payload: { id, data: sanitizedData },
                });
                return { id, status: 'queued' };
            }

            const { data: updated, error } = await supabase
                .from('arvores')
                .update(sanitizedData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[useTreeMutations] Supabase Update Error:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
            return updated;
        },
        onSuccess: (data, variables) => {
            const id = data?.id || variables.id;
            if (data?.status === 'queued') {
                toast.info('Sem internet. Edição salva na fila offline.');
            } else {
                toast.success('Árvore atualizada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['tree', id] });
            }
        },
        onError: (error: any) => {
            console.error('[useTreeMutations] Update failed:', error);
            const message = error?.message || 'Erro desconhecido ao atualizar';
            const details = error?.details ? ` (${error.details})` : '';

            // Critical Debug: Force user visibility of the exact error
            window.alert(`ERRO AO SALVAR:\nMsg: ${message}\nCode: ${error?.code}\nDetails: ${details}\nHint: ${error?.hint}`);

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
