import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import type { InterventionPlan } from '../../../types/plan';
import { INTERVENTION_LABELS } from '../../../lib/planUtils';

interface InterventionGanttProps {
    plans: InterventionPlan[];
}

type ViewMode = 'Week' | 'Month' | 'Year';

// Internal Custom Gantt Component (Report style with Advanced Scaling)
function CustomGantt({ plans, scale, viewMode }: { plans: InterventionPlan[], scale: number, viewMode: ViewMode }) {
    const { startDate, endDate, totalDays } = useMemo(() => {
        // Base buffer days adjusted by viewMode
        let bufferPre = 2;
        let bufferPost = 5;

        if (viewMode === 'Month') {
            bufferPre = 7;
            bufferPost = 15;
        } else if (viewMode === 'Year') {
            bufferPre = 30;
            bufferPost = 60;
        }

        // Adjust buffers by zoom scale (Zoom in = smaller relative buffer)
        bufferPre = Math.max(1, Math.ceil(bufferPre * (6 - scale) / 3));
        bufferPost = Math.max(2, Math.ceil(bufferPost * (6 - scale) / 3));

        const getBaseDates = () => {
            if (!plans || plans.length === 0) {
                const now = new Date();
                return [now.getTime(), now.getTime()];
            }
            const dates = plans.flatMap(p => [
                p.schedule?.start || p.schedule?.startDate,
                p.schedule?.end || p.schedule?.endDate
            ]).filter(Boolean).map(d => new Date(d as string).getTime());

            if (dates.length === 0) return [new Date().getTime(), new Date().getTime()];
            return [Math.min(...dates), Math.max(...dates)];
        };

        const [minTime, maxTime] = getBaseDates();

        const start = new Date(minTime);
        start.setDate(start.getDate() - bufferPre);
        start.setHours(0, 0, 0, 0);

        const end = new Date(maxTime);
        end.setDate(end.getDate() + bufferPost);
        end.setHours(23, 59, 59, 999);

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { startDate: start, endDate: end, totalDays: days || 1 };
    }, [plans, scale, viewMode]);

    const getPosition = (dateStr?: string) => {
        if (!dateStr) return 0;
        const date = new Date(dateStr);
        const diff = date.getTime() - startDate.getTime();
        return (diff / (1000 * 60 * 60 * 24)) / totalDays * 100;
    };

    const getDurationWidth = (startStr?: string, endStr?: string) => {
        if (!startStr || !endStr) return 0;
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();
        const duration = (end - start) / (1000 * 60 * 60 * 24);
        return (Math.max(duration, 0.5) / totalDays) * 100;
    };

    const getInterventionColor = (type: string) => {
        const colors: Record<string, string> = {
            'poda': 'bg-blue-500',
            'supressao': 'bg-red-500',
            'transplante': 'bg-orange-500',
            'tratamento': 'bg-emerald-500',
            'monitoramento': 'bg-purple-500'
        };
        return colors[type] || 'bg-slate-500';
    };

    // Calculate dynamic markers based on viewMode
    const markers = useMemo(() => {
        const results = [];
        if (viewMode === 'Year') {
            // Month markers
            for (let i = 0; i < 12; i++) {
                const d = new Date(startDate.getFullYear(), i, 1);
                if (d >= startDate && d <= endDate) {
                    results.push({
                        label: d.toLocaleDateString('pt-BR', { month: 'short' }),
                        offset: getPosition(d.toISOString())
                    });
                }
            }
        } else if (viewMode === 'Month') {
            // Weekly markers
            let current = new Date(startDate);
            while (current <= endDate) {
                results.push({
                    label: `D${current.getDate()}`,
                    offset: getPosition(current.toISOString())
                });
                current.setDate(current.getDate() + 7);
            }
        } else {
            // Daily markers (midpoint)
            results.push({ label: 'Meio', offset: 50 });
        }
        return results;
    }, [startDate, endDate, viewMode, totalDays]);

    return (
        <div className="w-full border rounded-lg overflow-x-auto bg-background shadow-sm scrollbar-thin scrollbar-thumb-muted-foreground/20">
            <div style={{ width: `${Math.max(100, scale * (viewMode === 'Year' ? 100 : 50))}%`, minWidth: '100%' }}>
                {/* Timeline Header */}
                <div className="flex border-b bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="w-[180px] p-3 flex-shrink-0 border-r bg-muted/40">
                        Intervenção / ID
                    </div>
                    <div className="flex-1 relative h-10 px-2 flex items-center justify-between">
                        <span className="bg-background/80 px-1 rounded">{startDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: viewMode === 'Year' ? 'numeric' : undefined })}</span>

                        <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-20">
                            {markers.map((m, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="h-4 border-l border-dashed border-muted-foreground" />
                                    <span className="text-[8px] mt-0.5">{m.label}</span>
                                </div>
                            ))}
                        </div>

                        <span className="bg-background/80 px-1 rounded">{endDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: viewMode === 'Year' ? 'numeric' : undefined })}</span>
                    </div>
                </div>

                {/* Gantt Body */}
                <div className="relative min-h-[120px]">
                    {/* Horizontal Grid Pattern */}
                    <div className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)',
                            backgroundSize: `${100 / (totalDays || 1)}% 100%`,
                            opacity: 0.05
                        }}
                    />

                    {plans.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground italic">
                            Nenhum dado para exibir no cronograma.
                        </div>
                    ) : (
                        plans.map((plan, index) => {
                            const startStr = plan.schedule?.start || plan.schedule?.startDate;
                            const endStr = plan.schedule?.end || plan.schedule?.endDate;
                            const isLate = startStr && new Date(startStr) < new Date() && plan.status !== 'COMPLETED';
                            const isCompleted = plan.status === 'COMPLETED';

                            const startP = getPosition(startStr);
                            const widthP = getDurationWidth(startStr, endStr);

                            // Color logic: Completed > Late > Type
                            let colorClass = getInterventionColor(plan.intervention_type);
                            if (isCompleted) colorClass = 'bg-green-500';
                            else if (isLate) colorClass = 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]';

                            const label = INTERVENTION_LABELS[plan.intervention_type] || plan.intervention_type;

                            return (
                                <div key={plan.id} className="group flex h-10 border-b last:border-0 hover:bg-muted/10 transition-colors relative z-10 items-center">
                                    <div className="w-[180px] px-3 flex-shrink-0 border-r text-xs whitespace-nowrap overflow-hidden text-overflow-ellipsis bg-background/50 z-20">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : (isLate ? 'bg-red-500' : 'bg-slate-300')}`} />
                                            <span className="font-bold text-primary truncate">#{index + 1} {label}</span>
                                        </div>
                                        <div className="text-[9px] opacity-50 ml-3">ID {plan.plan_id || plan.id.substring(0, 6)}</div>
                                    </div>
                                    <div className="flex-1 relative h-full">
                                        <div
                                            className={`absolute h-6 top-1/2 -translate-y-1/2 rounded shadow-sm flex items-center justify-center text-[9.5px] font-bold text-white px-2 cursor-default transition-all hover:scale-[1.02] hover:shadow-md ${colorClass}`}
                                            style={{
                                                left: `${startP}%`,
                                                width: `${Math.max(widthP, 0.2)}%`,
                                                minWidth: viewMode === 'Year' ? '10px' : '40px'
                                            }}
                                            title={`${label} - ${new Date(startStr || '').toLocaleDateString()}`}
                                        >
                                            {viewMode !== 'Year' && <span className="truncate">ID {plan.plan_id || plan.id.substring(0, 6)}</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export function InterventionGantt({ plans }: InterventionGanttProps) {
    const [scale, setScale] = useState(2); // Zoom scale 1-5
    const [viewMode, setViewMode] = useState<ViewMode>('Week');

    // Sorting and Filtering logic
    const [filters, setFilters] = useState<{ [key: string]: string }>({});

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredPlans = useMemo(() => {
        if (!plans) return [];
        let data = [...plans];

        // Apply Filters
        Object.keys(filters).forEach(key => {
            const filterValue = filters[key].toLowerCase();
            if (filterValue) {
                data = data.filter(plan => {
                    if (key === 'id') return (plan.plan_id || plan.id).toLowerCase().includes(filterValue);
                    if (key === 'interventionType') return plan.intervention_type.toLowerCase().includes(filterValue);
                    if (key === 'treeInfo') return (plan.tree?.especie || '').toLowerCase().includes(filterValue) || (plan.tree_id || '').toLowerCase().includes(filterValue);
                    if (key === 'statusLabel') {
                        const isLate = new Date(plan.schedule?.start || '') < new Date() && plan.status !== 'COMPLETED';
                        const status = plan.status === 'COMPLETED' ? 'concluido' : (isLate ? 'atrasado' : 'pendente');
                        return status.includes(filterValue);
                    }
                    return false;
                });
            }
        });

        return data;
    }, [plans, filters]);

    return (
        <Card className="w-full border-none shadow-none bg-transparent overflow-visible">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-6 px-0">
                <div>
                    <CardTitle className="text-xl font-bold font-display">
                        Cronograma de <span className="text-primary italic">Intervenções</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Visualize e acompanhe o planejamento das atividades</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* View Mode Selector */}
                    <div className="flex items-center bg-muted/30 rounded-lg p-1 border">
                        <button
                            onClick={() => setViewMode('Week')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${viewMode === 'Week' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setViewMode('Month')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${viewMode === 'Month' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Mês
                        </button>
                        <button
                            onClick={() => setViewMode('Year')}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${viewMode === 'Year' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Ano
                        </button>
                    </div>

                    {/* Scale Selector */}
                    <div className="flex items-center bg-muted/30 rounded-lg p-1 border">
                        <button
                            onClick={() => setScale(s => Math.max(1, s - 1))}
                            className="p-1.5 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
                            disabled={scale <= 1}
                            title="Zoom Out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                        </button>
                        <span className="px-2 text-[10px] font-bold text-muted-foreground min-w-[30px] text-center">{scale}x</span>
                        <button
                            onClick={() => setScale(s => Math.min(5, s + 1))}
                            className="p-1.5 hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30"
                            disabled={scale >= 5}
                            title="Zoom In"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /><line x1="11" y1="8" x2="11" y2="14" /></svg>
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 space-y-8 h-auto overflow-visible">
                {/* Custom Gantt View - Report Style */}
                <div className="h-auto">
                    <CustomGantt plans={plans} scale={scale} viewMode={viewMode} />
                </div>

                {/* Detailed Table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Listagem Detalhada</h3>
                        <div className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                            {filteredPlans.length} PROJETOS
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/20">
                                        <th className="px-4 py-3 text-left font-bold text-muted-foreground w-[120px]">ID</th>
                                        <th className="px-4 py-3 text-left font-bold text-muted-foreground">Árvore / Espécie</th>
                                        <th className="px-4 py-3 text-left font-bold text-muted-foreground">Intervenção</th>
                                        <th className="px-4 py-3 text-left font-bold text-muted-foreground text-center">Data</th>
                                        <th className="px-4 py-3 text-left font-bold text-muted-foreground">Status</th>
                                    </tr>
                                    <tr className="border-b bg-muted/10">
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                placeholder="Filtrar ID..."
                                                className="w-full px-2 py-1 text-[10px] border-none bg-transparent focus:ring-0 placeholder:text-muted-foreground/50"
                                                value={filters['id'] || ''}
                                                onChange={(e) => handleFilterChange('id', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                placeholder="Filtrar Árvore..."
                                                className="w-full px-2 py-1 text-[10px] border-none bg-transparent focus:ring-0 placeholder:text-muted-foreground/50"
                                                value={filters['treeInfo'] || ''}
                                                onChange={(e) => handleFilterChange('treeInfo', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                placeholder="Filtrar Tipo..."
                                                className="w-full px-2 py-1 text-[10px] border-none bg-transparent focus:ring-0 placeholder:text-muted-foreground/50"
                                                value={filters['interventionType'] || ''}
                                                onChange={(e) => handleFilterChange('interventionType', e.target.value)}
                                            />
                                        </td>
                                        <td />
                                        <td className="px-2 py-2">
                                            <input
                                                type="text"
                                                placeholder="Filtrar Status..."
                                                className="w-full px-2 py-1 text-[10px] border-none bg-transparent focus:ring-0 placeholder:text-muted-foreground/50"
                                                value={filters['statusLabel'] || ''}
                                                onChange={(e) => handleFilterChange('statusLabel', e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPlans.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground italic">Nenhum plano encontrado com os filtros aplicados.</td>
                                        </tr>
                                    ) : (
                                        filteredPlans.map((plan) => {
                                            const startStr = plan.schedule?.start || plan.schedule?.startDate;
                                            const isLate = startStr && new Date(startStr) < new Date() && plan.status !== 'COMPLETED';
                                            const label = INTERVENTION_LABELS[plan.intervention_type] || plan.intervention_type;

                                            return (
                                                <tr key={plan.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                                    <td className="p-4 font-mono text-[10px] font-bold text-primary">
                                                        {plan.plan_id || plan.id.slice(0, 8)}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-xs">Árvore #{plan.tree_id ? plan.tree_id.slice(0, 8) : 'N/A'}</span>
                                                            <span className="text-[10px] text-muted-foreground leading-tight italic">{plan.tree?.especie || 'Espécie não identificada'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ring-1 ring-inset ${plan.intervention_type === 'poda' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                                                            plan.intervention_type === 'supressao' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                                plan.intervention_type === 'tratamento' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                                                    'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                            }`}>
                                                            {label}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center font-medium text-xs">
                                                        {startStr ? new Date(startStr).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${plan.status === 'COMPLETED' ? 'bg-green-500' : (isLate ? 'bg-red-500 animate-pulse' : 'bg-slate-300')}`} />
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${plan.status === 'COMPLETED' ? 'text-green-600' : (isLate ? 'text-red-500' : 'text-slate-500')}`}>
                                                                {plan.status === 'COMPLETED' ? 'Concluído' : (isLate ? 'Atrasado' : 'Pendente')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
