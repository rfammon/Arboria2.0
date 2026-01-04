import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Execution from '../../pages/Execution';
import { useAuth } from '../../context/AuthContext';
import { useMyTasks } from '../../hooks/useExecution';
import { useInstallationMembers } from '../../hooks/useInstallation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(() => ({
        user: { id: 'user-1' },
        activeInstallation: { id: 'inst-1', nome: 'Instalacao Teste' },
        activeProfileNames: 'Executante',
        refreshInstallations: vi.fn(),
        signOut: vi.fn()
    }))
}));

vi.mock('../../hooks/useExecution', () => ({
    useMyTasks: vi.fn()
}));

vi.mock('../../hooks/useInstallation', () => ({
    useInstallationMembers: vi.fn()
}));

vi.mock('../../components/execution/TaskExecutionCard', () => ({
    TaskExecutionCard: ({ task }: any) => <div data-testid="task-card">{task.intervention_type}</div>
}));

vi.mock('../../components/execution/TaskExecutionForm', () => ({
    default: () => <div data-testid="task-form">Form</div>
}));

vi.mock('../../components/execution/SOSButton', () => ({
    SOSButton: () => <div data-testid="sos-button">SOS</div>
}));

vi.mock('../../components/execution/PlanChangeNotification', () => ({
    PlanChangeNotification: () => <div data-testid="plan-change">Plan Change</div>
}));

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <MemoryRouter>
            {children}
        </MemoryRouter>
    </QueryClientProvider>
);

const mockTasks = [
    { id: '1', status: 'NOT_STARTED', intervention_type: 'poda', tree: { especie: 'Ipê' } },
    { id: '2', status: 'IN_PROGRESS', intervention_type: 'supressao', tree: { especie: 'Oiti' } },
    { id: '3', status: 'COMPLETED', intervention_type: 'monitoramento', tree: { especie: 'Palmeira' } }
];

describe('Execution Page Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useMyTasks as any).mockReturnValue({ data: mockTasks, isLoading: false, refetch: vi.fn() });
        (useInstallationMembers as any).mockReturnValue({ data: [] });
    });

    it('should show tasks in the default tab (pendentes)', () => {
        render(<Execution />, { wrapper });

        const activePanel = screen.getByRole('tabpanel');
        expect(within(activePanel).getByText(/poda/i)).toBeInTheDocument();
        expect(within(activePanel).queryByText(/supressao/i)).not.toBeInTheDocument();
    });

    it('should switch tabs and show corresponding tasks', async () => {
        render(<Execution />, { wrapper });

        const executingTab = screen.getByRole('tab', { name: /Executando/i });
        fireEvent.click(executingTab);

        // Wait for tab switch
        await waitFor(() => {
            const activePanel = screen.getByRole('tabpanel');
            expect(within(activePanel).getByText(/supressao/i)).toBeInTheDocument();
            expect(within(activePanel).queryByText(/poda/i)).not.toBeInTheDocument();
        });
    });

    it('should show manager view features when user is Gestor', async () => {
        (useAuth as any).mockReturnValue({
            user: { id: 'user-1' },
            activeInstallation: { id: 'inst-1', nome: 'Instalacao Teste' },
            activeProfileNames: 'Gestor'
        });
        (useInstallationMembers as any).mockReturnValue({
            data: [{ user_id: 'user-2', nome: 'Worker 1' }]
        });

        render(<Execution />, { wrapper });

        expect(await screen.findByText(/Tarefas da Instalação/i)).toBeInTheDocument();
        expect(screen.getByText(/Todos/i)).toBeInTheDocument();
    });

    it('should filter tasks by search query', () => {
        render(<Execution />, { wrapper });

        const searchInput = screen.getByPlaceholderText(/Buscar ordem de serviço/i);
        fireEvent.change(searchInput, { target: { value: 'Ipê' } });

        expect(screen.getByText('poda')).toBeInTheDocument();

        fireEvent.change(searchInput, { target: { value: 'Non-existent' } });
        expect(screen.queryByText('poda')).not.toBeInTheDocument();
        expect(screen.getByText('Você não tem tarefas pendentes no momento.')).toBeInTheDocument();
    });
});
