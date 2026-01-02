import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import { TRAQChecklistModal } from '../../traq/TRAQChecklistModal';
import type { TRAQAssessment } from '../../../types/traq';
import { toast } from 'sonner';

interface RiskAssessmentSectionProps {
    treeId?: string;
    watch: any;
    setValue: any;
    criteria: any;
}

export function RiskAssessmentSection({
    treeId,
    watch,
    setValue,
    criteria
}: RiskAssessmentSectionProps) {
    const [showTRAQ, setShowTRAQ] = useState(false);

    const handleTRAQComplete = (assessment: TRAQAssessment) => {
        setValue('pontuacao', assessment.totalScore);
        setValue('risco', assessment.initialRisk);
        setValue('failure_prob', assessment.failureProb);
        setValue('impact_prob', assessment.impactProb);
        setValue('target_category', assessment.targetCategory || 0);
        setValue('residual_risk', assessment.residualRisk);
        setValue('risk_factors', assessment.riskFactors);
        setValue('mitigation', assessment.mitigationAction);

        toast.success(`Avaliação TRAQ concluída: Risco ${assessment.initialRisk}`);
        setShowTRAQ(false);
    };

    return (
        <div className="space-y-4 pt-4 border-t">
            <label className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Avaliação de Risco (TRAQ)
            </label>

            <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setShowTRAQ(true)}
                >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {treeId ? 'Refazer Avaliação TRAQ' : 'Realizar Avaliação TRAQ'}
                </Button>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                    <div className="border p-2 rounded bg-background">
                        <span className="block opacity-70">Risco</span>
                        <span className="font-medium text-foreground text-sm uppercase">
                            {watch('risco') || '-'}
                        </span>
                    </div>
                    <div className="border p-2 rounded bg-background">
                        <span className="block opacity-70">Pontuação</span>
                        <span className="font-medium text-foreground text-sm">
                            {watch('pontuacao') || 0}
                        </span>
                    </div>
                </div>
            </div>

            <TRAQChecklistModal
                isOpen={showTRAQ}
                onClose={() => setShowTRAQ(false)}
                onComplete={handleTRAQComplete}
                criteria={criteria}
            />
        </div>
    );
}
