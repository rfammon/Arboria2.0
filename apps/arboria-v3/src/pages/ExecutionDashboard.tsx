import { useExecutionStatistics, useTasks } from '../hooks/useExecution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Task } from '@/types/execution';
import { AlertCircle, CheckCircle, Clock, PlayCircle, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TaskMapOverview from '@/components/execution/TaskMapOverview';

// KPI Component
function ExecutionKPIs({ stats }: { stats: any }) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Tarefas</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.total_tasks}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.pending} pendentes
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                    <PlayCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.in_progress}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.active_executors || 0} executantes ativos
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Concluídas Hoje</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.completed_today}</div>
                    <p className="text-xs text-muted-foreground">
                        {stats.average_completion_time ? `~${parseFloat(stats.average_completion_time).toFixed(1)}h média` : '-'}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-600">{stats.active_alerts}</div>
                    <p className="text-xs text-muted-foreground">
                        Requerem atenção imediata
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

// Recent Activity Timeline
function ActivityTimeline({ tasks }: { tasks: Task[] }) {
    // Sort tasks by updated_at descending
    const recentTasks = [...tasks]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);

    return (
        <Card className="col-span-3 lg:col-span-1">
            <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {recentTasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-4">
                            <span className="relative flex h-2 w-2 translate-y-2 rounded-full bg-sky-500" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {task.intervention_type} - {task.status}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {task.tree?.especie} ({task.tree?.id?.substring(0, 8)})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(task.updated_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ExecutionDashboard() {
    const { activeInstallation } = useAuth();
    const { data: stats } = useExecutionStatistics(activeInstallation?.id);
    const { data: allTasks } = useTasks(); // Fetch all tasks for map/timeline

    // If no installation selected, show empty state
    if (!activeInstallation) return <div className="p-8">Selecione uma instalação.</div>;

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard de Execução</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <MapIcon className="mr-2 h-4 w-4" />
                        Visualizar Mapa Completo
                    </Button>
                </div>
            </div>

            <ExecutionKPIs stats={stats || {}} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 h-[400px]">
                    <CardHeader>
                        <CardTitle>Mapa de Operações</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 h-full">
                        <TaskMapOverview tasks={allTasks || []} className="border-0 rounded-none rounded-b-lg" />
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <ActivityTimeline tasks={allTasks || []} />
                </Card>
            </div>
        </div>
    );
}
