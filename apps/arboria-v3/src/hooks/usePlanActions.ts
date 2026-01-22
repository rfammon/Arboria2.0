import { useState, useEffect } from 'react';
import { executionService } from '../services/executionService';
import { InstallationService } from '../lib/installationService';
import { useAuth } from '../context/AuthContext';
import { usePlans } from './usePlans';
import { useToast } from './use-toast';
import type { InterventionPlan } from '../types/plan';

export function usePlanActions(plan: InterventionPlan, onBack: () => void, onUpdate?: () => void) {
    const { deletePlan } = usePlans();
    const { toast } = useToast();
    const { user, activeInstallation } = useAuth();

    // Dialog Visibility States
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [showReopenDialog, setShowReopenDialog] = useState(false);

    // Loading States
    const [isDeleting, setIsDeleting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isReopening, setIsReopening] = useState(false);

    // Action Data States
    const [members, setMembers] = useState<{ user_id: string, nome: string }[]>([]);
    const [selectedAssignee, setSelectedAssignee] = useState<string>("none");
    const [reopenReason, setReopenReason] = useState("");
    const [reopenDate, setReopenDate] = useState("");
    const [selectedWoId, setSelectedWoId] = useState<string | null>(null);

    // Load members when assign dialog opens
    useEffect(() => {
        if (showAssignDialog && activeInstallation) {
            InstallationService.getProjectMembers(activeInstallation.id)
                .then(setMembers)
                .catch(console.error);
        }
    }, [showAssignDialog, activeInstallation]);

    const handleOpenGenerateDialog = () => {
        if (!plan.tree) {
            toast({
                title: 'Impossível Gerar OS',
                description: 'Este plano não está vinculado a uma árvore válida.',
                variant: 'destructive',
            });
            return;
        }
        setShowAssignDialog(true);
    };

    const handleConfirmGeneration = async () => {
        if (!user) return;

        setIsGenerating(true);
        try {
            const assigneeId = selectedAssignee === "none" ? undefined : selectedAssignee;
            await executionService.createWorkOrderFromPlan(plan.id, user.id, assigneeId);

            toast({
                title: 'Ordem de Serviço Gerada!',
                description: assigneeId
                    ? 'A tarefa foi criada e atribuída ao usuário selecionado.'
                    : 'A tarefa foi criada e está disponível para a equipe (sem dono).',
            });
            setShowAssignDialog(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro ao gerar OS',
                description: error instanceof Error ? error.message : 'Erro desconhecido',
                variant: 'destructive'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpenReopenDialog = (woId: string) => {
        setSelectedWoId(woId);
        setReopenReason("");
        setReopenDate(new Date().toISOString().split('T')[0]);
        setShowReopenDialog(true);
    };

    const handleConfirmReopen = async () => {
        if (!selectedWoId || !reopenReason.trim()) {
            toast({
                title: 'Campos Obrigatórios',
                description: 'Por favor, informe o motivo da reabertura.',
                variant: 'destructive'
            });
            return;
        }

        setIsReopening(true);
        try {
            const newDate = reopenDate ? new Date(reopenDate) : undefined;
            const res = await executionService.reopenWorkOrder(selectedWoId, reopenReason, newDate, newDate);

            if (res.success) {
                toast({
                    title: 'Ordem de Serviço Reaberta',
                    description: res.message,
                });
                setShowReopenDialog(false);
                if (onUpdate) onUpdate();
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            toast({
                title: 'Erro ao reabrir',
                description: error instanceof Error ? error.message : 'Falha desconhecida',
                variant: 'destructive'
            });
        } finally {
            setIsReopening(false);
        }
    };

    const handleDeleteWorkOrder = async (woId: string) => {
        if (!confirm('Tem certeza que deseja apagar esta Ordem de Serviço? Esta ação é irreversível.')) return;

        try {
            await executionService.deleteWorkOrder(woId);
            toast({
                title: 'O.S. Removida',
                description: 'A ordem de serviço foi excluída com sucesso.',
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            toast({
                title: 'Erro ao remover',
                description: error instanceof Error ? error.message : 'Falha ao excluir O.S.',
                variant: 'destructive'
            });
        }
    };

    const handleDeletePlan = async () => {
        setIsDeleting(true);
        try {
            const success = await deletePlan(plan.id);
            if (success) {
                toast({
                    title: 'Plano excluído',
                    description: `O plano ${plan.plan_id} foi removido com sucesso.`,
                });
                onBack();
            } else {
                throw new Error('Falha ao excluir plano');
            }
        } catch (error) {
            toast({
                title: 'Erro ao excluir',
                description: error instanceof Error ? error.message : 'Erro desconhecido',
                variant: 'destructive'
            });
        } finally {
            setIsDeleting(false);
            setShowDeleteDialog(false);
        }
    };

    return {
        // Visibility States
        showDeleteDialog,
        setShowDeleteDialog,
        showAssignDialog,
        setShowAssignDialog,
        showReopenDialog,
        setShowReopenDialog,

        // Loading States
        isDeleting,
        isGenerating,
        isReopening,

        // Data States
        members,
        selectedAssignee,
        setSelectedAssignee,
        reopenReason,
        setReopenReason,
        reopenDate,
        setReopenDate,

        // Actions
        handleOpenGenerateDialog,
        handleConfirmGeneration,
        handleOpenReopenDialog,
        handleConfirmReopen,
        handleDeleteWorkOrder,
        handleDeletePlan,
    };
}
