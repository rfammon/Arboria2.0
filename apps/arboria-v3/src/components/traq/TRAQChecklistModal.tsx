import { useState, useEffect } from 'react';
import { Button } from '../ui/button';

import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import {
    getScientificFailureProb,
    getImpactProb,
    runTraqMatrices,
    calculateCumulativeResidualRisk,
    calculatePotentiationScore,
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
                    failure_prob: factorProbs[originalIdx] || 'Improvável',
                    requires_probability: c.requires_probability
                };
            });

        const selectedCriteriaForScore = criteria
            .filter((_, idx) => riskFactors[idx])
            .map(c => ({ id: c.id, peso: c.peso, requires_probability: c.requires_probability }));

        const potentiationScore = calculatePotentiationScore(selectedCriteriaForScore);
        const hasAnyFactors = selectedCriteriaForScore.length > 0;

        const { probability: finalFailureProb, drivingFactor: finalDrivingFactor } = getScientificFailureProb(selectedFactorsForCalc);
        const currentImpactProb = getImpactProb(targetCategory);
        const computedInitialRisk = runTraqMatrices(finalFailureProb, currentImpactProb, targetCategory, hasAnyFactors);

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
            drivingFactor: finalDrivingFactor,
            potentiationScore
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
                failure_prob: factorProbs[originalIdx] || 'Improvável',
                requires_probability: c.requires_probability
            };
        });
    const { probability: uiScientificProb } = getScientificFailureProb(currentSelectedFactorsForUI);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 sm:p-4 animate-in fade-in duration-200">
            <div className="w-full sm:max-w-4xl h-[100dvh] sm:h-[85vh] bg-background flex flex-col sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                <div className="py-4 px-6 border-b flex-shrink-0 bg-background/95 backdrop-blur z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                                {step === 'checklist' && `Fator ${currentIndex + 1}/${criteria.length}`}
                                {step === 'target' && 'Ocupação do Alvo'}
                                {step === 'matrix' && 'Mitigação de Risco'}
                                {step === 'confirm' && 'Confirmação'}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                                {step === 'checklist' ? 'Análise de Defeitos' : 'Avaliação TRAQ'}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            type="button"
                            className="h-10 w-10 rounded-full hover:bg-muted"
                        >
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                </div>

                <div className="flex-shrink-0 px-2 py-2 bg-muted/30 border-b">
                    <div className="flex items-center justify-between w-full mx-auto max-w-lg">
                        {['Fatores', 'Alvo', 'Mitigação', 'Resumo'].map((label, idx) => {
                            const stepNamesInternal: FlashcardStep[] = ['checklist', 'target', 'matrix', 'confirm'];
                            const stepIndexInternal = stepNamesInternal.indexOf(step);
                            const isStepActive = idx === stepIndexInternal;
                            const isStepCompleted = idx < stepIndexInternal;
                            const isStepClickable = idx <= stepIndexInternal + 1;

                            return (
                                <div key={label} className="flex items-center flex-1 last:flex-none justify-center">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => isStepClickable && handleStepClick(stepNamesInternal[idx])}
                                            disabled={!isStepClickable}
                                            className={`
                                                flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all shrink-0
                                                ${isStepCompleted
                                                    ? 'bg-green-600 text-white shadow-sm'
                                                    : isStepActive
                                                        ? 'bg-primary text-primary-foreground ring-2 ring-primary/20 scale-110'
                                                        : isStepClickable
                                                            ? 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                                                            : 'bg-muted/50 text-muted-foreground/30'
                                                }
                                            `}
                                        >
                                            {isStepCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                                        </button>
                                        <span className={`
                                            text-[10px] sm:text-xs font-semibold hidden sm:inline-block transition-colors
                                            ${isStepActive ? 'text-primary' : isStepCompleted ? 'text-green-700' : 'text-muted-foreground'}
                                        `}>
                                            {label}
                                        </span>
                                    </div>

                                    {idx < 3 && (
                                        <div className="h-[2px] flex-1 mx-1 sm:mx-2 rounded-full overflow-hidden bg-muted/50 min-w-[10px]">
                                            <div className={`h-full transition-all duration-500 ${idx < stepIndexInternal ? 'bg-green-500 w-full' : 'w-0'}`} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-card/50">
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

                            {riskFactors[currentIndex] && (currentCriteriaToDisplay.requires_probability !== false) && (
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
                        <div className="space-y-2 h-full flex flex-col">
                            <div className="text-center mb-1 flex-shrink-0">
                                <h3 className="text-xl font-semibold mb-0.5">Taxa de Ocupação do Alvo</h3>
                                <p className="text-xs text-muted-foreground">Selecione a frequência de ocupação da área</p>
                            </div>

                            <RadioGroup value={targetCategory?.toString()} onValueChange={(v: string) => setTargetCategory(parseInt(v))} className="flex-1 flex flex-col justify-center">
                                <div className="space-y-2">
                                    {TARGET_CATEGORIES.map(opt => (
                                        <div
                                            key={opt.value}
                                            className={`flex items-center space-x-3 p-3 border-2 rounded-xl transition-all cursor-pointer hover:border-blue-500 ${targetCategory === opt.value
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                                : 'border-gray-200 dark:border-gray-700 bg-card'
                                                }`}
                                            onClick={() => setTargetCategory(opt.value)}
                                        >
                                            <RadioGroupItem value={opt.value.toString()} id={`target-${opt.value}`} className="mt-0.5" />
                                            <Label htmlFor={`target-${opt.value}`} className="flex-1 cursor-pointer">
                                                <div className="font-bold text-base">{opt.label}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-normal">{opt.desc}</div>
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
                </div>

                <div className="flex justify-between p-4 border-t bg-muted/30 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrev}
                        disabled={step === 'checklist' && currentIndex === 0}
                        className="w-24 border-2"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Voltar
                    </Button>

                    {step !== 'confirm' ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className={`min-w-[140px] font-bold shadow-sm transition-all
                                ${step === 'matrix' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-primary hover:bg-primary/90'}
                            `}
                        >
                            {step === 'checklist' && currentIndex === criteria.length - 1 ? 'Avançar' :
                                step === 'target' ? 'Continuar' :
                                    step === 'matrix' ? 'Revisar' : 'Próximo'}

                            {step === 'matrix' ? <ChevronRight className="ml-2 h-4 w-4" /> : <ChevronRight className="h-4 w-4 ml-2" />}
                        </Button>
                    ) : (
                        <div />
                    )}

                    <div className="flex gap-2">
                        {step === 'checklist' && (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleStepClick('target')}
                                    className="h-10 px-4 rounded-lg font-semibold text-muted-foreground hover:bg-muted"
                                >
                                    Pular
                                </Button>
                            </div>
                        )}

                        {/* Redundant 'Continuar' and 'Revisar' buttons removed to avoid pollution */}

                        {step === 'confirm' && (
                            <Button
                                type="button"
                                onClick={handleComplete}
                                className="h-12 px-8 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20 w-full sm:w-auto"
                            >
                                <Check className="mr-2 h-5 w-5" />
                                Finalizar
                            </Button>
                        )}
                    </div>
                </div>
            </div>
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
        <div className="space-y-4 pb-4">
            <div className="text-center mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">Matriz de Mitigação</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Para cada fator de risco identificado, selecione a ação de mitigação mais apropriada.
                </p>
            </div>

            <div className="space-y-4">
                {presentFactors.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <Check className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p>Nenhum fator de risco identificado.</p>
                    </div>
                ) : (
                    presentFactors.map((c, idx) => {
                        const originalIdx = criteria.findIndex(item => item.id === c.id);
                        const allowedMitigations = ALLOWED_MITIGATIONS_BY_CATEGORY[c.categoria] || ALLOWED_MITIGATIONS_BY_CATEGORY['Outros'];
                        const currentRisk = factorProbs[originalIdx];

                        return (
                            <div
                                key={c.id}
                                className="p-4 bg-background border rounded-2xl shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <span className={`
                                            text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full
                                            ${c.categoria === 'Raízes' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                c.categoria === 'Tronco' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}
                                        `}>
                                            {c.categoria}
                                        </span>
                                        <p className="text-base font-bold text-foreground leading-tight pt-1 pr-2">{c.criterio}</p>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0 pl-2">
                                        <span className="text-[10px] font-medium text-muted-foreground uppercase">Falha</span>
                                        <span className={`
                                            text-sm font-bold px-2 py-0.5 rounded-md mt-0.5
                                            ${currentRisk === 'Iminente' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                currentRisk === 'Provável' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}
                                        `}>
                                            {currentRisk}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-3 border-t">
                                    <Label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center justify-between">
                                        Ação de Mitigação Recomendada
                                    </Label>
                                    <Select
                                        value={mitigationsByFactor[c.id] || 'nenhum'}
                                        onValueChange={(v) => setMitigationsByFactor(prev => ({ ...prev, [c.id]: v as MitigationAction }))}
                                    >
                                        <SelectTrigger className="w-full h-12 rounded-xl bg-background border-2 border-muted-foreground/30 hover:border-primary/50 text-sm font-bold focus:ring-base/20 shadow-sm transition-all active:scale-[0.99] data-[state=open]:border-primary" type="button">
                                            <SelectValue placeholder="Selecione a ação..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {MITIGATION_ACTIONS.filter(a => allowedMitigations.includes(a.value)).map(action => (
                                                <SelectItem key={action.value} value={action.value}>
                                                    {action.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        );
                    })
                )}
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
    const hasAnyFactors = passedRiskFactors.some(v => v === true);
    const stepInitialRisk = runTraqMatrices(passedFailureProb, currentImpactProb, passedTargetCategory, hasAnyFactors);

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
        <div className="h-full flex flex-col items-center justify-center py-2 animate-in zoom-in-95 duration-500">
            <div className="text-center space-y-1 mb-4 flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-1 shadow-sm ring-4 ring-green-50 dark:ring-green-900/10">
                    <Check className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">Avaliação Concluída</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-xs">
                    Confira o impacto das mitigações no risco final.
                </p>
            </div>

            <div className="w-full max-w-sm bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all p-4 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
                <div className="space-y-0.5">
                    <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        <span>Risco Inicial</span>
                        <span className="text-[10px]">Sem Mitigação</span>
                    </div>
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between bg-muted/20 ${RISK_PROFILES[stepInitialRisk].className}`}>
                        <span className="font-bold text-base">{stepInitialRisk}</span>
                    </div>
                </div>

                <div className="relative flex items-center justify-center py-1">
                    <div className="h-px w-full bg-border absolute"></div>
                    <span className="bg-card px-2 text-[10px] text-muted-foreground relative z-10 font-medium tracking-tight">MITIGAÇÃO APLICADA</span>
                </div>

                <div className="space-y-0.5">
                    <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        <span>Risco Residual</span>
                        <span className="text-[10px]">Com Ações</span>
                    </div>
                    <div className={`p-3 rounded-xl border-2 flex items-center justify-between shadow-sm ${RISK_PROFILES[summaryResidualRisk].className} border-current`}>
                        <span className="font-bold text-lg">{summaryResidualRisk}</span>
                        <Check className="h-4 w-4" />
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between items-center text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        <span>Fatores Agravantes</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {(() => {
                            const aggravatingFactors = passedCriteria
                                .filter((c, idx) => passedRiskFactors[idx] && c.requires_probability === false);

                            if (aggravatingFactors.length === 0) {
                                return <span className="text-xs text-muted-foreground italic w-full text-center py-2">Nenhum fator agravante identificado.</span>;
                            }

                            return aggravatingFactors.map(c => (
                                <span key={c.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                                    {c.criterio}
                                </span>
                            ));
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
