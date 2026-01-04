import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Inventory from '../../pages/Inventory';
import { useAuth } from '../../context/AuthContext';
import { FilterProvider } from '../../context/FilterContext';
import { useTrees } from '../../hooks/useTrees';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../../context/AuthContext', async () => {
    const actual = await vi.importActual('../../context/AuthContext');
    return {
        ...actual,
        useAuth: vi.fn()
    };
});

vi.mock('../../hooks/useTrees', () => ({
    useTrees: vi.fn()
}));

vi.mock('../../hooks/useTreeMutations', () => ({
    useTreeMutations: () => ({
        deleteTree: { mutateAsync: vi.fn() }
    })
}));

vi.mock('../../hooks/useDensity', () => ({
    useDensity: () => 'office'
}));

vi.mock('../../components/features/ClusteredMapComponent', () => ({
    default: () => <div data-testid="map-component">Map</div>
}));

vi.mock('../../components/features/TreeBlade', () => ({
    default: () => <div data-testid="tree-blade">Blade</div>
}));

vi.mock('../../components/features/SyncStatusIndicator', () => ({
    SyncStatusIndicator: () => <div>Sync</div>
}));

// Mock cn utility
vi.mock('../../lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <MemoryRouter>
            <FilterProvider>
                {children}
            </FilterProvider>
        </MemoryRouter>
    </QueryClientProvider>
);

const mockTrees = [
    { id: 'tree-1', especie: 'Ipê', data: '2025-01-01', risklevel: 'Baixo' },
    { id: 'tree-2', especie: 'Oiti', data: '2025-01-02', risklevel: 'Alto' }
];

describe('Inventory Permissions Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show "Nova Árvore" button when user has create_trees permission', () => {
        (useAuth as any).mockReturnValue({
            hasPermission: (p: string) => p === 'create_trees',
            user: { id: 'user-1' }
        });
        (useTrees as any).mockReturnValue({ data: mockTrees, isLoading: false, error: null });

        render(
            <Inventory />,
            { wrapper }
        );

        expect(screen.getByText(/Nova Árvore/i)).toBeInTheDocument();
    });

    it('should hide "Nova Árvore" button when user lacks create_trees permission', () => {
        (useAuth as any).mockReturnValue({
            hasPermission: () => false,
            user: { id: 'user-1' }
        });
        (useTrees as any).mockReturnValue({ data: mockTrees, isLoading: false, error: null });

        render(
            <Inventory />,
            { wrapper }
        );

        expect(screen.queryByText(/Nova Árvore/i)).not.toBeInTheDocument();
    });

    it('should show "Adicionar Árvore" in empty state only if user has permission', () => {
        (useAuth as any).mockReturnValue({
            hasPermission: (p: string) => p === 'create_trees',
            user: { id: 'user-1' }
        });
        (useTrees as any).mockReturnValue({ data: [], isLoading: false, error: null });

        render(
            <Inventory />,
            { wrapper }
        );

        expect(screen.getByText(/Nenhuma árvore encontrada/i)).toBeInTheDocument();
        expect(screen.getByText(/Adicionar Árvore/i)).toBeInTheDocument();
    });

    it('should hide "Adicionar Árvore" in empty state if user lacks permission', () => {
        (useAuth as any).mockReturnValue({
            hasPermission: () => false,
            user: { id: 'user-1' }
        });
        (useTrees as any).mockReturnValue({ data: [], isLoading: false, error: null });

        render(
            <Inventory />,
            { wrapper }
        );

        expect(screen.getByText(/Nenhuma árvore encontrada/i)).toBeInTheDocument();
        expect(screen.queryByText(/Adicionar Árvore/i)).not.toBeInTheDocument();
    });
});
