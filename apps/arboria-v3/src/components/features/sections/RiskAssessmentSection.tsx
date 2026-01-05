import { useState } from 'react';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { TRAQChecklistModal } from '../../traq/TRAQChecklistModal';
import type { TRAQAssessment } from '../../../types/traq';
import { toast } from 'sonner';
import { RISK_PROFILES } from '../../../lib/traq/traqLogic';

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

    const currentRisk = watch('risco');
    const currentScore = watch('pontuacao');
    const riskFactors = watch('risk_factors') || [];
    const hasAssessment = currentRisk && currentScore;

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

    const getRiskProfile = (risk: string) => {
        return RISK_PROFILES[risk as keyof typeof RISK_PROFILES] || RISK_PROFILES.Baixo;
    };

    return (
        <div className="space-y-6 pt-6 border-t border-border/50">
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                    <Shield className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Avaliação de Risco (TRAQ)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Análise de risco estrutural e fitossanitário
                    </p>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-muted/20 p-5 rounded-xl border border-border/50 space-y-4">
                {hasAssessment ? (
                    <>
                        {/* Assessment Summary */}
                        <div className="bg-background/50 p-4 rounded-lg border border-border/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span className="text-sm font-semibold">Avaliação Concluída</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowTRAQ(true)}
                                    className="h-8"
                                >
                                    Editar
                                </Button>
                            </div>

                            {/* Risk Badge */}
                            <div className="flex items-center gap-3">
                                <div
                                    className="px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide"
                                    style={{
                                        backgroundColor: getRiskProfile(currentRisk).bgColor,
                                        color: getRiskProfile(currentRisk).color
                                    }}
                                >
                                    Risco {currentRisk}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Pontuação: <span className="font-semibold text-foreground">{currentScore}</span>
                                </div>
                            </div>

                            {/* Risk Factors Count */}
                            {riskFactors.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                    {riskFactors.filter((f: number) => f === 1).length} fatores de risco identificados
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* Call to Action */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-14 border-dashed border-2 flex items-center justify-center gap-3 text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                            onClick={() => setShowTRAQ(true)}
                        >
                            <AlertTriangle className="w-5 h-5" />
                            <span className="font-medium">
                                {treeId ? 'Refazer Avaliação TRAQ' : 'Realizar Avaliação TRAQ'}
                            </span>
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            A avaliação TRAQ é essencial para identificar riscos estruturais
                        </p>
                    </>
                )}
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
