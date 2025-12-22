import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskExecutionCard } from './TaskExecutionCard';
import type { Task } from '@/types/execution';

// Mock dependencies
vi.mock('@/context/AuthContext', () => ({
    useAuth: vi.fn(() => ({
        user: { id: 'user-1' },
        hasPermission: vi.fn((perm) => perm === 'manage_installation') // Mock manager by default
    }))
}));

const mockCancelTask = vi.fn();
const mockApproveTask = vi.fn();
const mockRejectTask = vi.fn();

vi.mock('@/services/executionService', () => ({
    executionService: {
        cancelTask: (...args: any[]) => mockCancelTask(...args),
        approveTask: (...args: any[]) => mockApproveTask(...args),
        rejectTask: (...args: any[]) => mockRejectTask(...args)
    }
}));

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() })
}));

// Mock util
vi.mock('@/utils/mapUtils', () => ({
    openNavigationApp: vi.fn()
}));

const mockTask: Task = {
    id: '1',
    instalacao_id: 'inst-1',
    work_order_id: 'wo-1',
    evidence_stage: 'before',
    status: 'NOT_STARTED',
    priority: 'MEDIUM',
    intervention_type: 'poda',
    tree_id: 'tree-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignee_name: 'John Doe',
    assigned_to: 'user-1',
    progress_percent: 0,
    tree: {
        id: 'tree-1',
        especie: 'Ipê',
        local: 'Praça Central',
        latitude: -23.55,
        longitude: -46.63
    } as any
};

describe('TaskExecutionCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render task details correctly', () => {
        render(
            <TaskExecutionCard
                task={mockTask}
            />
        );

        expect(screen.getByText('PODA')).toBeInTheDocument();
        expect(screen.getByText('MEDIUM')).toBeInTheDocument();
        expect(screen.getByText('Ipê')).toBeInTheDocument(); // Tree info
        expect(screen.getByText('Praça Central')).toBeInTheDocument(); // Local
    });

    it('should show "Iniciar Execução" when status is NOT_STARTED', () => {
        render(
            <TaskExecutionCard
                task={{ ...mockTask, status: 'NOT_STARTED' }}
            />
        );
        expect(screen.getByText('Iniciar Execução')).toBeInTheDocument();
    });

    it('should show "Continuar Tarefa" when status is IN_PROGRESS', () => {
        render(
            <TaskExecutionCard
                task={{ ...mockTask, status: 'IN_PROGRESS', progress_percent: 50 }}
            />
        );
        expect(screen.getByText('Continuar Tarefa')).toBeInTheDocument();
        expect(screen.getByText('50%')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show "Navegar" button when coordinates are present', () => {
        render(<TaskExecutionCard task={mockTask} />);
        const navBtn = screen.getByText('Navegar');
        expect(navBtn).toBeInTheDocument();

        // Test interaction mock
        // fireEvent.click(navBtn); // Need to mock stopPropagation? It might just work or throw.
    });

    it('should not show "Navegar" button when coordinates are missing', () => {
        const noGeoTask = { ...mockTask, tree: { ...mockTask.tree!, latitude: null, longitude: null } };
        render(<TaskExecutionCard task={noGeoTask} />);
        expect(screen.queryByText('Navegar')).not.toBeInTheDocument();
    });

    it('should show approval buttons for manager when PENDING_APPROVAL', () => {
        render(
            <TaskExecutionCard
                task={{ ...mockTask, status: 'PENDING_APPROVAL' }}
            />
        );
        expect(screen.getByText('Aprovar')).toBeInTheDocument();
        expect(screen.getByText('Rejeitar')).toBeInTheDocument();
    });

    it('should call approveTask when approve button is clicked', async () => {
        render(
            <TaskExecutionCard
                task={{ ...mockTask, status: 'PENDING_APPROVAL' }}
            />
        );

        const approveBtn = screen.getByText('Aprovar');
        fireEvent.click(approveBtn);

        expect(mockApproveTask).toHaveBeenCalledWith(mockTask.id, 'user-1');
    });
});
