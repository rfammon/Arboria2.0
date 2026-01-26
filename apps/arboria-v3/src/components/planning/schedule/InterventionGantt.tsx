import { useState, useMemo } from 'react';
import { 
    Calendar, 
    Search, 
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    ZoomIn,
    ZoomOut,
    Trees,
    Activity,
    Info,
    Users,
    Briefcase,
    Hammer,
    Gauge,
    TrendingUp,
    LayoutDashboard,
    User
} from 'lucide-react';
import { Surface } from '../../ui/surface';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { PlansIllustration } from '../../illustrations/dashboard-icons';
import type { InterventionPlan } from '../../../types/plan';
import { INTERVENTION_LABELS } from '../../../lib/planUtils';
import { cn } from '../../../lib/utils';

interface InterventionGanttProps {
    plans: InterventionPlan[];
}

type ViewMode = 'Week' | 'Month' | 'Year';

// --- Metrics & KPI Components ---

function SPIGauge({ value }: { value: number }) {
    const percentage = Math.min(Math.max(value * 100, 0), 200);
    const rotation = (percentage / 200) * 180 - 90;
    
    const getColor = (v: number) => {
        if (v >= 1) return 'text-emerald-500';
        if (v >= 0.85) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="relative flex flex-col items-center">
            <div className="relative w-32 h-20 overflow-hidden">
                <div className="absolute w-32 h-32 border-[10px] border-slate-200 dark:border-slate-800/50 rounded-full" />
                <div 
                    className={cn(
                        "absolute w-32 h-32 border-[10px] border-current rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--color-primary),0.3)]",
                        getColor(value)
                    )}
                    style={{ 
                        clipPath: 'inset(0 0 50% 0)',
                        transform: `rotate(${rotation}deg)` 
                    }}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{value.toFixed(2)}</span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">IDP</span>
                </div>
            </div>
            <div className="flex justify-between w-full px-2 mt-2">
                <span className="text-[8px] font-black text-rose-500/50 uppercase tracking-tighter">Atraso</span>
                <span className="text-[8px] font-black text-emerald-500/50 uppercase tracking-tighter">Meta</span>
                <span className="text-[8px] font-black text-indigo-500/50 uppercase tracking-tighter">Extra</span>
            </div>
        </div>
    );
}

function StatusPill({ status, isLate }: { status: string, isLate: boolean }) {
    if (status === 'COMPLETED') {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Concluído</span>
            </div>
        );
    }
    if (isLate) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wider animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Atrasado</span>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            <span>Pendente</span>
        </div>
    );
}

// --- Table Components ---

