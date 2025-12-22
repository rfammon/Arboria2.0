import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlanDashboard } from '../components/planning/PlanDashboard';
import { PlanForm } from '../components/planning/PlanForm';
import { PlanDetail } from '../components/planning/PlanDetail';
import type { InterventionPlan } from '../types/plan';
import { InterventionGantt } from '../components/planning/schedule/InterventionGantt';
import { usePlans } from '../hooks/usePlans';

type View = 'dashboard' | 'timeline' | 'form' | 'detail';

export default function PlanManager() {
    const [searchParams] = useSearchParams();
    const treeIdParam = searchParams.get('treeId');

    const [currentView, setCurrentView] = useState<View>(treeIdParam ? 'form' : 'dashboard');
    const [selectedPlan, setSelectedPlan] = useState<InterventionPlan | null>(null);

    // Deep linking for Plan ID
    const planIdParam = searchParams.get('planId');
    const { plans, loading, refetch } = usePlans();

    // Effect to handle deep linking when plans serve is ready
    const [hasHandledDeepLink, setHasHandledDeepLink] = useState(false);

    // Using simple effect to set initial view if planId is present
    if (planIdParam && !loading && plans.length > 0 && !selectedPlan && !hasHandledDeepLink) {
        const found = plans.find(p => p.id === planIdParam);
        if (found) {
            setSelectedPlan(found);
            setCurrentView('detail');
            setHasHandledDeepLink(true);
        }
    }

    const handleCreatePlan = () => {
        setSelectedPlan(null);
        setCurrentView('form');
    };

    const handleEditPlan = (plan: InterventionPlan) => {
        setSelectedPlan(plan);
        setCurrentView('form');
    };

    const handleViewDetails = (plan: InterventionPlan) => {
        setSelectedPlan(plan);
        setCurrentView('detail');
    };

    const handleViewTimeline = () => {
        setCurrentView('timeline');
    };

    const handleFormSuccess = () => {
        refetch();
        setCurrentView('dashboard');
        setSelectedPlan(null);
    };

    const handleFormCancel = () => {
        setCurrentView('dashboard');
        setSelectedPlan(null);
    };

    const handleBackToDashboard = () => {
        refetch(); // Refresh when going back
        setCurrentView('dashboard');
        setSelectedPlan(null);
    };

    // Render based on current view
    switch (currentView) {
        case 'dashboard':
            return (
                <PlanDashboard
                    onCreatePlan={handleCreatePlan}
                    onEditPlan={handleEditPlan}
                    onViewDetails={handleViewDetails}
                    onViewTimeline={handleViewTimeline}
                />
            );

        case 'timeline':
            return <ScheduleView onBack={handleBackToDashboard} />;

        case 'form':
            return (
                <PlanForm
                    initialTreeId={treeIdParam || undefined}
                    plan={selectedPlan}
                    onCancel={handleFormCancel}
                    onSuccess={handleFormSuccess}
                />
            );

        case 'detail':
            return selectedPlan ? (
                <PlanDetail
                    plan={selectedPlan}
                    onBack={handleBackToDashboard}
                    onEdit={handleEditPlan}
                    onUpdate={refetch}
                />
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Plano não encontrado</p>
                    <button
                        onClick={handleBackToDashboard}
                        className="text-sm text-primary hover:underline mt-2"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            );

        default:
            return null;
    }
}

function ScheduleView({ onBack }: { onBack: () => void }) {
    const { plans, loading } = usePlans();

    if (loading) return <div className="p-8 text-center">Carregando cronograma...</div>;

    return (
        <div className="space-y-4 animate-in fade-in">
            <button
                onClick={onBack}
                className="text-sm text-muted-foreground hover:text-foreground"
            >
                ← Voltar ao Dashboard
            </button>
            <InterventionGantt plans={plans} />
        </div>
    );
}
