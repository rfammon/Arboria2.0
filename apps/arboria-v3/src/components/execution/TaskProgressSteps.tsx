import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { EvidencePhotoStage } from '@/types/execution';

export type TaskStep = EvidencePhotoStage | 'info' | 'problem';

interface TaskProgressStepsProps {
    currentStep: TaskStep;
    steps?: { stage: TaskStep; label: string }[];
    onStepClick?: (step: TaskStep) => void;
}

const DEFAULT_STEPS: { stage: TaskStep; label: string }[] = [
    { stage: 'info', label: 'Info' },
    { stage: 'before', label: 'Antes' },
    { stage: 'during_1', label: 'Exec. 1' },
    { stage: 'during_2', label: 'Exec. 2' },
    { stage: 'after', label: 'Depois' },
    { stage: 'completion', label: 'Final' },
];

export function TaskProgressSteps({
    currentStep,
    steps = DEFAULT_STEPS,
    onStepClick
}: TaskProgressStepsProps) {

    // Helper to determine if a step is completed or active
    const getStepStatus = (_stepStage: TaskStep, index: number) => {
        const currentIdx = steps.findIndex(s => s.stage === currentStep);

        if (index < currentIdx) return 'completed';
        if (index === currentIdx) return 'active';
        return 'upcoming';
    };

    return (
        <div className="w-full">
            <div className="relative flex justify-between">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10 -translate-y-1/2" />

                {steps.map((step, index) => {
                    const status = getStepStatus(step.stage, index);

                    return (
                        <button
                            key={step.stage}
                            onClick={() => onStepClick && onStepClick(step.stage)}
                            disabled={status === 'upcoming'}
                            className="group flex flex-col items-center gap-2 bg-background px-2"
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                                    status === 'completed' && "bg-green-600 border-green-600 text-white",
                                    status === 'active' && "bg-white border-blue-600 text-blue-600",
                                    status === 'upcoming' && "bg-muted border-muted-foreground/30 text-muted-foreground"
                                )}
                            >
                                {status === 'completed' ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <span className="text-xs font-bold">{index + 1}</span>
                                )}
                            </div>
                            <span className={cn(
                                "text-[10px] font-medium transition-colors",
                                status === 'active' ? "text-blue-600" : "text-muted-foreground"
                            )}>
                                {step.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
