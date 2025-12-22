import {
    Calendar,
    MapPin,
    AlertTriangle,
    MoreVertical,
    ArrowRight,
    Play,
    CheckCircle2,
    User,
    Navigation,
} from 'lucide-react';
import { openNavigationApp } from '@/utils/mapUtils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { executionService } from '@/services/executionService';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Task, TaskPriority, TaskStatus } from '@/types/execution';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskExecutionCardProps {
    task: Task;
    onStart?: () => void;
    onContinue?: () => void;
    onViewDetails?: () => void;
    onReportIssue?: () => void;
}

const PRIORITY_Styles: Record<TaskPriority, string> = {
    LOW: 'bg-slate-100 text-slate-800 border-slate-200',
    MEDIUM: 'bg-blue-100 text-blue-800 border-blue-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    CRITICAL: 'bg-red-100 text-red-800 border-red-200'
};

const STATUS_Styles: Record<TaskStatus, string> = {
    NOT_STARTED: 'text-slate-500 bg-slate-50',
    IN_PROGRESS: 'text-blue-600 bg-blue-50 border-blue-200',
    BLOCKED: 'text-red-600 bg-red-50 border-red-200',
    COMPLETED: 'text-green-600 bg-green-50 border-green-200',
    PENDING_APPROVAL: 'text-amber-600 bg-amber-50 border-amber-200',
    CANCELLED: 'text-slate-500 bg-slate-100 border-slate-200'
};

const STATUS_LABELS: Record<TaskStatus, string> = {
    NOT_STARTED: 'Não Iniciada',
    IN_PROGRESS: 'Em Andamento',
    BLOCKED: 'Bloqueada',
    COMPLETED: 'Concluída',
    PENDING_APPROVAL: 'Aguardando Aprovação',
    CANCELLED: 'Cancelada'
};

