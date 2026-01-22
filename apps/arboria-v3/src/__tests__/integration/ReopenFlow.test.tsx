import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanDetail } from '../../components/planning/PlanDetail';
import type { InterventionPlan } from '../../types/plan';
import { executionService } from '../../services/executionService';

// Fix import path - PlanDetail is actually in '../../components/planning/PlanDetail' based on previous context 
// or I should check the path. 
// Task summary says `src/components/planning/PlanDetail.tsx`.

// Mock deps
vi.mock('../../services/executionService', () => ({
    executionService: {
        reopenWorkOrder: vi.fn(),
        createWorkOrderFromPlan: vi.fn()
    }
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 'admin' },
        activeProfileNames: 'Gestor',
        activeInstallation: { id: 'inst-1' }
    })
}));

vi.mock('../../hooks/usePlans', () => ({
    usePlans: () => ({ deletePlan: vi.fn() })
}));

vi.mock('../../hooks/use-toast', () => ({
    useToast: () => ({ toast: vi.fn() })
}));

vi.mock('../../lib/installationService', () => ({
    InstallationService: {
        getProjectMembers: vi.fn().mockResolvedValue([])
    }
}));

// Mock map utils
vi.mock('../../utils/mapUtils', () => ({
    openNavigationApp: vi.fn()
}));

// Mock cn utility
vi.mock('../../lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

// Mock planUtils to avoid complex date calculations
vi.mock('../../lib/planUtils', () => ({
    formatDate: vi.fn(() => '01/01/2025'),
    formatDateTime: vi.fn(() => '01/01/2025 00:00'),
    getDaysUntilExecution: vi.fn(() => 5),
    getUrgencyBadgeConfig: vi.fn(() => ({ label: 'Normal', color: '#888', cssClass: '' })),
    extractScheduleDate: vi.fn(() => '2025-01-01'),
    extractScheduleEndDate: vi.fn(() => '2025-01-02'),
    INTERVENTION_ICONS: { poda: '✂️' },
    INTERVENTION_COLORS: { poda: '#0066CC' },
    INTERVENTION_LABELS: { poda: 'Poda' },
    getPlanDuration: vi.fn(() => 1)
}));

// @ts-ignore - Mocking incomplete InterventionPlan for testing purposes
const mockPlan = {
    id: 'plan-1',
    status: 'COMPLETED',
    tasks: [],
    // Adding minimal required fields to satisfy WorkOrder type
    instalacao_id: 'inst-1',
    title: 'Test Order',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
} as unknown as WorkOrder; // Force cast if needed or just provide fields

describe('Reopen Flow Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should allow a manager to reopen a completed work order', { timeout: 15000 }, async () => {
        // Mock successful reopen
        (executionService.reopenWorkOrder as any).mockResolvedValue({ success: true, message: 'Reaberta com sucesso' });
        const onUpdateMock = vi.fn();

        render(
            <PlanDetail
                plan={mockPlan}
                onBack={vi.fn()}
                onEdit={vi.fn()}
                onUpdate={onUpdateMock}
            />
        );

        // 1. Check if Reopen button is visible (WO is COMPLETED and User is Gestor)
        const reopenBtn = screen.getByText('Reabrir');
        expect(reopenBtn).toBeInTheDocument();

        // 2. Click reopen - should open dialog
        fireEvent.click(reopenBtn);
        expect(screen.getByText('Reabrir Ordem de Serviço')).toBeInTheDocument();

        // 3. Fill reason
        const reasonInput = screen.getByPlaceholderText(/Descreva por que/i);
        fireEvent.change(reasonInput, { target: { value: 'Falha na execução anterior' } });

        // 4. Confirm
        const confirmBtn = screen.getByText('Confirmar Reabertura');
        fireEvent.click(confirmBtn);

        // 5. Verify service call
        await waitFor(() => {
            expect(executionService.reopenWorkOrder).toHaveBeenCalledWith(
                'wo-1',
                'Falha na execução anterior',
                expect.anything(), // undefined start date or current date
                expect.anything()
            );
        });

        // 6. Verify update callback
        expect(onUpdateMock).toHaveBeenCalled();
    });
});
