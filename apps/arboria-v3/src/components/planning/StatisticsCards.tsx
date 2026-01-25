// Statistics Cards Component - KPI Display for Intervention Planning

import { cn } from '@/lib/utils';
import { FileSpreadsheet, AlertTriangle, CalendarDays, CalendarCheck } from 'lucide-react';
import type { PlanStatistics } from '../../types/plan';

interface StatisticsCardsProps {
    stats: PlanStatistics;
}

interface StatCardProps {
    title: string;
    value: number;
    description: string;
    icon: any;
    colorClass: string;
    glowColor: string;
}

function StatCard({ title, value, description, icon: Icon, colorClass, glowColor }: StatCardProps) {
    return (
        <div className={cn(
            "relative group overflow-hidden rounded-[1.5rem] p-6 h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] bg-white/90 dark:bg-slate-900/50 border-slate-200 dark:border-white/10 shadow-xl backdrop-blur-md",
            colorClass
        )}>
            {/* Glow effect */}
            <div className={cn(
                "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity pointer-events-none",
                glowColor
            )} />

            <div className="flex justify-between items-start relative z-10">
                <div className="p-3 rounded-2xl bg-foreground/5 dark:bg-white/5 border border-foreground/5 dark:border-white/10 shadow-sm">
                    <Icon className="w-5 h-5" />
                </div>
                <div className="h-10 w-24">
                    <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                        <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points="0,20 15,15 30,25 45,10 60,20 75,5 100,15"
                            className="drop-shadow-[0_0_8px_rgba(0,0,0,0.05)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] opacity-50"
                        />
                    </svg>
                </div>
            </div>

            <div className="mt-8 relative z-10">
                <div className="text-4xl font-black tracking-tighter mb-1 drop-shadow-sm">
                    {value}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase tracking-wider opacity-70 dark:opacity-60 leading-none mb-1">{title}</span>
                    <span className="text-xs opacity-50 dark:opacity-40 font-medium">{description}</span>
                </div>
            </div>
        </div>
    );
}

export function StatisticsCards({ stats }: StatisticsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard 
                title="Total de Planos"
                value={stats.totalPlans}
                description="Planos cadastrados"
                icon={FileSpreadsheet}
                colorClass="text-slate-900 dark:text-white"
                glowColor="bg-slate-500"
            />
            <StatCard 
                title="Pendentes"
                value={stats.pendingInterventions}
                description="Aguardando execução"
                icon={AlertTriangle}
                colorClass="text-amber-600 dark:text-amber-400"
                glowColor="bg-amber-500"
            />
            <StatCard 
                title="Esta Semana"
                value={stats.thisWeek}
                description="Programadas para breve"
                icon={CalendarDays}
                colorClass="text-blue-600 dark:text-blue-400"
                glowColor="bg-blue-500"
            />
            <StatCard 
                title="Este Mês"
                value={stats.thisMonth}
                description="Programadas no mês"
                icon={CalendarCheck}
                colorClass="text-emerald-600 dark:text-emerald-400"
                glowColor="bg-emerald-500"
            />
        </div>
    );
}

