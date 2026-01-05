import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import {
    getScientificFailureProb,
    getImpactProb,
    runTraqMatrices,
    calculateCumulativeResidualRisk,
    RISK_PROFILES,
    TARGET_CATEGORIES,
    MITIGATION_ACTIONS,
    ALLOWED_MITIGATIONS_BY_CATEGORY
} from '../../lib/traq/traqLogic';
import type { TRAQRiskCriteria, TRAQAssessment, MitigationAction, FactorAssessment } from '../../types/traq';
import type { FailureProbability } from '../../lib/traq/traqLogic';

interface TRAQChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (assessment: TRAQAssessment) => void;
    criteria: TRAQRiskCriteria[];
}

type FlashcardStep = 'checklist' | 'target' | 'matrix' | 'confirm';

export function TRAQChecklistModal({
    isOpen,
    onClose,
    onComplete,
    criteria
}: TRAQChecklistModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [step, setStep] = useState<FlashcardStep>('checklist');
    const [riskFactors, setRiskFactors] = useState<boolean[]>(new Array(criteria.length).fill(false));
    const [factorProbs, setFactorProbs] = useState<(FailureProbability | null)[]>(new Array(criteria.length).fill(null));
    const [mitigationsByFactor, setMitigationsByFactor] = useState<Record<number, MitigationAction>>({});
    const [targetCategory, setTargetCategory] = useState<number | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setStep('checklist');
            setRiskFactors(new Array(criteria.length).fill(false));
            setFactorProbs(new Array(criteria.length).fill(null));
            setMitigationsByFactor({});
            setTargetCategory(null);
        }
    }, [isOpen, criteria.length]);

    const handleSetRisk = (index: number, isPresent: boolean) => {
        const newFactors = [...riskFactors];
        newFactors[index] = isPresent;
        setRiskFactors(newFactors);

        if (!isPresent) {
            const newProbs = [...factorProbs];
            newProbs[index] = null;
            setFactorProbs(newProbs);

            const newMitigations = { ...mitigationsByFactor };
            delete newMitigations[criteria[index].id];
            setMitigationsByFactor(newMitigations);
        }

        if (!isPresent && index < criteria.length - 1) {
            setTimeout(() => setCurrentIndex(index + 1), 400);
        }
    };

    const handleStepClick = (stepName: FlashcardStep) => {
        const stepOrder: FlashcardStep[] = ['checklist', 'target', 'matrix', 'confirm'];
        const currentStepIndex = stepOrder.indexOf(step);
        const targetStepIndex = stepOrder.indexOf(stepName);

        if (targetStepIndex <= currentStepIndex + 1) {
            if (stepName === 'checklist') {
                setStep('checklist');
                setCurrentIndex(0);
            } else if (stepName === 'target') {
                setStep('target');
            } else if (stepName === 'matrix') {
                if (!targetCategory) {
                    alert('Por favor, selecione a taxa de ocupação do alvo primeiro');
                    return;
                }
                setStep('matrix');
            } else if (stepName === 'confirm') {
                setStep('confirm');
            }
        }
    };

    const handleNext = () => {
        if (step === 'checklist') {
            if (currentIndex < criteria.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                setStep('target');
            }
        } else if (step === 'target') {
            if (!targetCategory) {
                alert('Por favor, selecione a taxa de ocupação do alvo');
                return;
            }
            setStep('matrix');
        } else if (step === 'matrix') {
            setStep('confirm');
        }
    };

    const handlePrev = () => {
        if (step === 'confirm') {
            setStep('matrix');
        } else if (step === 'matrix') {
            setStep('target');
        } else if (step === 'target') {
            setStep('checklist');
            setCurrentIndex(criteria.length - 1);
        } else if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleComplete = () => {
        if (!targetCategory) return;

        const selectedFactorsForCalc = criteria
            .filter((_, idx) => riskFactors[idx])
            .map(c => {
                const originalIdx = criteria.findIndex(item => item.id === c.id);
                return {
                    criterio: c.criterio,
                    failure_prob: factorProbs[originalIdx] || 'Improvável'
                };
            });

        const { probability: finalFailureProb, drivingFactor: finalDrivingFactor } = getScientificFailureProb(selectedFactorsForCalc);
        const currentImpactProb = getImpactProb(targetCategory);
        const computedInitialRisk = runTraqMatrices(finalFailureProb, currentImpactProb, targetCategory);

        const factorsWithMitigationsForResidualList = criteria
            .filter((_, idx) => riskFactors[idx])
            .map(c => {
                const originalIdx = criteria.findIndex(item => item.id === c.id);
                return {
                    failureProb: (factorProbs[originalIdx] || 'Improvável') as FailureProbability,
                    mitigationAction: mitigationsByFactor[c.id] || 'nenhuma'
                };
            });

        const { residualRisk: computedResidualRisk } = calculateCumulativeResidualRisk(
            factorsWithMitigationsForResidualList,
            currentImpactProb,
            targetCategory
        );

        const factorsAssessment: FactorAssessment[] = criteria
            .filter((_, idx) => riskFactors[idx])
            .map(c => {
                const originalIdx = criteria.findIndex(item => item.id === c.id);
                return {
                    criteriaId: c.id,
                    probability: factorProbs[originalIdx],
                    mitigation: mitigationsByFactor[c.id] || 'nenhuma'
                };
            });

        const assessment: TRAQAssessment = {
            targetCategory,
            factors: factorsAssessment,
            mitigationAction: JSON.stringify(mitigationsByFactor),
            riskFactors: riskFactors.map(v => v ? 1 : 0),
            totalScore: 0,
            failureProb: finalFailureProb,
            impactProb: currentImpactProb,
            initialRisk: computedInitialRisk,
            residualRisk: computedResidualRisk,
            drivingFactor: finalDrivingFactor
        };

        onComplete(assessment);
        onClose();
    };

    if (!isOpen) return null;

    const currentCriteriaToDisplay = criteria[currentIndex];

    const currentSelectedFactorsForUI = criteria
        .filter((_, idx) => riskFactors[idx])
        .map(c => {
            const originalIdx = criteria.findIndex(item => item.id === c.id);
            return {
                criterio: c.criterio,
                failure_prob: factorProbs[originalIdx] || 'Improvável'
            };
        });
    const { probability: uiScientificProb } = getScientificFailureProb(currentSelectedFactorsForUI);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <Card className="w-full max-w-3xl max-h-[98vh] flex flex-col overflow-hidden">
                <CardHeader className="py-3 px-6 border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                {step === 'checklist' && `Fator de Risco ${currentIndex + 1} de ${criteria.length}`}
                                {step === 'target' && 'Etapa 2 de 4: Taxa de Ocupação do Alvo'}
                                {step === 'matrix' && 'Etapa 3 de 4: Matriz de Mitigação'}
                                {step === 'confirm' && 'Etapa 4 de 4: Confirmação'}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Avaliação TRAQ - {step === 'checklist' ? 'Checklist de Fatores de Risco' : 'Metodologia ISA'}
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose} type="button">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="flex items-center justify-between px-4 sm:px-8 py-2 bg-muted/30 border-b overflow-x-auto no-scrollbar shrink-0">
                    <div className="flex items-center justify-center w-full mx-auto max-w-lg">
                        {['Checklist', 'Alvo', 'Mitigação', 'Confirmar'].map((label, idx) => {
                            const stepNamesInternal: FlashcardStep[] = ['checklist', 'target', 'matrix', 'confirm'];
                            const stepIndexInternal = stepNamesInternal.indexOf(step);
                            const isStepActive = idx === stepIndexInternal;
                            const isStepCompleted = idx < stepIndexInternal;
                            const isStepClickable = idx <= stepIndexInternal + 1;

                            // turbo
                            return (
                                <div key={label} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => isStepClickable && handleStepClick(stepNamesInternal[idx])}
                                        disabled={!isStepClickable}
                                        className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold transition-all ${isStepCompleted ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' :
                                            isStepActive ? 'bg-primary text-primary-foreground cursor-default' :
                                                isStepClickable ? 'bg-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/50 cursor-pointer' :
                                                    'bg-muted text-muted-foreground/50 cursor-not-allowed'
                                            } ${isStepClickable && !isStepActive ? 'hover:scale-110' : ''}`}
                                    >
                                        {isStepCompleted ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : idx + 1}
                                    </button>
                                    {idx < 3 && <div className={`w-4 sm:w-8 h-1 mx-0.5 sm:mx-1 ${idx < stepIndexInternal ? 'bg-green-500' : 'bg-muted'}`} />}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <CardContent className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {step === 'checklist' && currentCriteriaToDisplay && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <span className="inline-block px-3 py-1 text-[10px] font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-full mb-1">
                                    {currentCriteriaToDisplay.categoria}
                                </span>
                                <h3 className="text-xl font-semibold mb-1">{currentCriteriaToDisplay.criterio}</h3>
                                {currentCriteriaToDisplay.tooltip && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                        {currentCriteriaToDisplay.tooltip}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-4 my-2">
                                <Button
                                    type="button"
                                    variant={!riskFactors[currentIndex] ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => handleSetRisk(currentIndex, false)}
                                    className={`h-16 w-36 text-base font-bold rounded-xl transition-all ${!riskFactors[currentIndex]
                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
                                        : 'hover:bg-accent text-muted-foreground border-2 opacity-60'
                                        }`}
                                >
                                    NÃO
                                </Button>

                                <Button
                                    type="button"
                                    variant={riskFactors[currentIndex] ? "destructive" : "outline"}
                                    size="lg"
                                    onClick={() => handleSetRisk(currentIndex, true)}
                                    className={`h-16 w-36 text-base font-bold rounded-xl transition-all ${riskFactors[currentIndex]
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                                        : 'hover:bg-accent text-muted-foreground border-2 opacity-60'
                                        }`}
                                >
                                    SIM
                                </Button>
                            </div>

                            {riskFactors[currentIndex] && (
                                <div className="space-y-3 p-3 bg-muted/20 border-2 border-dashed border-red-200 dark:border-red-900/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        Qual a probabilidade de falha deste fator?
                                    </Label>

                                    <div className="grid grid-cols-3 gap-2">
                                        {(['Possível', 'Provável', 'Iminente'] as FailureProbability[]).map((p) => (
                                            <Button
                                                key={p}
                                                type="button"
                                                variant={factorProbs[currentIndex] === p ? 'default' : 'outline'}
                                                className="text-xs h-10 px-1"
                                                onClick={() => {
                                                    const nextProbs = [...factorProbs];
                                                    nextProbs[currentIndex] = p;
                                                    setFactorProbs(nextProbs);
                                                    if (currentIndex < criteria.length - 1) {
                                                        setTimeout(() => setCurrentIndex(currentIndex + 1), 500);
                                                    }
                                                }}
                                            >
                                                {p}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'target' && (
                        <div className="space-y-4">
                            <div className="text-center mb-2">
                                <h3 className="text-xl font-semibold mb-1">Taxa de Ocupação do Alvo</h3>
                                <p className="text-xs text-muted-foreground">Selecione a frequência de ocupação da área</p>
                            </div>

                            <RadioGroup value={targetCategory?.toString()} onValueChange={(v: string) => setTargetCategory(parseInt(v))}>
                                <div className="space-y-3">
                                    {TARGET_CATEGORIES.map(opt => (
                                        <div
                                            key={opt.value}
                                            className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer hover:border-blue-500 ${targetCategory === opt.value
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                            onClick={() => setTargetCategory(opt.value)}
                                        >
                                            <RadioGroupItem value={opt.value.toString()} id={`target-${opt.value}`} className="mt-1" />
                                            <Label htmlFor={`target-${opt.value}`} className="flex-1 cursor-pointer">
                                                <div className="font-semibold text-lg">{opt.label}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{opt.desc}</div>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {step === 'matrix' && targetCategory && (
                        <RiskMatrixStep
                            criteria={criteria}
                            riskFactors={riskFactors}
                            factorProbs={factorProbs}
                            mitigationsByFactor={mitigationsByFactor}
                            setMitigationsByFactor={setMitigationsByFactor}
                        />
                    )}

                    {step === 'confirm' && targetCategory && (
                        <ConfirmationStep
                            passedFailureProb={uiScientificProb}
                            passedTargetCategory={targetCategory}
                            passedMitigationsByFactor={mitigationsByFactor}
                            passedCriteria={criteria}
                            passedRiskFactors={riskFactors}
                            passedFactorProbs={factorProbs}
                        />
                    )}
                </CardContent>

                <div className="flex justify-between p-4 border-t bg-muted/30 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        disabled={step === 'checklist' && currentIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Anterior
                    </Button>

                    {step !== 'confirm' ? (
                        <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90">
                            {step === 'checklist' && currentIndex === criteria.length - 1 ? 'Avançar' : 'Próximo'}
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4 mr-2" />
                            Salvar
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}

function RiskMatrixStep({
    criteria,
    riskFactors,
    factorProbs,
    mitigationsByFactor,
    setMitigationsByFactor
}: {
    criteria: TRAQRiskCriteria[];
    riskFactors: boolean[];
    factorProbs: (FailureProbability | null)[];
    mitigationsByFactor: Record<number, MitigationAction>;
    setMitigationsByFactor: React.Dispatch<React.SetStateAction<Record<number, MitigationAction>>>;
}) {
    const presentFactors = criteria.filter((_, idx) => riskFactors[idx]);

    return (
        <div className="space-y-2">
            <h3 className="text-lg font-bold text-center">Matriz de Mitigação</h3>
            <div className="space-y-2 overflow-y-auto max-h-[400px]">
                {presentFactors.map((c) => {
                    const originalIdx = criteria.findIndex(item => item.id === c.id);
                    const allowedMitigations = ALLOWED_MITIGATIONS_BY_CATEGORY[c.categoria] || ALLOWED_MITIGATIONS_BY_CATEGORY['Outros'];

                    return (
                        <Card key={c.id} className="p-2 px-3 border-l-4 border-l-red-500">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <span className="text-[10px] uppercase text-muted-foreground">{c.categoria}</span>
                                    <p className="text-sm font-semibold">{c.criterio}</p>
                                </div>
                                <div className="text-[10px] font-bold text-red-700">{factorProbs[originalIdx]}</div>
                            </div>

                            <Select
                                value={mitigationsByFactor[c.id] || 'nenhum'}
                                onValueChange={(v) => setMitigationsByFactor(prev => ({ ...prev, [c.id]: v as MitigationAction }))}
                            >
                                <SelectTrigger className="h-8 text-xs" type="button">
                                    <SelectValue placeholder="Mitigação..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {MITIGATION_ACTIONS.filter(a => allowedMitigations.includes(a.value)).map(action => (
                                        <SelectItem key={action.value} value={action.value}>
                                            {action.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function ConfirmationStep({
    passedFailureProb,
    passedTargetCategory,
    passedMitigationsByFactor,
    passedCriteria,
    passedRiskFactors,
    passedFactorProbs
}: {
    passedFailureProb: FailureProbability;
    passedTargetCategory: number;
    passedMitigationsByFactor: Record<number, MitigationAction>;
    passedCriteria: TRAQRiskCriteria[];
    passedRiskFactors: boolean[];
    passedFactorProbs: (FailureProbability | null)[];
}) {
    const currentImpactProb = getImpactProb(passedTargetCategory);
    const stepInitialRisk = runTraqMatrices(passedFailureProb, currentImpactProb, passedTargetCategory);

    const factorsWithMitigationsForSummary = passedCriteria
        .filter((_, idx) => passedRiskFactors[idx])
        .map(c => {
            const originalIdx = passedCriteria.findIndex(item => item.id === c.id);
            return {
                failureProb: (passedFactorProbs[originalIdx] || 'Improvável') as FailureProbability,
                mitigationAction: passedMitigationsByFactor[c.id] || 'nenhuma'
            };
        });

    const { residualRisk: summaryResidualRisk } = calculateCumulativeResidualRisk(
        factorsWithMitigationsForSummary,
        currentImpactProb,
        passedTargetCategory
    );

    return (
        <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold">Resumo dos Riscos</h3>
            <div className="bg-muted/40 p-4 rounded-lg space-y-3 text-left max-w-md mx-auto">
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm">Risco Inicial:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${RISK_PROFILES[stepInitialRisk].className}`}>
                        {stepInitialRisk}
                    </span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm">Risco Residual:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${RISK_PROFILES[summaryResidualRisk].className}`}>
                        {summaryResidualRisk}
                    </span>
                </div>
            </div>
        </div>
    );
}
