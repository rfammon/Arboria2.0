import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import type { InterventionPlan } from '../../../types/plan';
import { INTERVENTION_LABELS } from '../../../lib/planUtils';
import { FrappeGantt } from '../../ui/FrappeGantt';
import type { FrappeTask } from '../../ui/FrappeGantt';
import '../../ui/FrappeGantt.css'; // Import custom styles

interface InterventionGanttProps {
    plans: InterventionPlan[];
}

export function InterventionGantt({ plans }: InterventionGanttProps) {
    const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Week');

    // Transform plans to Frappe Tasks
    const tasks: FrappeTask[] = useMemo(() => {
        if (!plans || plans.length === 0) return [];

        return plans
            .filter(plan => (plan.schedule.start || plan.schedule.startDate) && (plan.schedule.end || plan.schedule.endDate))
            .map(plan => {
                // 1. Get Base Start Date
                const startStr = plan.schedule.start || plan.schedule.startDate;
                if (!startStr) return null;

                const startDate = new Date(startStr);
                const endDate = new Date(startDate);

                // 2. Duration Calculation
                if (plan.durations) {
                    const totalDays = (plan.durations.mobilization || 0) +
                        (plan.durations.execution || 0) +
                        (plan.durations.demobilization || 0);
                    // Use calculated duration (min 1 day)
                    const durationToAdd = Math.max(1, totalDays);
                    endDate.setDate(startDate.getDate() + durationToAdd);
                } else {
                    const explicitEndStr = plan.schedule.end || plan.schedule.endDate;
                    if (explicitEndStr) {
                        const explicitEnd = new Date(explicitEndStr);
                        if (explicitEnd > startDate) {
                            endDate.setTime(explicitEnd.getTime());
                        } else {
                            endDate.setDate(startDate.getDate() + 1);
                        }
                    } else {
                        endDate.setDate(startDate.getDate() + 1);
                    }
                }

                // 3. Progress Logic
                let progress = 0;

                // Calculate from Execution Tasks
                if (plan.work_orders && plan.work_orders.length > 0) {
                    const allTasks = plan.work_orders.flatMap(wo => wo.tasks || []);
                    if (allTasks.length > 0) {
                        const totalProgress = allTasks.reduce((sum, t) => sum + (t.progress_percent || 0), 0);
                        progress = Math.round(totalProgress / allTasks.length);
                    }
                }

                // Status Overrides
                if (plan.status === 'COMPLETED') {
                    progress = 100;
                } else if (plan.status === 'IN_PROGRESS' && progress === 0) {
                    // Fallback for in-progress but no tasks started
                    progress = 10;
                }

                // 4. Formatting
                const formatDate = (date: Date) => date.toISOString().split('T')[0];
                const label = INTERVENTION_LABELS[plan.intervention_type] || plan.intervention_type;
                const treeInfo = plan.tree?.especie ? ` - ${plan.tree.especie}` : '';

                // 5. Coloring
                let customClass = 'gantt-default';
                if (plan.intervention_type === 'poda') customClass = 'gantt-blue';
                if (plan.intervention_type === ('remocao' as any) || plan.intervention_type === 'supressao') customClass = 'gantt-red';
                if (plan.intervention_type === 'tratamento') customClass = 'gantt-green';

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                // Check if late (Start date passed and not completed) - Visual cue only
                if (startDate < today && progress < 100) {
                    customClass += '-late'; // Use suffix to avoid space in classList.add error
                }

                return {
                    id: plan.plan_id || plan.id,
                    name: `${label}${treeInfo}`,
                    start: formatDate(startDate),
                    end: formatDate(endDate),
                    progress: progress,
                    dependencies: plan.dependencies ? plan.dependencies.join(', ') : '',
                    custom_class: customClass
                } as FrappeTask;
            })
            .filter((t): t is FrappeTask => t !== null)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [plans]);

    // State for Sorting and Filtering
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [filters, setFilters] = useState<{ [key: string]: string }>({});

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    // Filter and Sort Data
    const tableData = useMemo(() => {
        let data = tasks.map(task => {
            const plan = plans.find(p => (p.plan_id === task.id || p.id === task.id));
            if (!plan) return null;

            const isLate = task.custom_class?.includes('-late') && plan.status !== 'COMPLETED';
            const statusLabel = plan.status === 'COMPLETED' ? 'Concluído' : (isLate ? 'Atrasado' : (task.progress >= 50 ? 'Em Andamento' : 'Pendente'));

            return {
                task,
                plan,
                id: task.id,
                treeInfo: `Árvore #${plan.tree_id ? plan.tree_id.slice(0, 8) + '...' : 'N/A'} - ${plan.tree?.especie || 'Espécie não inf.'}`,
                interventionType: task.name.split('-')[0],
                dateScheduled: task.start,
                dateEnd: task.end,
                riskLevel: plan.tree?.risklevel || '-',
                statusLabel
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        // Apply Filters
        Object.keys(filters).forEach(key => {
            const filterValue = filters[key].toLowerCase();
            if (filterValue) {
                data = data.filter(item => {
                    const value = String((item as any)[key] || '').toLowerCase();
                    return value.includes(filterValue);
                });
            }
        });

        // Apply Sort
        if (sortConfig) {
            data.sort((a, b) => {
                const aValue = (a as any)[sortConfig.key];
                const bValue = (b as any)[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [tasks, plans, filters, sortConfig]);

    const renderHeader = (label: string, sortKey: string, filterKey: string) => (
        <th className="h-auto px-4 py-2 text-left align-top font-medium text-muted-foreground min-w-[150px]">
            <div className="flex flex-col gap-2">
                <button
                    onClick={() => handleSort(sortKey)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors font-medium text-sm group w-full text-left"
                >
                    {label}
                    <span className="text-xs opacity-50 group-hover:opacity-100">
                        {sortConfig?.key === sortKey ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                </button>
                <input
                    type="text"
                    placeholder={`Filtrar ${label}...`}
                    className="w-full px-2 py-1 text-xs border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    value={filters[filterKey] || ''}
                    onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                />
            </div>
        </th>
    );

    return (
        <Card className="w-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-semibold">
                    Visão Geral do Cronograma
                </CardTitle>
                <div className="w-[120px]">
                    <Select
                        value={viewMode}
                        onValueChange={(v) => setViewMode(v as any)}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue placeholder="Visualização" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Day">Dia</SelectItem>
                            <SelectItem value="Week">Semana</SelectItem>
                            <SelectItem value="Month">Mês</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="p-4 overflow-auto bg-card border-b">
                    {tasks.length > 0 ? (
                        <FrappeGantt
                            tasks={tasks}
                            viewMode={viewMode}
                            onClick={(task) => console.log('Clicked task:', task)}
                        />
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhuma intervenção agendada com datas válidas.
                        </div>
                    )}
                </div>

                <div className="p-4 bg-muted/20">
                    <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground tracking-wider">Detalhamento do Cronograma</h3>
                    <div className="rounded-md border bg-card overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 transition-colors">
                                    {renderHeader('ID', 'id', 'id')}
                                    {renderHeader('Árvore / Espécie', 'treeInfo', 'treeInfo')}
                                    {renderHeader('Intervenção', 'interventionType', 'interventionType')}
                                    {renderHeader('Data', 'dateScheduled', 'dateScheduled')}
                                    {renderHeader('Término', 'dateEnd', 'dateEnd')}
                                    {renderHeader('Risco', 'riskLevel', 'riskLevel')}
                                    {renderHeader('Status', 'statusLabel', 'statusLabel')}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map(({ task, plan, statusLabel }) => {
                                    const isLate = task.custom_class?.includes('-late') && plan.status !== 'COMPLETED';
                                    const statusColor = plan.status === 'COMPLETED' ? 'text-green-600 font-bold' : (isLate ? 'text-red-500 font-bold' : (task.progress >= 50 ? 'text-blue-500' : 'text-slate-500'));

                                    return (
                                        <tr key={task.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 font-medium" title={task.id}>
                                                {task.id.length > 12 ? `${task.id.slice(0, 8)}...` : task.id}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium" title={plan.tree_id}>
                                                        Árvore #{plan.tree_id ? plan.tree_id.slice(0, 8) + '...' : 'N/A'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">{plan.tree?.especie || 'Espécie não inf.'}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${task.custom_class?.includes('blue') ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                                                    task.custom_class?.includes('red') ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                        task.custom_class?.includes('green') ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                            'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                    }`}>
                                                    {task.name.split('-')[0]}
                                                </span>
                                            </td>
                                            <td className="p-4">{new Date(task.start + 'T00:00:00').toLocaleDateString()}</td>
                                            <td className="p-4">{new Date(task.end + 'T00:00:00').toLocaleDateString()}</td>
                                            <td className="p-4">
                                                {plan.tree?.risklevel ? (
                                                    <span className={`font-medium ${plan.tree.risklevel.includes('Alto') || plan.tree.risklevel.includes('Extremo') ? 'text-red-600' :
                                                        plan.tree.risklevel.includes('Moderado') ? 'text-orange-600' : 'text-yellow-600'
                                                        }`}>
                                                        {plan.tree.risklevel}
                                                    </span>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </td>
                                            <td className="p-4">
                                                <span className={statusColor}>
                                                    {statusLabel}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

