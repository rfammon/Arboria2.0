import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '../ui/sheet';
import { Button } from '../ui/button';
import { CheckCircle, ArrowRight, ArrowLeft, Save, AlertTriangle, Camera } from 'lucide-react';
import { useTaskMutations, useTask } from '@/hooks/useExecution';
import { useAuth } from '@/context/AuthContext';
import { TaskProgressSteps } from './TaskProgressSteps';
import { TaskEvidenceUpload } from './TaskEvidenceUpload';
import type { EvidencePhotoStage, AlertType } from '@/types/execution';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { TeamModeCoordination } from './TeamModeCoordination';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';

type TaskExecutionFormProps = {
    taskId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Wizard steps: 'info' + the detailed photo stages
// EvidencePhotoStage includes: 'before' | 'during_1' | 'during_2' | 'after' | 'completion'
type Step = 'info' | EvidencePhotoStage | 'problem';

const STEPS_ORDER: Step[] = ['info', 'before', 'during_1', 'during_2', 'after', 'completion'];

export default function TaskExecutionForm({ taskId, open, onOpenChange }: TaskExecutionFormProps) {
    const { user } = useAuth();
    const { data: task } = useTask(taskId || undefined);
    const { completeTask, startTask, logProgress, blockTask, createAlert } = useTaskMutations();
    const [currentStep, setCurrentStep] = useState<Step>('info');
    const [notes, setNotes] = useState('');
    const [progress, setProgress] = useState(100);

    // Confirmation Dialog State
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Problem Reporting State
    const [problemType, setProblemType] = useState<AlertType>('OTHER');
    const [problemDesc, setProblemDesc] = useState('');
    const [isBlocking, setIsBlocking] = useState(false);

    useEffect(() => {
        if (open && task) {
            // Determine initial step based on task status/evidence
            if (task.status === 'NOT_STARTED') {
                setCurrentStep('info');
            } else {
                // Map general EvidenceStage to specific Wizard Step
                // evidence_stage: 'none' | 'before' | 'during' | 'after' | 'completed'
                switch (task.evidence_stage) {
                    case 'none': setCurrentStep('before'); break;
                    case 'before': setCurrentStep('during_1'); break;
                    case 'during': setCurrentStep('during_2'); break; // Simplify: go to during_2 if generic 'during'
                    case 'after': setCurrentStep('completion'); break;
                    case 'completed': setCurrentStep('completion'); break;
                    default: setCurrentStep('info');
                }
            }
        }
    }, [open, task]);

    // RF7.5: Photo validation - need at least 2 photos (before + after)
    const photoValidation = useMemo(() => {
        if (!task?.evidence) return { count: 0, hasBeforePhoto: false, hasAfterPhoto: false, canComplete: false };

        const beforePhotos = task.evidence.filter(e => e.stage === 'before').length;
        const afterPhotos = task.evidence.filter(e => e.stage === 'after').length;
        const totalRequired = beforePhotos + afterPhotos;

        return {
            count: totalRequired,
            hasBeforePhoto: beforePhotos > 0,
            hasAfterPhoto: afterPhotos > 0,
            canComplete: beforePhotos > 0 && afterPhotos > 0 // Minimum: 1 before + 1 after
        };
    }, [task?.evidence]);

    if (!task) return null;

    const currentStepIndex = STEPS_ORDER.indexOf(currentStep);

    // Calculate display ID safely
    const treeDisplayId = task.tree?.id ? task.tree.id.substring(0, 8) : 'N/A';
    const treeSpecies = task.tree?.especie || 'Espécie desconhecida';

    const handleNext = () => {
        if (currentStepIndex < STEPS_ORDER.length - 1) {
            setCurrentStep(STEPS_ORDER[currentStepIndex + 1]);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(STEPS_ORDER[currentStepIndex - 1]);
        }
    };

    const handleStartTask = () => {
        if (!task.id) return;
        startTask.mutate({ taskId: task.id }, {
            onSuccess: () => setCurrentStep('before')
        });
    };

    const handleCompleteTask = () => {
        if (!task.id) return;
        completeTask.mutate({ taskId: task.id, notes, progress }, {
            onSuccess: () => onOpenChange(false)
        });
    };

    const handleUpdateProgress = () => {
        if (!task.id || !user) return;
        logProgress.mutate({ taskId: task.id, userId: user.id, percent: progress, notes }, {
            onSuccess: () => {
                // Should we close or stay? Stay implies working.
                // But if they just wanted to update progress? 
                // Let's close for now, or maybe toast and stay?
                // Toast is handled in mutation.
            }
        });
    };

    const handleReportProblem = () => {
        if (!task?.id || !user) return;

        // If blocking, use blockTask
        if (isBlocking) {
            blockTask.mutate({ taskId: task.id, reason: problemDesc }, {
                onSuccess: () => {
                    // Create alert too? blockTask usually implies alert or status change.
                    // System Notification is handled by backend trigger on status change.
                    // But we might want specific Alert record.
                    // Ideally blockTask should ALSO create an alert record or accept one.
                    // I will call createAlert first, then blockTask.
                    createAlert.mutate({
                        taskId: task.id,
                        userId: user.id,
                        type: problemType,
                        message: problemDesc
                    });
                    onOpenChange(false);
                }
            });
        } else {
            // Just Alert
            createAlert.mutate({
                taskId: task.id,
                userId: user.id,
                type: problemType,
                message: problemDesc
            }, {
                onSuccess: () => {
                    setCurrentStep('info'); // Go back
                    setProblemDesc('');
                }
            });
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'info':
                return (
                    <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-md">
                            <h4 className="font-semibold">Instruções</h4>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-md">
                            <h4 className="font-semibold mb-2">Equipe</h4>
                            <TeamModeCoordination
                                taskId={task.id}
                                initialMembers={task.team_members || []}
                            />
                        </div>

                        {task.status === 'NOT_STARTED' ? (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm">Clique abaixo para iniciar a contagem de tempo e registrar a execução.</p>
                                <Button onClick={handleStartTask} className="w-full" size="lg">
                                    Iniciar Execução
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-green-600 font-medium">Tarefa em andamento</p>
                                <Button onClick={handleNext} className="w-full">
                                    Continuar para Evidências
                                </Button>
                            </div>
                        )}
                    </div>
                );

            case 'completion':
                return (
                    <div className="space-y-6">
                        {/* RF7.5: Photo validation feedback */}
                        {!photoValidation.canComplete && (
                            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
                                <div className="flex items-start gap-3">
                                    <Camera className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-amber-800 dark:text-amber-200">Fotos obrigatórias</h4>
                                        <p className="text-sm text-amber-700 dark:text-amber-300">
                                            Para concluir a tarefa, adicione pelo menos:
                                        </p>
                                        <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                                            <li className={photoValidation.hasBeforePhoto ? 'line-through opacity-60' : 'font-medium'}>
                                                • 1 foto "Antes" {photoValidation.hasBeforePhoto && '✓'}
                                            </li>
                                            <li className={photoValidation.hasAfterPhoto ? 'line-through opacity-60' : 'font-medium'}>
                                                • 1 foto "Depois" {photoValidation.hasAfterPhoto && '✓'}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Progresso da Tarefa</Label>
                                <span className={`font-bold ${progress === 100 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {progress}%
                                </span>
                            </div>
                            <Slider
                                value={[progress]}
                                onValueChange={(v) => setProgress(v[0])}
                                max={100}
                                step={5}
                            />
                            <p className="text-xs text-muted-foreground">
                                {progress < 100
                                    ? 'Ajuste o percentual se a tarefa não foi totalmente concluída.'
                                    : 'Confirmar conclusão total da tarefa.'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Observações Finais</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                placeholder="Descreva como foi a execução, problemas encontrados, etc."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            {progress < 100 ? (
                                <Button onClick={handleUpdateProgress} variant="secondary" className="flex-1">
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Progresso
                                </Button>
                            ) : null}

                            {/* RF7.5: Button disabled if photos missing, opens confirmation dialog */}
                            <Button
                                onClick={() => setShowConfirmDialog(true)}
                                disabled={!photoValidation.canComplete}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {progress < 100 ? 'Concluir Parcialmente' : 'Finalizar Tarefa'}
                            </Button>
                        </div>

                        {/* RF7.5: Confirmation Dialog */}
                        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Conclusão da Tarefa</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <span className="block mb-2">
                                            Você está prestes a marcar esta tarefa como <strong>{progress < 100 ? 'parcialmente concluída' : 'concluída'}</strong>.
                                        </span>
                                        <span className="block text-sm">
                                            • O Gestor e Planejador serão notificados<br />
                                            • A tarefa não poderá ser editada após conclusão<br />
                                            • Data/hora de conclusão será registrada
                                        </span>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleCompleteTask}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Confirmar Conclusão
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );

            case 'problem':
                return (
                    <div className="space-y-6">
                        <div className="bg-destructive/10 p-4 rounded-md flex gap-3 text-destructive">
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <p className="text-sm font-medium">
                                Relatar impedimento ou problema na execução.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Problema</Label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={problemType}
                                onChange={(e) => setProblemType(e.target.value as AlertType)}
                            >
                                <option value="ENVIRONMENTAL">Fator Ambiental (Chuva, Vento)</option>
                                <option value="TECHNICAL">Problema Técnico (Equipamento)</option>
                                <option value="OPERATIONAL">Operacional (Acesso, Equipe)</option>
                                <option value="SAFETY_ISSUE">Segurança</option>
                                <option value="OTHER">Outro</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea
                                value={problemDesc}
                                onChange={(e) => setProblemDesc(e.target.value)}
                                placeholder="Descreva o que impediu a execução ou conclusão..."
                                rows={4}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="blocking"
                                checked={isBlocking}
                                onChange={(e) => setIsBlocking(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="blocking">Bloqueio Total (Impede continuação da tarefa)</Label>
                        </div>

                        <Button onClick={handleReportProblem} variant="destructive" className="w-full">
                            Confirmar Relatório
                        </Button>
                        <Button onClick={() => setCurrentStep('info')} variant="ghost" className="w-full">
                            Cancelar
                        </Button>
                    </div>
                );

            default:
                // For evidence stages (before, during_1, during_2, after)
                return (
                    <TaskEvidenceUpload
                        taskId={task.id}
                        stage={currentStep}
                        existingEvidence={task.evidence || []}
                    />
                );
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[95vh] sm:h-full sm:max-w-md overflow-y-auto flex flex-col">
                <SheetHeader className="text-left mb-4">
                    <SheetTitle>Execução: {task.intervention_type}</SheetTitle>
                    <SheetDescription className="line-clamp-1">
                        {treeSpecies} - {treeDisplayId}
                    </SheetDescription>
                </SheetHeader>

                {currentStep !== 'problem' && (
                    <TaskProgressSteps
                        currentStep={currentStep}
                        onStepClick={(step) => setCurrentStep(step as Step)}
                    />
                )}

                <div className="flex-1 py-6 overflow-y-auto">
                    {renderStepContent()}
                </div>

                <SheetFooter className="flex-row gap-2 sm:justify-between mt-auto pt-4 border-t">
                    <Button
                        variant="ghost"
                        onClick={handlePrev}
                        disabled={currentStepIndex === 0}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>

                    {currentStep !== 'completion' && currentStep !== 'info' && (
                        <Button onClick={handleNext}>
                            Próximo
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}

                    {currentStep !== 'problem' && (
                        <Button
                            variant="outline"
                            onClick={() => setCurrentStep('problem')}
                            className="flex-1 sm:flex-none"
                        >
                            <AlertTriangle className="w-4 h-4 mr-2 text-destructive" />
                            Problema
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
