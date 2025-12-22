// Plan Dashboard Component - Main View for Intervention Planning Module

import { useState } from 'react';
import { Plus, Calendar, Filter, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { StatisticsCards } from './StatisticsCards';
import { PlanCard } from './PlanCard';
import { usePlans, usePlanStats } from '../../hooks/usePlans';
import type { InterventionPlan, InterventionType } from '../../types/plan';
import {
    sortPlansByDate,
    filterPlansByType,
    searchPlans,
    INTERVENTION_COLORS,
    INTERVENTION_LABELS
} from '../../lib/planUtils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface PlanDashboardProps {
    onCreatePlan: () => void;
    onEditPlan: (plan: InterventionPlan) => void;
    onViewDetails: (plan: InterventionPlan) => void;
    onViewTimeline: () => void;
}

export function PlanDashboard({
    onCreatePlan,
    onEditPlan,
    onViewDetails,
    onViewTimeline
}: PlanDashboardProps) {
    const { plans, loading, error } = usePlans();
    const stats = usePlanStats(plans);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<InterventionType | 'all'>('all');

    // Apply filters and search
    const filteredPlans = searchPlans(
        filterPlansByType(sortPlansByDate(plans), filterType),
        searchTerm
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-4 text-muted-foreground">Carregando planos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <p className="text-destructive font-semibold mb-2">Erro ao carregar planos</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">📋 Gestão de Planos de Intervenção</h1>
                    <p className="text-muted-foreground mt-2">
                        Acompanhamento de intervenções programadas
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={onViewTimeline}
                        className="flex-1 sm:flex-initial"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        Ver Cronograma
                    </Button>
                    <Button
                        onClick={onCreatePlan}
                        className="flex-1 sm:flex-initial"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Plano
                    </Button>
                </div>
            </div>

            {/* Statistics KPIs */}
            <StatisticsCards stats={stats} />

            {/* Distribution by Type */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Distribuição por Tipo de Intervenção</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(stats.byType).map(([type, count]) => (
                        <div
                            key={type}
                            className="p-4 rounded-lg border-l-4 bg-secondary"
                            style={{ borderLeftColor: INTERVENTION_COLORS[type as InterventionType] }}
                        >
                            <div className="text-2xl font-bold">{count}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                                {INTERVENTION_LABELS[type as InterventionType]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar planos..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as InterventionType | 'all')}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="poda">Poda</SelectItem>
                        <SelectItem value="supressao">Supressão</SelectItem>
                        <SelectItem value="transplante">Transplante</SelectItem>
                        <SelectItem value="tratamento">Tratamento</SelectItem>
                        <SelectItem value="monitoramento">Monitoramento</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Plans Grid with Tabs */}
            <div>
                <Tabs defaultValue="active" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="active">
                            Em Aberto ({filteredPlans.filter(p => !['COMPLETED', 'CANCELLED'].includes(p.status || 'APPROVED')).length})
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            Histórico ({filteredPlans.filter(p => ['COMPLETED', 'CANCELLED'].includes(p.status || 'APPROVED')).length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        <PlansGrid
                            plans={filteredPlans.filter(p => !['COMPLETED', 'CANCELLED'].includes(p.status || 'APPROVED'))}
                            searchTerm={searchTerm}
                            filterType={filterType}
                            onViewDetails={onViewDetails}
                            onEditPlan={onEditPlan}
                        />
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <PlansGrid
                            plans={filteredPlans.filter(p => ['COMPLETED', 'CANCELLED'].includes(p.status || 'APPROVED'))}
                            searchTerm={searchTerm}
                            filterType={filterType}
                            onViewDetails={onViewDetails}
                            onEditPlan={onEditPlan}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function PlansGrid({
    plans,
    searchTerm,
    filterType,
    onViewDetails,
    onEditPlan
}: {
    plans: InterventionPlan[],
    searchTerm: string,
    filterType: string,
    onViewDetails: (p: InterventionPlan) => void,
    onEditPlan: (p: InterventionPlan) => void
}) {
    if (plans.length === 0) {
        return (
            <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all'
                        ? 'Nenhum plano encontrado com os filtros aplicados'
                        : 'Nenhum plano nesta categoria'}
                </p>
                {!searchTerm && filterType === 'all' && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Cadastre novos planos através do botão "Novo Plano"
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
                <PlanCard
                    key={plan.id}
                    plan={plan}
                    onViewDetails={onViewDetails}
                    onEdit={onEditPlan}
                />
            ))}
        </div>
    );
}

