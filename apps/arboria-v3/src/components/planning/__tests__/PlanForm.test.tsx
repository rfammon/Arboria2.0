import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PlanForm } from '../PlanForm';
import { usePlans } from '@/hooks/usePlans';
import { usePlanConflicts } from '@/hooks/usePlanConflicts';

// Mock dependencies
vi.mock('@/hooks/usePlans', () => ({
    usePlans: vi.fn(() => ({
        createPlan: vi.fn(),
        updatePlan: vi.fn(),
        plans: []
    }))
}));

vi.mock('@/hooks/useTrees', () => ({
    useTrees: vi.fn(() => ({
        data: [
            { id: 'tree-1', especie: 'Ipê', local: 'Rua A' },
            { id: 'tree-2', especie: 'Pau-Brasil', local: 'Rua B' }
        ]
    }))
}));

vi.mock('@/hooks/useTreePhotos', () => ({
    useTreePhotos: vi.fn(() => ({
        data: []
    }))
}));

vi.mock('@/hooks/usePlanConflicts', () => ({
    usePlanConflicts: vi.fn()
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
    useToast: () => ({ toast: mockToast })
}));

// Mock ResizeObserver
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

describe('PlanForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render "Novo Plano" when no plan is provided', () => {
        render(<PlanForm onCancel={vi.fn()} onSuccess={vi.fn()} />);
        expect(screen.getByText(/Novo Plano de Intervenção/i)).toBeInTheDocument();
    });

    it('should render "Editar Plano" when plan is provided', () => {
        const mockPlan = {
            id: 'plan-1',
            plan_id: 'PI-2026-001',
            intervention_type: 'poda',
            tree_id: 'tree-1',
            schedule: { start: '2026-01-01' }
        } as any;

        render(<PlanForm plan={mockPlan} onCancel={vi.fn()} onSuccess={vi.fn()} />);
        expect(screen.getByText(/Editar Plano de Intervenção/i)).toBeInTheDocument();
        expect(screen.getByText('PI-2026-001')).toBeInTheDocument();
    });

    it('should show conflict warning when usePlanConflicts returns a message', () => {
        (usePlanConflicts as any).mockReturnValue('Existe um conflito neste dia');

        render(<PlanForm onCancel={vi.fn()} onSuccess={vi.fn()} />);
        
        expect(screen.getByText(/Conflito de Agendamento/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Existe um conflito neste dia/i)[0]).toBeInTheDocument();
    });

    it('should show validation error when submitting without tree_id', async () => {
        // Force tree_id to be empty by not providing initialTreeId
        render(<PlanForm onCancel={vi.fn()} onSuccess={vi.fn()} />);
        
        const submitBtns = screen.getAllByText(/Criar Plano/i);
        const submitBtn = submitBtns.find(btn => btn.tagName === 'BUTTON');
        if (submitBtn) fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    it('should call createPlan when form is valid', async () => {
        const mockCreatePlan = vi.fn().mockResolvedValue({ plan_id: 'PI-NEW', id: 'new-id' });
        (usePlans as any).mockReturnValue({
            createPlan: mockCreatePlan,
            plans: []
        });

        render(
            <PlanForm initialTreeId="tree-1" onCancel={vi.fn()} onSuccess={vi.fn()} />
        );

        const submitBtns = screen.getAllByText(/Criar Plano/i);
        const submitBtn = submitBtns.find(btn => btn.tagName === 'BUTTON');
        if (submitBtn) fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockCreatePlan).toHaveBeenCalled();
        }, { timeout: 3000 });
    });
});
