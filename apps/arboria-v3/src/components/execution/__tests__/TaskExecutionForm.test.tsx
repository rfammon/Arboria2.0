import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskExecutionForm from '../TaskExecutionForm';
import { useTask } from '@/hooks/useExecution';

// Mock ResizeObserver for Radix UI components
class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as any;

// Mock dependencies
vi.mock('@/hooks/useExecution', () => ({
    useTask: vi.fn(),
    useTaskMutations: vi.fn(() => ({
        completeTask: { mutate: vi.fn() },
        startTask: { mutate: vi.fn() },
        logProgress: { mutate: vi.fn() },
        blockTask: { mutate: vi.fn() },
        createAlert: { mutate: vi.fn() },
    }))
}));

vi.mock('@/context/AuthContext', () => ({
    useAuth: vi.fn(() => ({
        user: { id: 'user-1' }
    }))
}));

// Mock sub-components to focus on TaskExecutionForm logic
vi.mock('../TaskProgressSteps', () => ({
    TaskProgressSteps: () => <div data-testid="task-progress-steps" />
}));

vi.mock('../TaskEvidenceUpload', () => ({
    TaskEvidenceUpload: () => <div data-testid="task-evidence-upload" />
}));

vi.mock('../TeamModeCoordination', () => ({
    TeamModeCoordination: () => <div data-testid="team-mode-coordination" />
}));

const mockTask = {
    id: 'task-1',
    status: 'IN_PROGRESS',
    intervention_type: 'poda',
    description: 'Teste de poda',
    evidence_stage: 'none',
    evidence: [],
    tree: {
        id: 'tree-1',
        especie: 'Ipê Amarelo'
    }
};

describe('TaskExecutionForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render task info correctly', () => {
        (useTask as any).mockReturnValue({ data: { ...mockTask, status: 'NOT_STARTED' } });

        render(<TaskExecutionForm taskId="task-1" open={true} onOpenChange={vi.fn()} />);

        expect(screen.getByText(/Execução: poda/i)).toBeInTheDocument();
        expect(screen.getByText(/Ipê Amarelo/i)).toBeInTheDocument();
        expect(screen.getByText(/Teste de poda/i)).toBeInTheDocument();
    });

    it('should determine initial step based on evidence_stage', () => {
        // Case 1: none -> before (renders TaskEvidenceUpload)
        (useTask as any).mockReturnValue({ data: { ...mockTask, evidence_stage: 'none' } });
        const { rerender } = render(<TaskExecutionForm taskId="task-1" open={true} onOpenChange={vi.fn()} />);
        expect(screen.getByTestId('task-evidence-upload')).toBeInTheDocument();

        // Case 2: after -> completion (renders progress slider)
        (useTask as any).mockReturnValue({ data: { ...mockTask, evidence_stage: 'after' } });
        rerender(<TaskExecutionForm taskId="task-1" open={true} onOpenChange={vi.fn()} />);
        expect(screen.getByText(/Progresso da Tarefa/i)).toBeInTheDocument();
    });

    describe('Photo Validation (RF7.5)', () => {
        it('should disable complete button when photos are missing', () => {
            (useTask as any).mockReturnValue({ 
                data: { 
                    ...mockTask, 
                    evidence_stage: 'after',
                    evidence: [] // No photos
                } 
            });

            render(<TaskExecutionForm taskId="task-1" open={true} onOpenChange={vi.fn()} />);

            const completeBtn = screen.getByText(/Finalizar Tarefa/i);
            expect(completeBtn).toBeDisabled();
            expect(screen.getByText(/Fotos obrigatórias/i)).toBeInTheDocument();
        });

        it('should disable complete button when only "before" photo is present', () => {
            (useTask as any).mockReturnValue({ 
                data: { 
                    ...mockTask, 
                    evidence_stage: 'after',
                    evidence: [{ stage: 'before', url: '...' }] 
                } 
            });

            render(<TaskExecutionForm taskId="task-1" open={true} onOpenChange={vi.fn()} />);

            const completeBtn = screen.getByText(/Finalizar Tarefa/i);
            expect(completeBtn).toBeDisabled();
        });

        it('should enable complete button when both "before" and "after" photos are present', () => {
            (useTask as any).mockReturnValue({ 
                data: { 
                    ...mockTask, 
                    evidence_stage: 'after',
                    evidence: [
                        { stage: 'before', url: '...' },
                        { stage: 'after', url: '...' }
                    ] 
                } 
            });

            render(<TaskExecutionForm taskId="task-1" open={true} onOpenChange={vi.fn()} />);

            const completeBtn = screen.getByText(/Finalizar Tarefa/i);
            expect(completeBtn).not.toBeDisabled();
            expect(screen.queryByText(/Fotos obrigatórias/i)).not.toBeInTheDocument();
        });
    });

    it('should open confirmation dialog when clicking complete', () => {
        (useTask as any).mockReturnValue({ 
            data: { 
                ...mockTask, 
                evidence_stage: 'after',
                evidence: [
                    { stage: 'before', url: '...' },
                    { stage: 'after', url: '...' }
                ] 
            } 
        });

        render(<TaskExecutionForm taskId="task-1" open={true} onOpenChange={vi.fn()} />);

        const completeBtn = screen.getByText(/Finalizar Tarefa/i);
        fireEvent.click(completeBtn);

        expect(screen.getByText(/Confirmar Conclusão da Tarefa/i)).toBeInTheDocument();
    });
});