function MSProjectTable({ plans }: { plans: InterventionPlan[] }) {
    return (
        <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/30 overflow-hidden backdrop-blur-xl shadow-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
                            <th className="px-4 py-3 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Tarefa / ID</th>
                            <th className="px-4 py-3 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Ativo / Espécie</th>
                            <th className="px-4 py-3 text-center font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Início Previsto</th>
                            <th className="px-4 py-3 text-center font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Início Real</th>
                            <th className="px-4 py-3 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Recursos</th>
                            <th className="px-4 py-3 text-left font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Responsável</th>
                            <th className="px-4 py-3 text-right font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-[10px]">Progresso</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {plans.map((plan) => {
                            const startPrev = plan.schedule?.start || plan.schedule?.startDate;
                            const startReal = plan.work_orders?.[0]?.tasks?.[0]?.started_at || plan.work_orders?.[0]?.created_at;
                            const label = INTERVENTION_LABELS[plan.intervention_type] || plan.intervention_type;
                            const progress = plan.status === 'COMPLETED' ? 100 : (plan.progress || 0);

                            return (
                                <tr key={plan.id} className="group hover:bg-emerald-500/5 transition-all">
                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 dark:text-slate-100 uppercase text-[12px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{label}</span>
                                            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">#{plan.plan_id || plan.id.substring(0, 8)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <Trees className="w-3.5 h-3.5 text-emerald-500/50" />
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase truncate max-w-[140px] text-[11px]">
                                                    {plan.tree?.especie || 'S/I'}
                                                </span>
                                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">#{plan.tree_id?.substring(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-center font-mono text-slate-600 dark:text-slate-400 font-bold text-[11px]">
                                        {startPrev ? new Date(startPrev).toLocaleDateString('pt-BR') : '---'}
                                    </td>
                                    <td className="px-4 py-2.5 text-center font-mono text-emerald-600 dark:text-emerald-500/80 font-bold text-[11px]">
                                        {startReal ? new Date(startReal).toLocaleDateString('pt-BR') : <span className="text-slate-400 dark:text-slate-700 italic font-medium">Agendado</span>}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-wrap gap-1">
                                            {[...(plan.techniques || []), ...(plan.tools || [])].slice(0, 2).map((t, i) => (
                                                <Badge key={i} variant="outline" className="text-[8px] bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 uppercase tracking-tighter font-bold px-1 py-0">
                                                    {t}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                                                <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase truncate max-w-[90px] text-[10px]">{plan.responsible || 'Sem Atribuição'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-black text-slate-900 dark:text-white font-mono text-[10px]">{progress}%</span>
                                            <div className="w-16 h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-1000",
                                                        progress === 100 ? "bg-emerald-500" : "bg-indigo-500"
                                                    )}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Gantt Chart Implementation ---

function CustomGantt({ plans, scale, viewMode }: { plans: InterventionPlan[], scale: number, viewMode: ViewMode }) {
    const { startDate, endDate, totalDays } = useMemo(() => {
        let bufferPre = 2;
        let bufferPost = 10;
        if (viewMode === 'Month') { bufferPre = 10; bufferPost = 30; }
        else if (viewMode === 'Year') { bufferPre = 60; bufferPost = 120; }

        bufferPre = Math.max(1, Math.ceil(bufferPre * (6 - scale) / 3));
        bufferPost = Math.max(2, Math.ceil(bufferPost * (6 - scale) / 3));

        const getBaseDates = () => {
            if (!plans || plans.length === 0) return [Date.now(), Date.now()];
            const dates = plans.flatMap(p => [
                p.schedule?.start || p.schedule?.startDate,
                p.schedule?.end || p.schedule?.endDate
            ]).filter(Boolean).map(d => new Date(d as string).getTime());
            return dates.length === 0 ? [Date.now(), Date.now()] : [Math.min(...dates), Math.max(...dates)];
        };

        const [minT, maxT] = getBaseDates();
        const start = new Date(minT); start.setDate(start.getDate() - bufferPre); start.setHours(0,0,0,0);
        const end = new Date(maxT); end.setDate(end.getDate() + bufferPost); end.setHours(23,59,59,999);
        const days = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return { startDate: start, endDate: end, totalDays: days || 1 };
    }, [plans, scale, viewMode]);

    const getPos = (d?: string) => d ? ((new Date(d).getTime() - startDate.getTime()) / (1000*60*60*24)) / totalDays * 100 : 0;
    const getWid = (s?: string, e?: string) => s && e ? (Math.max((new Date(e).getTime() - new Date(s).getTime()) / (1000*60*60*24), 0.5) / totalDays) * 100 : 0;

    const getInterventionGradient = (type: string) => {
        const gradients: Record<string, string> = {
            'poda': 'from-blue-500 to-blue-600',
            'supressao': 'from-rose-500 to-rose-600',
            'transplante': 'from-amber-500 to-amber-600',
            'tratamento': 'from-emerald-500 to-emerald-600',
            'monitoramento': 'from-indigo-500 to-indigo-600'
        };
        return gradients[type] || 'from-slate-500 to-slate-600';
    };

    return (
        <div className="w-full rounded-xl overflow-x-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 shadow-lg scrollbar-none">
            <div style={{ width: `${Math.max(100, scale * (viewMode === 'Year' ? 120 : 80))}%`, minWidth: '100%' }}>
                <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] h-12 items-center">
                    <div className="w-[200px] p-3 flex-shrink-0 border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 sticky left-0 z-30 font-black text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest backdrop-blur-xl">Intervenção / Ativo</div>
                    <div className="flex-1 relative px-6 flex items-center justify-between text-slate-400 dark:text-slate-500 font-mono text-[9px] font-black">
                        <span className="bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5 text-emerald-600 dark:text-emerald-400 shadow-sm">
                            {startDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-around pointer-events-none opacity-[0.1] dark:opacity-[0.03]">
                            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-6 border-l border-slate-300 dark:border-white" />)}
                        </div>
                        <span className="bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/5 text-emerald-600 dark:text-emerald-400 shadow-sm">
                            {endDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                <div className="relative pb-4 min-h-[160px]">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.1] dark:opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(to right, #64748b 1px, transparent 1px)', backgroundSize: `${100/totalDays}% 100%` }} />
                    {plans.map((plan, idx) => {
                        const start = plan.schedule?.start || plan.schedule?.startDate;
                        const end = plan.schedule?.end || plan.schedule?.endDate;
                        const isLate = start && new Date(start) < new Date() && plan.status !== 'COMPLETED';
                        const isCompleted = plan.status === 'COMPLETED';
                        const progress = isCompleted ? 100 : (plan.progress || 0);
                        const label = INTERVENTION_LABELS[plan.intervention_type] || plan.intervention_type;
                        const gradientClass = getInterventionGradient(plan.intervention_type);
                        
                        return (
                            <div key={plan.id} className="group flex h-10 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all items-center border-b border-slate-100 dark:border-white/[0.02]">
                                <div className="w-[200px] px-4 flex-shrink-0 border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 sticky left-0 z-30 backdrop-blur-xl">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn("w-1.5 h-1.5 rounded-full ring-1 ring-white dark:ring-slate-950", isCompleted ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : isLate ? "bg-rose-500 animate-pulse shadow-[0_0_6px_rgba(244,63,94,0.8)]" : "bg-slate-300 dark:bg-slate-700")} />
                                            <span className="font-black text-slate-700 dark:text-slate-100 uppercase tracking-tight text-[10px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                #{idx+1} {label}
                                            </span>
                                        </div>
                                        <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 ml-3 opacity-60 font-black tracking-widest uppercase">ID {plan.plan_id || plan.id.substring(0,8)}</span>
                                    </div>
                                </div>
                                <div className="flex-1 relative h-full">
                                    <div 
                                        className={cn(
                                            "absolute h-5 top-1/2 -translate-y-1/2 rounded-full shadow-md flex items-center overflow-hidden transition-all duration-700 group/bar border border-slate-200 dark:border-white/5",
                                            isCompleted ? "bg-emerald-500/10" : isLate ? "bg-rose-500/10" : "bg-indigo-500/10"
                                        )}
                                        style={{ left: `${getPos(start)}%`, width: `${Math.max(getWid(start, end), 0.5)}%`, minWidth: '60px' }}
                                    >
                                        <div 
                                            className={cn(
                                                "h-full transition-all duration-1000 ease-out flex items-center px-3",
                                                isCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                                                isLate ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : 
                                                `bg-gradient-to-r ${gradientClass}`
                                            )}
                                            style={{ width: `${progress}%` }}
                                        >
                                            <div className="flex items-center gap-1.5 w-full text-white font-black">
                                                {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : isLate ? <AlertCircle className="w-3 h-3 animate-bounce" /> : <Clock className="w-3 h-3" />}
                                                <span className="text-[9px] uppercase tracking-tighter truncate">{progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// --- Main Interface ---

export function InterventionGantt({ plans }: InterventionGanttProps) {
    const [scale, setScale] = useState(2);
    const [viewMode, setViewMode] = useState<ViewMode>('Week');
    const [searchTerm, setSearchTerm] = useState('');

    const { filteredPlans, spi, stats } = useMemo(() => {
        if (!plans) return { filteredPlans: [], spi: 0, stats: { completed: 0, planned: 0, late: 0 } };
        
        const now = new Date();
        const plannedToDate = plans.filter(p => {
            const start = p.schedule?.start || p.schedule?.startDate;
            return start && new Date(start) <= now;
        }).length || 1;
        
        const completed = plans.filter(p => p.status === 'COMPLETED').length;
        const late = plans.filter(p => {
            const start = p.schedule?.start || p.schedule?.startDate;
            return start && new Date(start) <= now && p.status !== 'COMPLETED';
        }).length;

        const filtered = searchTerm ? plans.filter(p => 
            (p.plan_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.intervention_type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.tree?.especie || '').toLowerCase().includes(searchTerm.toLowerCase())
        ) : plans;

        return { 
            filteredPlans: filtered, 
            spi: completed / plannedToDate,
            stats: { completed, planned: plannedToDate, late }
        };
    }, [plans, searchTerm]);

    return (
        <Surface variant="glass-heavy" elevation="lg" className="w-full relative overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-white/5 p-6 md:p-8">
            {/* Background Decor */}
            <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] opacity-[0.03] dark:opacity-[0.06] pointer-events-none rotate-[15deg] transition-transform duration-1000 group-hover:scale-110">
                <PlansIllustration />
            </div>
            <div className="absolute top-0 right-0 -mr-60 -mt-60 w-[45rem] h-[45rem] bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] rounded-full blur-[180px] pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
                {/* Header Section with IDP KPI */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-8 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
                            <Briefcase className="w-3.5 h-3.5" />
                            Portal de Inteligência Operacional
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                                Cronograma <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-emerald-600 to-indigo-700 dark:from-emerald-400 dark:via-emerald-500 dark:to-indigo-600 italic font-display">Operacional</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-[13px] font-bold leading-relaxed max-w-xl mt-3 opacity-80 uppercase tracking-tight">
                                Centro de Planejamento Arboria: Gestão matricial de intervenções com monitoramento dinâmico de produtividade.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-50/80 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-3xl shadow-lg w-fit ml-auto">
                        <SPIGauge value={spi} />
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Concluídos</span>
                                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-500 font-mono tracking-tighter">{stats.completed}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-black text-rose-500 dark:text-rose-500/80 uppercase tracking-widest flex items-center gap-1.5">
                                    Atrasos <TrendingUp className="w-3 h-3 rotate-180" />
                                </span>
                                <span className="text-2xl font-black text-rose-600 dark:text-rose-500 font-mono tracking-tighter">{stats.late}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative group flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Buscar tarefas, ativos ou equipes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500/20 transition-all shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 rounded-xl p-1 border border-slate-200 dark:border-white/5 shadow-sm">
                            {(['Week', 'Month', 'Year'] as ViewMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-widest",
                                        viewMode === mode 
                                            ? "bg-emerald-500 text-white shadow-md scale-105" 
                                            : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    )}
                                >
                                    {mode === 'Week' ? 'Semana' : mode === 'Month' ? 'Mês' : 'Ano'}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center bg-slate-100 dark:bg-slate-900/90 rounded-xl p-1 border border-slate-200 dark:border-white/5 shadow-sm">
                            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.max(1, s - 1))} className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><ZoomOut className="w-4 h-4"/></Button>
                            <span className="px-3 text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">{scale}X</span>
                            <Button variant="ghost" size="icon" onClick={() => setScale(s => Math.min(5, s + 1))} className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><ZoomIn className="w-4 h-4"/></Button>
                        </div>
                    </div>
                </div>

                {/* Gantt Visualization */}
                <CustomGantt plans={filteredPlans} scale={scale} viewMode={viewMode} />

                {/* MS Project Style Table Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 flex items-center gap-4">
                            <div className="w-8 h-[2px] bg-emerald-500" />
                            Grade de Dados do Projeto
                        </h3>
                        <Badge variant="outline" className="bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-500 font-black text-[10px] px-4 py-1 uppercase tracking-wider shadow-sm">
                            {filteredPlans.length} Ativos em Execução
                        </Badge>
                    </div>
                    <MSProjectTable plans={filteredPlans} />
                </div>
            </div>
        </Surface>
    );
}
