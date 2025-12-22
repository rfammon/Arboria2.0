// Statistics Cards Component - KPI Display for Intervention Planning

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileSpreadsheet, AlertTriangle, CalendarDays, CalendarCheck } from 'lucide-react';
import type { PlanStatistics } from '../../types/plan';

interface StatisticsCardsProps {
    stats: PlanStatistics;
}

export function StatisticsCards({ stats }: StatisticsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Plans */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de Planos
                    </CardTitle>
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPlans}</div>
                    <p className="text-xs text-muted-foreground">
                        Planos cadastrados
                    </p>
                </CardContent>
            </Card>

            {/* Pending Interventions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Intervenções Pendentes
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pendingInterventions}</div>
                    <p className="text-xs text-muted-foreground">
                        Aguardando execução
                    </p>
                </CardContent>
            </Card>

            {/* This Week */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Esta Semana
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.thisWeek}</div>
                    <p className="text-xs text-muted-foreground">
                        Programadas para breve
                    </p>
                </CardContent>
            </Card>

            {/* This Month */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Este Mês
                    </CardTitle>
                    <CalendarCheck className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.thisMonth}</div>
                    <p className="text-xs text-muted-foreground">
                        Programadas no mês
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
