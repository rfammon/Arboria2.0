import { useNavigate } from 'react-router-dom';
import { Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import type { WorkOrder } from '../../../types/execution';

interface PlanWorkOrdersProps {
    workOrders: WorkOrder[];
    isManager: boolean;
    onDeleteWorkOrder: (id: string) => void;
    onOpenReopenDialog: (id: string) => void;
}

export function PlanWorkOrders({
    workOrders,
    isManager,
    onDeleteWorkOrder,
    onOpenReopenDialog
}: PlanWorkOrdersProps) {
    const navigate = useNavigate();

    if (!workOrders || workOrders.length === 0) return null;

    const pendingWorkOrders = workOrders.filter(wo => wo.status !== 'COMPLETED' && wo.status !== 'CANCELLED');
    const completedWorkOrders = workOrders.filter(wo => wo.status === 'COMPLETED' || wo.status === 'CANCELLED');

    return (
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
                    {pendingWorkOrders.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Tarefas Pendentes ou em Andamento</h4>
                            {pendingWorkOrders.map((wo, idx) => (
                                <div key={wo.id || idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-md border hover:border-primary/50 transition-colors group">
                                    <div className="flex flex-col cursor-pointer flex-1" onClick={() => navigate(`/execution/${wo.id}`)}>
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
                                            onClick={() => onDeleteWorkOrder(wo.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Completed Group */}
                    {completedWorkOrders.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Tarefas Finalizadas</h4>
                            {completedWorkOrders.map((wo, idx) => (
                                <div key={wo.id || idx} className="flex justify-between items-center p-3 bg-green-50/10 rounded-md border opacity-80 group">
                                    <div className="flex flex-col cursor-pointer flex-1" onClick={() => navigate(`/execution/${wo.id}`)}>
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
                                                onClick={() => onOpenReopenDialog(wo.id)}
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                Reabrir
                                            </Button>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={() => onDeleteWorkOrder(wo.id)}
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
    );
}