export function TaskExecutionCard({
    task,
    onStart,
    onContinue,
    onViewDetails,
    onReportIssue
}: TaskExecutionCardProps) {
    const { user, hasPermission } = useAuth();
    const { toast } = useToast();
    const [cancelReason, setCancelReason] = useState("");
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    // Approval Workflow State
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Gestor (manage_installation) or Mestre (global_access - checked by hasPermission)
    const canCancel = hasPermission('manage_installation');

    const handleCancelConfirm = async () => {
        if (!user || !cancelReason.trim()) return;

        setIsCancelling(true);
        try {
            await executionService.cancelTask(task.id, cancelReason, user.id);
            toast({
                title: 'Tarefa Cancelada',
                description: 'A ordem de serviço foi cancelada com sucesso.',
            });
            setShowCancelDialog(false);
            // Ideally trigger refresh, but parent needs to know. 
            // We can assume data will refresh via swr/query or parent poll.
            // But we don't have a callback refetch here.
            // If onReportIssue is generic, maybe onContinue calls refetch?
            // Actually, for immediate feedback, we might need a refresh.
            // For now, relies on user refreshing or parent auto-refresh.
            // Ideally should accept onUpdate callback.
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro ao cancelar',
                description: error instanceof Error ? error.message : 'Erro desconhecido',
                variant: 'destructive'
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const isCritical = task.priority === 'CRITICAL';
    const isInProgress = task.status === 'IN_PROGRESS';
    const isCompleted = task.status === 'COMPLETED';
    const isCancelled = task.status === 'CANCELLED';

    return (
        <Card className={cn(
            "overflow-hidden transition-all hover:shadow-md",
            isCritical ? "border-l-4 border-l-red-500" : "border-l-4 border-l-transparent"
        )}>
            <CardHeader className="p-4 pb-2 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={PRIORITY_Styles[task.priority]}>
                                {task.priority === 'CRITICAL' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {task.priority}
                            </Badge>
                            <Badge variant="outline" className={STATUS_Styles[task.status]}>
                                {STATUS_LABELS[task.status]}
                            </Badge>
                        </div>
                        {task.tree?.latitude && task.tree?.longitude && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openNavigationApp(task.tree!.latitude!, task.tree!.longitude!);
                                }}
                            >
                                <Navigation className="w-3 h-3 mr-1" />
                                Navegar
                            </Button>
                        )}
                        {task.rejection_reason && task.status === 'IN_PROGRESS' && (
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100 mt-1">
                                <strong>Rejeitado:</strong> {task.rejection_reason}
                            </div>
                        )}
                        {task.work_order?.description && task.work_order.description.includes('[Reabertura') && (
                            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mt-1">
                                <strong>Reaberta:</strong> {
                                    task.work_order.description.split('[Reabertura').pop()?.split(']').pop()?.replace(' Motivo: ', '').trim()
                                    || 'Verifique a descrição da O.S.'
                                }
                            </div>
                        )}
                        <h3 className="font-semibold text-lg leading-tight">
                            {task.intervention_type}
                        </h3>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onViewDetails}>
                                Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={onReportIssue}>
                                Reportar Problema
                            </DropdownMenuItem>
                            {canCancel && !isCancelled && !isCompleted && (
                                <DropdownMenuItem
                                    className="text-red-600 font-medium"
                                    onClick={() => setShowCancelDialog(true)}
                                >
                                    Cancelar Execução
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 pb-3 space-y-3">
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {task.tree && (
                        <div className="flex items-center gap-2">
                            Arv. {task.tree_id.substring(0, 8)}
                            <span>•</span>
                            <span className="truncate">{task.tree.especie}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">
                            {task.tree?.local || 'Localização não especificada'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>
                            Criado em {task.created_at && !isNaN(new Date(task.created_at).getTime())
                                ? format(new Date(task.created_at), "dd 'de' MMMM", { locale: ptBR })
                                : 'Data indisp.'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <span className={cn("truncate", !task.assigned_to && "text-amber-600 font-medium")}>
                            {task.assignee_name || (task.assigned_to ? 'Usuário Desconhecido' : 'Sem dono (Disponível)')}
                        </span>
                    </div>
                </div>

                {/* Progress Bar for existing tasks */}
                {(isInProgress || isCompleted) && (
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progresso</span>
                            <span>{task.progress_percent}%</span>
                        </div>
                        <Progress value={task.progress_percent} className="h-2" />
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-3">
                {task.status === 'NOT_STARTED' && (
                    <Button
                        className="w-full gap-2 bg-slate-900 hover:bg-slate-800"
                        onClick={onStart}
                    >
                        <Play className="w-4 h-4" />
                        Iniciar Execução
                    </Button>
                )}

                {task.status === 'IN_PROGRESS' && (
                    <Button
                        className="w-full gap-2"
                        onClick={onContinue}
                    >
                        <ArrowRight className="w-4 h-4" />
                        Continuar Tarefa
                    </Button>
                )}

                {task.status === 'COMPLETED' && (
                    <Button
                        variant="outline"
                        className="w-full gap-2 text-green-600 border-green-200 hover:bg-green-50"
                        onClick={onViewDetails}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Concluído
                    </Button>
                )}

                {task.status === 'PENDING_APPROVAL' && (
                    canCancel ? ( // Is Manager
                        <div className="flex w-full gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setShowRejectDialog(true)}
                                disabled={isProcessing}
                            >
                                Rejeitar
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={async () => {
                                    setIsProcessing(true);
                                    try {
                                        await executionService.approveTask(task.id, user!.id);
                                        toast({ title: "Tarefa Aprovada", description: "Tarefa marcada como concluída." });
                                        // Trigger refresh if needed
                                    } catch (e) {
                                        toast({ title: "Erro", description: "Falha ao aprovar tarefa.", variant: "destructive" });
                                    } finally {
                                        setIsProcessing(false);
                                    }
                                }}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Aprovando...' : 'Aprovar'}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            className="w-full gap-2 text-amber-600 bg-amber-50 border border-amber-200 cursor-not-allowed"
                            disabled
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Aguardando Aprovação
                        </Button>
                    )
                )}
            </CardFooter>

            {/* Cancel Dialog */}
            < Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog} >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar Ordem de Serviço</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja cancelar esta tarefa? Esta ação não pode ser desfeita e será registrada no histórico.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-2">
                        <Label htmlFor="cancel-reason">Justificativa do Cancelamento</Label>
                        <Textarea
                            id="cancel-reason"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Descreva o motivo do cancelamento..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)} disabled={isCancelling}>
                            Voltar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelConfirm}
                            disabled={isCancelling || !cancelReason.trim()}
                        >
                            {isCancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeitar Tarefa</DialogTitle>
                        <DialogDescription>
                            Informe o motivo da rejeição para que o executante possa corrigir. A tarefa voltará para "Em Andamento".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <Label htmlFor="reject-reason">Motivo da Rejeição</Label>
                        <Textarea
                            id="reject-reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Descreva o que precisa ser corrigido..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!rejectReason.trim()) return;
                                setIsProcessing(true);
                                try {
                                    await executionService.rejectTask(task.id, user!.id, rejectReason);
                                    toast({ title: "Tarefa Rejeitada", description: "A tarefa foi devolvida para correção." });
                                    setShowRejectDialog(false);
                                } catch (e) {
                                    toast({ title: "Erro", description: "Falha ao rejeitar tarefa.", variant: "destructive" });
                                } finally {
                                    setIsProcessing(false);
                                }
                            }}
                            disabled={isProcessing || !rejectReason.trim()}
                        >
                            {isProcessing ? 'Rejeitando...' : 'Confirmar Rejeição'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card >
    );
}
