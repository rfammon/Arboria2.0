import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Calendar, User, Wrench, ShieldCheck, Clock, FileText, TreeDeciduous, Play, RotateCcw, AlertCircle, Navigation } from 'lucide-react';
import { openNavigationApp } from '../../utils/mapUtils';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { executionService } from '../../services/executionService';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { InstallationService } from '../../lib/installationService';
import type { InterventionPlan } from '../../types/plan';
import {
    formatDate,
    formatDateTime,
    getDaysUntilExecution,
    getUrgencyBadgeConfig,
    extractScheduleDate,
    extractScheduleEndDate,
    INTERVENTION_ICONS,
    INTERVENTION_COLORS,
    INTERVENTION_LABELS,
    getPlanDuration
} from '../../lib/planUtils';
import { usePlans } from '../../hooks/usePlans';
import { useToast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';

interface PlanDetailProps {
    plan: InterventionPlan;
    onBack: () => void;
    onEdit: (plan: InterventionPlan) => void;
    onUpdate?: () => void;
}

export function PlanDetail({ plan, onBack, onEdit, onUpdate }: PlanDetailProps) {
    const { deletePlan } = usePlans();
    const { toast } = useToast();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { user, activeInstallation, activeProfileNames } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [members, setMembers] = useState<{ user_id: string, nome: string }[]>([]);
    const [selectedAssignee, setSelectedAssignee] = useState<string>("none");

    // Reopen State
    const [showReopenDialog, setShowReopenDialog] = useState(false);
    const [reopenReason, setReopenReason] = useState("");
    const [reopenDate, setReopenDate] = useState("");
    const [isReopening, setIsReopening] = useState(false);
    const [selectedWoId, setSelectedWoId] = useState<string | null>(null);

    const isManager = activeProfileNames.split(', ').some(p => ['Gestor', 'Mestre', 'Planejador'].includes(p));

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
        setReopenDate(new Date().toISOString().split('T')[0]); // Default to today
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
            const res = await executionService.reopenWorkOrder(selectedWoId, reopenReason, newDate, newDate); // Using same date for start/due for simplicity or can add end date field

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
        if (!confirm('Tem certeza que deseja apagar esta Ordem de Serviço? This action is irreversible.')) return;

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

    const icon = INTERVENTION_ICONS[plan.intervention_type] || '📌';
    const color = INTERVENTION_COLORS[plan.intervention_type] || '#666';
    const daysUntil = getDaysUntilExecution(plan.schedule);
    const urgencyConfig = getUrgencyBadgeConfig(daysUntil);
    const totalDuration = getPlanDuration(plan.durations);

    const handleDelete = async () => {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-row flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="flex-shrink-0"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">{icon}</span>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold">
                                    {INTERVENTION_LABELS[plan.intervention_type]}
                                </h1>
                                <p className="text-sm text-muted-foreground">{plan.plan_id}</p>
                            </div>

                            {daysUntil !== null && (
                                <span
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap",
                                        urgencyConfig.cssClass
                                    )}
                                    style={{
                                        backgroundColor: urgencyConfig.color,
                                        color: 'white'
                                    }}
                                >
                                    {urgencyConfig.label}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 flex-shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
                    <Button
                        onClick={handleOpenGenerateDialog}
                        disabled={isGenerating || !plan.tree}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 lg:flex-none"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        {isGenerating ? 'Gerando...' : 'Gerar OS'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onEdit(plan)}
                        className="flex-1 lg:flex-none"
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                        className="flex-1 lg:flex-none"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                    </Button>
                </div>
            </div>

            {/* Tree Information Card */}
            <Card className="border-l-4 border-emerald-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TreeDeciduous className="w-5 h-5 text-emerald-600" />
                        Árvore Alvo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {plan.tree ? (
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
                                <TreeDeciduous className="w-8 h-8 opacity-30" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-semibold">{plan.tree.especie || 'Espécie não identificada'}</h3>
                                <p className="text-sm text-muted-foreground">ID: {plan.tree.id}</p>
                                {plan.tree.codigo && (
                                    <p className="text-sm text-muted-foreground">Código: {plan.tree.codigo}</p>
                                )}
                                {plan.tree.local && (
                                    <p className="text-sm">Local: {plan.tree.local}</p>
                                )}
                                {plan.tree.latitude && plan.tree.longitude && (
                                    <div className="pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                            onClick={() => openNavigationApp(plan.tree!.latitude!, plan.tree!.longitude!)}
                                        >
                                            <Navigation className="w-3.5 h-3.5 mr-2" />
                                            Navegar até a Árvore
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-yellow-600 flex items-center gap-2">
                            <span>Este plano ainda não está vinculado a uma árvore específica.</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Work Orders List */}
            {plan.work_orders && plan.work_orders.length > 0 && (
                <Card className="border-l-4 border-blue-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            Ordens de Serviço Relacionadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Pending / In Progress Group */}
                            {plan.work_orders.some(wo => wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED') && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Tarefas Pendentes ou em Andamento</h4>
                                    {plan.work_orders
                                        .filter(wo => wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED')
                                        .map((wo, idx) => (
                                            <div key={wo.id || idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-md border hover:border-primary/50 transition-colors group">
                                                <div className="flex flex-col cursor-pointer flex-1" onClick={() => navigate && (window.location.hash = `#/execution/${wo.id}`)}>
                                                    <span className="font-semibold text-sm group-hover:text-primary">O.S. #{wo.id ? wo.id.slice(0, 8) : 'N/A'}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={wo.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                                                            {wo.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Pendente'}
                                                        </Badge>
                                                        {wo.tasks && wo.tasks.length > 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {Math.round(wo.tasks.reduce((acc, t) => acc + (t.progress_percent || 0), 0) / wo.tasks.length)}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteWorkOrder(wo.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}

                            {/* Completed Group */}
                            {plan.work_orders.some(wo => wo.status === 'COMPLETED' || wo.status === 'CANCELLED') && (
                                <div className="space-y-3 pt-2">
                                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Tarefas Finalizadas</h4>
                                    {plan.work_orders
                                        .filter(wo => wo.status === 'COMPLETED' || wo.status === 'CANCELLED')
                                        .map((wo, idx) => (
                                            <div key={wo.id || idx} className="flex justify-between items-center p-3 bg-green-50/10 rounded-md border opacity-80 group">
                                                <div className="flex flex-col cursor-pointer flex-1" onClick={() => navigate && (window.location.hash = `#/execution/${wo.id}`)}>
                                                    <span className="font-semibold text-sm group-hover:text-primary">O.S. #{wo.id ? wo.id.slice(0, 8) : 'N/A'}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant={wo.status === 'COMPLETED' ? 'default' : 'destructive'}>
                                                            {wo.status === 'COMPLETED' ? 'Concluída' : 'Cancelada'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {isManager && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                                                            onClick={() => handleOpenReopenDialog(wo.id)}
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            Reabrir
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeleteWorkOrder(wo.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Justification Card (if exists) */}
            {plan.justification && (
                <Card className="border-l-4" style={{ borderLeftColor: color }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Justificativa
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{plan.justification}</p>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Schedule Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Cronograma
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Data de Início</p>
                            <p className="font-medium">{formatDate(extractScheduleDate(plan.schedule))}</p>
                        </div>

                        {extractScheduleEndDate(plan.schedule) && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Data de Término</p>
                                <p className="font-medium">{formatDate(extractScheduleEndDate(plan.schedule))}</p>
                            </div>
                        )}

                        {daysUntil !== null && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Status de Urgência</p>
                                <p className="font-medium" style={{ color: urgencyConfig.color }}>
                                    {daysUntil < 0
                                        ? `Atrasado (${Math.abs(daysUntil)} dias)`
                                        : daysUntil === 0
                                            ? 'Programado para hoje'
                                            : `Faltam ${daysUntil} dias`}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Responsible Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Responsável
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Nome</p>
                            <p className="font-medium">{plan.responsible || 'Não definido'}</p>
                        </div>

                        {plan.responsible_title && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Cargo/Função</p>
                                <p className="font-medium">{plan.responsible_title}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Duration */}
                {plan.durations && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Duração Estimada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {plan.durations.mobilization !== undefined && plan.durations.mobilization > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Mobilização</span>
                                    <span className="font-medium">{plan.durations.mobilization} dia(s)</span>
                                </div>
                            )}

                            {plan.durations.execution !== undefined && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Execução</span>
                                    <span className="font-medium">{plan.durations.execution} dia(s)</span>
                                </div>
                            )}

                            {plan.durations.demobilization !== undefined && plan.durations.demobilization > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Desmobilização</span>
                                    <span className="font-medium">{plan.durations.demobilization} dia(s)</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-3 border-t">
                                <span className="text-sm font-semibold">Total</span>
                                <span className="font-bold">{totalDuration} dia(s)</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Techniques */}
                {plan.techniques && plan.techniques.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wrench className="w-5 h-5" />
                                Técnicas Previstas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {plan.techniques.map((technique, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm"
                                    >
                                        {technique}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tools */}
                {plan.tools && plan.tools.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>🛠️ Ferramentas Necessárias</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {plan.tools.map((tool, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-sm">{tool}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* EPIs */}
                {plan.epis && plan.epis.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5" />
                                EPIs Necessários
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {plan.epis.map((epi, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-sm">{epi}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Metadata Footer */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                            <span className="font-medium">Criado em: </span>
                            {formatDateTime(plan.created_at)}
                        </div>
                        <div>
                            <span className="font-medium">Última atualização: </span>
                            {formatDateTime(plan.updated_at)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assignment Dialog */}
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gerar Ordem de Serviço</DialogTitle>
                        <DialogDescription>
                            Deseja atribuir esta tarefa a um membro específico da equipe?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Responsável pela Execução</label>
                        <Select
                            value={selectedAssignee}
                            onValueChange={setSelectedAssignee}
                            displayValue={selectedAssignee === "none" ? "Deixar sem dono (Disponível para todos)" : members.find(m => m.user_id === selectedAssignee)?.nome}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um responsável" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Deixar sem dono (Disponível para todos)</SelectItem>
                                {members.map(member => (
                                    <SelectItem key={member.user_id} value={member.user_id}>
                                        {member.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmGeneration} disabled={isGenerating}>
                            {isGenerating ? 'Gerando...' : 'Confirmar e Gerar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reopen Work Order Dialog */}
            <Dialog open={showReopenDialog} onOpenChange={setShowReopenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reabrir Ordem de Serviço</DialogTitle>
                        <DialogDescription>
                            A O.S. retornará para o status "Em Andamento". Informe o motivo e a nova data.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Motivo da Reabertura (Obrigatório)</Label>
                            <Textarea
                                id="reason"
                                placeholder="Descreva por que esta O.S. está sendo reaberta..."
                                value={reopenReason}
                                onChange={(e) => setReopenReason(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newDate">Nova Data de Início</Label>
                            <Input
                                id="newDate"
                                type="date"
                                value={reopenDate}
                                onChange={(e) => setReopenDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReopenDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmReopen} disabled={isReopening}>
                            {isReopening ? 'Reabrindo...' : 'Confirmar Reabertura'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o plano <strong>{plan.plan_id}</strong>?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
