import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import {
    getScientificFailureProb,
    getImpactProb,
    runTraqMatrices,
    calculateResidualRisk,
    RISK_PROFILES,
    TARGET_CATEGORIES,
    MITIGATION_ACTIONS
} from '../../lib/traq/traqLogic';
import type { TRAQRiskCriteria, TRAQAssessment, MitigationAction } from '../../types/traq';
import type { FailureProbability } from '../../lib/traq/traqLogic';

interface TRAQChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (assessment: TRAQAssessment) => void;
    criteria: TRAQRiskCriteria[];
}

type FlashcardStep = 'checklist' | 'target' | 'risk' | 'confirm';

export function TRAQChecklistModal({
    isOpen,
    onClose,
    onComplete,
    criteria
}: TRAQChecklistModalProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [step, setStep] = useState<FlashcardStep>('checklist');
    const [riskFactors, setRiskFactors] = useState<boolean[]>(new Array(criteria.length).fill(false));
    const [targetCategory, setTargetCategory] = useState<number | null>(null);
    const [mitigationAction, setMitigationAction] = useState<MitigationAction>('nenhuma');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setStep('checklist');
            setRiskFactors(new Array(criteria.length).fill(false));
            setTargetCategory(null);
            setMitigationAction('nenhuma');
        }
    }, [isOpen, criteria.length]);

    const totalScore = riskFactors.reduce((sum, checked, idx) =>
        sum + (checked ? criteria[idx]?.peso || 0 : 0), 0
    );

    const handleToggle = (index: number) => {
        const newFactors = [...riskFactors];
        newFactors[index] = !newFactors[index];
        setRiskFactors(newFactors);

        // Auto-advance se marcou SIM (sem toast)
        if (newFactors[index] && index < criteria.length - 1) {
            setTimeout(() => setCurrentIndex(index + 1), 600);
        }
    };

    const handleStepClick = (stepName: FlashcardStep) => {
        // Permitir navegação apenas para etapas já visitadas ou próxima etapa
        const stepOrder: FlashcardStep[] = ['checklist', 'target', 'risk', 'confirm'];
        const currentStepIndex = stepOrder.indexOf(step);
        const targetStepIndex = stepOrder.indexOf(stepName);

        // Permitir voltar para qualquer etapa anterior ou avançar para a próxima
        if (targetStepIndex <= currentStepIndex + 1) {
            if (stepName === 'checklist') {
                setStep('checklist');
                setCurrentIndex(0);
            } else if (stepName === 'target') {
                setStep('target');
            } else if (stepName === 'risk') {
                if (!targetCategory) {
                    alert('Por favor, selecione a taxa de ocupação do alvo primeiro');
                    return;
                }
                setStep('risk');
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
            setStep('risk');
        } else if (step === 'risk') {
            setStep('confirm');
        }
    };

    const handlePrev = () => {
        if (step === 'confirm') {
            setStep('risk');
        } else if (step === 'risk') {
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

        // Scientific Logic: Get highest failure probability from selected factors
        const selectedFactors = criteria.filter((_, idx) => riskFactors[idx]);
        const { probability: failureProb } = getScientificFailureProb(selectedFactors);

        const impactProb = getImpactProb(targetCategory);
        const initialRisk = runTraqMatrices(failureProb, impactProb, targetCategory);
        const { residualRisk } = calculateResidualRisk(
            failureProb,
            impactProb,
            targetCategory,
            mitigationAction
        );

        const assessment: TRAQAssessment = {
            targetCategory,
            mitigationAction,
            riskFactors: riskFactors.map(v => v ? 1 : 0),
            totalScore,
            failureProb,
            impactProb,
            initialRisk,
            residualRisk,
            drivingFactor
        };

        onComplete(assessment);
        onClose();
    };

    if (!isOpen) return null;

    const currentCriteria = criteria[currentIndex];

    // Scientific Logic Calculation
    const selectedFactors = criteria.filter((_, idx) => riskFactors[idx]);
    const { probability: scientificFailureProb, drivingFactor } = getScientificFailureProb(selectedFactors);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <Card className="w-full max-w-3xl max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">
                                {step === 'checklist' && `Fator de Risco ${currentIndex + 1} de ${criteria.length}`}
                                {step === 'target' && 'Etapa 2 de 4: Taxa de Ocupação do Alvo'}
                                {step === 'risk' && 'Etapa 3 de 4: Análise de Risco'}
                                {step === 'confirm' && 'Etapa 4 de 4: Confirmação'}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Avaliação TRAQ - {step === 'checklist' ? 'Checklist de Fatores de Risco' : 'Metodologia ISA'}
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>

                {/* Stepper Visual - Clickable */}
                <div className="flex items-center justify-between px-8 py-4 bg-muted/30 border-b">
                    {['Checklist', 'Alvo', 'Risco', 'Confirmar'].map((label, idx) => {
                        const stepNames: FlashcardStep[] = ['checklist', 'target', 'risk', 'confirm'];
                        const stepIndex = stepNames.indexOf(step);
                        const isActive = idx === stepIndex;
                        const isCompleted = idx < stepIndex;
                        const isClickable = idx <= stepIndex + 1; // Pode clicar em etapas anteriores ou próxima

                        return (
                            <div key={label} className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => isClickable && handleStepClick(stepNames[idx])}
                                    disabled={!isClickable}
                                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all ${isCompleted ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' :
                                        isActive ? 'bg-primary text-primary-foreground cursor-default' :
                                            isClickable ? 'bg-muted-foreground/30 text-muted-foreground hover:bg-muted-foreground/50 cursor-pointer' :
                                                'bg-muted text-muted-foreground/50 cursor-not-allowed'
                                        } ${isClickable && !isActive ? 'hover:scale-110' : ''}`}
                                    title={isClickable ? `Ir para ${label}` : 'Não disponível ainda'}
                                >
                                    {isCompleted ? <Check className="h-5 w-5" /> : idx + 1}
                                </button>
                                {idx < 3 && <div className={`w-16 h-1 mx-2 ${idx < stepIndex ? 'bg-green-500' : 'bg-muted'
                                    }`} />}
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <CardContent className="p-8">
                    {/* Checklist Step */}
                    {step === 'checklist' && currentCriteria && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-full mb-3">
                                    {currentCriteria.categoria}
                                </span>
                                <h3 className="text-2xl font-semibold mb-2">{currentCriteria.criterio}</h3>
                                {currentCriteria.tooltip && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                        {currentCriteria.tooltip}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-4 my-8">
                                <Button
                                    type="button"
                                    variant={riskFactors[currentIndex] ? "destructive" : "outline"}
                                    size="lg"
                                    onClick={() => handleToggle(currentIndex)}
                                    className={`h-20 w-48 text-xl font-bold rounded-xl transition-all ${riskFactors[currentIndex]
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20'
                                        : 'hover:bg-accent text-muted-foreground border-2'
                                        }`}
                                >
                                    {riskFactors[currentIndex] ? (
                                        <span className="flex items-center gap-2">
                                            <X className="w-6 h-6" /> SIM
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs"></span>
                                            NÃO
                                        </span>
                                    )}
                                </Button>
                                <p className="text-sm text-muted-foreground mt-2">
                                    O fator de risco está presente?
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-4 text-sm">
                                <div className={`px-4 py-2 rounded-lg ${riskFactors[currentIndex]
                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                    }`}>
                                    <span className="font-semibold">
                                        {riskFactors[currentIndex] ? `+${currentCriteria.peso} pontos` : '0 pontos'}
                                    </span>
                                </div>
                                <div className="text-gray-500">
                                    Pontuação total: <span className="font-bold text-gray-900 dark:text-white">{totalScore}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Target Step */}
                    {step === 'target' && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-semibold mb-2">Taxa de Ocupação do Alvo</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Selecione a frequência de ocupação da área que seria atingida em caso de queda
                                </p>
                            </div>

                            <RadioGroup value={targetCategory?.toString()} onValueChange={(v: string) => setTargetCategory(parseInt(v))}>
                                <div className="space-y-3">
                                    {TARGET_CATEGORIES.map(option => (
                                        <div
                                            key={option.value}
                                            className={`flex items-start space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer hover:border-blue-500 ${targetCategory === option.value
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                            onClick={() => setTargetCategory(option.value)}
                                        >
                                            <RadioGroupItem value={option.value.toString()} id={`target-${option.value}`} className="mt-1" />
                                            <Label htmlFor={`target-${option.value}`} className="flex-1 cursor-pointer">
                                                <div className="font-semibold text-lg">{option.label}</div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.desc}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">Ex: {option.examples}</div>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    {/* Risk Analysis Step */}
                    {step === 'risk' && targetCategory && (
                        <RiskAnalysisStep
                            totalScore={totalScore}
                            calculatedFailureProb={scientificFailureProb}
                            drivingFactor={drivingFactor}
                            targetCategory={targetCategory}
                            mitigationAction={mitigationAction}
                            setMitigationAction={setMitigationAction}
                        />
                    )}

                    {/* Confirmation Step */}
                    {step === 'confirm' && targetCategory && (
                        <ConfirmationStep
                            totalScore={totalScore}
                            calculatedFailureProb={scientificFailureProb}
                            targetCategory={targetCategory}
                            mitigationAction={mitigationAction}
                            riskFactorsCount={riskFactors.filter(Boolean).length}
                        />
                    )}
                </CardContent>

                {/* Footer */}
                <div className="flex justify-between p-6 border-t bg-muted/30">
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
                            {step === 'checklist' && currentIndex === criteria.length - 1 ? 'Avançar para Alvo' : 'Próximo'}
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button type="button" onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                            <Check className="h-4 w-4 mr-2" />
                            Confirmar e Salvar
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}

// Sub-componente: Análise de Risco
function RiskAnalysisStep({
    calculatedFailureProb,
    drivingFactor,
    targetCategory,
    mitigationAction,
    setMitigationAction
}: {
    totalScore?: number; // Kept in type to avoid breaking caller, but optional/ignored
    calculatedFailureProb: FailureProbability;
    drivingFactor?: string;
    targetCategory: number;
    mitigationAction: string;
    setMitigationAction: (action: MitigationAction) => void;
}) {
    const failureProb = calculatedFailureProb;
    const impactProb = getImpactProb(targetCategory);
    const initialRisk = runTraqMatrices(failureProb, impactProb, targetCategory);
    const { residualRisk } = calculateResidualRisk(failureProb, impactProb, targetCategory, mitigationAction);

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">Análise de Risco TRAQ</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Resultado do cálculo baseado na metodologia ISA
                </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <Card className="p-2 text-center border-2 flex flex-col justify-center items-center">
                    <div className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-1 leading-tight">Prob. Falha</div>
                    <div className="text-base sm:text-xl font-bold">{failureProb}</div>
                    <div className="text-[10px] text-gray-500 mt-1 px-1 w-full truncate">
                        {drivingFactor ? `Motivo: ${drivingFactor}` : `...`}
                    </div>
                </Card>

                <Card className="p-2 text-center border-2 flex flex-col justify-center items-center">
                    <div className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 mb-1 leading-tight">Prob. Impacto</div>
                    <div className="text-base sm:text-xl font-bold">{impactProb}</div>
                    <div className="text-[10px] text-gray-500 mt-1">Cat. {targetCategory}</div>
                </Card>

                <Card
                    className={`p-2 text-center border-2 flex flex-col justify-center items-center ${RISK_PROFILES[initialRisk].className}`}
                >
                    <div className="text-[10px] sm:text-sm mb-1 leading-tight font-medium opacity-80">
                        <strong>Risco<br className="sm:hidden" /> Inicial</strong>
                    </div>
                    <div className="text-lg sm:text-2xl font-bold leading-none my-1">
                        {initialRisk}
                    </div>
                    <div className="text-xs sm:text-sm">
                        {RISK_PROFILES[initialRisk].icon}
                    </div>
                </Card>
            </div>

            {initialRisk !== 'Baixo' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-yellow-800 dark:text-yellow-300">Atenção Requerida</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                Risco {initialRisk} detectado. Recomenda-se definir uma ação de mitigação.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <Label className="text-base font-semibold">Ação de Mitigação Recomendada</Label>
                <Select value={mitigationAction} onValueChange={(v) => setMitigationAction(v as MitigationAction)}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {MITIGATION_ACTIONS.map(action => (
                            <SelectItem key={action.value} value={action.value}>
                                <div>
                                    <div className="font-medium">{action.label}</div>
                                    <div className="text-xs text-gray-500">{action.desc}</div>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {mitigationAction !== 'nenhuma' && (
                    <Card className={`p-4 border-2 ${RISK_PROFILES[residualRisk].className}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium opacity-80">Risco Residual (após mitigação)</div>
                                <div className="text-xl font-bold mt-1">
                                    {residualRisk}
                                </div>
                            </div>
                            <div className="text-3xl">
                                {RISK_PROFILES[residualRisk].icon}
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Sub-componente: Confirmação
function ConfirmationStep({
    totalScore,
    calculatedFailureProb,
    targetCategory,
    mitigationAction,
    riskFactorsCount
}: {
    totalScore: number;
    calculatedFailureProb: FailureProbability;
    targetCategory: number;
    mitigationAction: string;
    riskFactorsCount: number;
}) {
    const failureProb = calculatedFailureProb;
    const impactProb = getImpactProb(targetCategory);
    const initialRisk = runTraqMatrices(failureProb, impactProb, targetCategory);
    const { residualRisk } = calculateResidualRisk(failureProb, impactProb, targetCategory, mitigationAction);
    const mitigationLabel = MITIGATION_ACTIONS.find(a => a.value === mitigationAction)?.label || mitigationAction;

    return (
        <div className="space-y-6 text-center">
            <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-semibold mb-2">Avaliação Concluída</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Revise os dados antes de confirmar e salvar
                </p>
            </div>

            <div className="bg-muted/40 p-6 rounded-lg space-y-3 text-left max-w-md mx-auto">
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fatores de Risco:</span>
                    <span className="font-semibold">{riskFactorsCount} marcados</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pontuação Total:</span>
                    <span className="font-semibold">{totalScore} pontos</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Prob. de Falha:</span>
                    <span className="font-semibold">{failureProb}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Taxa de Ocupação:</span>
                    <span className="font-semibold">Categoria {targetCategory}</span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Risco Inicial:</span>
                    <span className={`font-bold text-lg px-2 py-0.5 rounded ${RISK_PROFILES[initialRisk].className}`}>
                        {initialRisk}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mitigação:</span>
                    <span className="font-semibold">{mitigationLabel}</span>
                </div>
                {mitigationAction !== 'nenhuma' && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Risco Residual:</span>
                        <span className={`font-bold text-lg px-2 py-0.5 rounded ${RISK_PROFILES[residualRisk].className}`}>
                            {residualRisk}
                        </span>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg text-sm text-left">
                <p className="text-blue-800 dark:text-blue-300">
                    <strong>Importante:</strong> Os dados da avaliação TRAQ serão salvos junto com o registro da árvore.
                    Você poderá visualizar e editar essas informações posteriormente.
                </p>
            </div>
        </div>
    );
}
