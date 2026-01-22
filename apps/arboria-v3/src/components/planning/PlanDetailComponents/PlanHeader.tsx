import { ArrowLeft, Edit, Trash2, Play } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';
import { INTERVENTION_LABELS } from '../../../lib/planUtils';
import type { InterventionPlan } from '../../../types/plan';

interface PlanHeaderProps {
    plan: InterventionPlan;
    onBack: () => void;
    onEdit: (plan: InterventionPlan) => void;
    onDelete: () => void;
    onGenerateOS: () => void;
    isGenerating: boolean;
    daysUntil: number | null;
    urgencyConfig: {
        label: string;
        color: string;
        cssClass: string;
    };
    icon: string;
}

export function PlanHeader({
    plan,
    onBack,
    onEdit,
    onDelete,
    onGenerateOS,
    isGenerating,
    daysUntil,
    urgencyConfig,
    icon
}: PlanHeaderProps) {
    return (
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
                    onClick={onGenerateOS}
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
                    onClick={onDelete}
                    className="flex-1 lg:flex-none"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                </Button>
            </div>
        </div>
    );
}
