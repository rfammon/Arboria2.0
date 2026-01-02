import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useFilters } from '../context/FilterContext';
import { Plus, Search, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import InventoryList from '../components/features/InventoryList';
import ClusteredMapComponent from '../components/features/ClusteredMapComponent';
import { TreeForm } from '../components/features/TreeForm';
import { PageContainer } from '../components/layout/PageContainer';
import { FieldAction } from '../components/common/FieldAction';
import { TreeDrawer } from '../components/features/TreeDrawer';
import TreeBlade from '../components/features/TreeBlade';
import { useDensity } from '../hooks/useDensity';
import { useTrees } from '../hooks/useTrees';
import { SyncStatusIndicator } from '../components/features/SyncStatusIndicator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '../components/ui/sheet';

export default function Inventory() {
    const { hasPermission } = useAuth();
    const density = useDensity();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { filters, setFilters } = useFilters();
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editTreeId, setEditTreeId] = useState<string | null>(null);
    useTrees();

    const selectedTreeId = searchParams.get('selectedTree');

    const handleSelectTree = (id: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (id) {
            newParams.set('selectedTree', id);
        } else {
            newParams.delete('selectedTree');
        }
        setSearchParams(newParams);
    };

    // Handle navigation from TreeDetails "Show on Map" button
    useEffect(() => {
        if (location.state?.selectedTreeId) {
            setViewMode('map');
            handleSelectTree(location.state.selectedTreeId);
            // Clear the state after using it
            window.history.replaceState({}, document.title);
        }
        if (location.state?.editTreeId) {
            setEditTreeId(location.state.editTreeId);
            setIsFormOpen(true);
            // Clear the state after using it
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    return (
        <PageContainer>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold tracking-tight">Inventário</h1>
                    <SyncStatusIndicator />
                </div>
                <p className="text-muted-foreground">Gerencie e monitorize o arvoredo urbano.</p>
                <div className="flex gap-2 w-full sm:w-auto">
                    {hasPermission('create_trees') && (
                        <FieldAction
                            isPrimary
                            onClick={() => setIsFormOpen(true)}
                            className="flex-1 sm:flex-none"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nova Árvore
                        </FieldAction>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card text-card-foreground p-4 rounded-lg shadow-sm border border-border space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, espécie ou ID..."
                            className="pl-10 w-full h-[var(--input-height,40px)] rounded-md border border-input bg-background/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none p-2 text-foreground placeholder:text-muted-foreground"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>

                    <FieldAction variant="outline">
                        <Filter className="w-5 h-5 mr-2" />
                        Filtros
                    </FieldAction>

                    <div className="flex bg-muted p-1 rounded-md">
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "px-4 py-1.5 rounded-sm text-sm font-medium transition-colors",
                                viewMode === 'list'
                                    ? "bg-background shadow text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={cn(
                                "px-4 py-1.5 rounded-sm text-sm font-medium transition-colors",
                                viewMode === 'map'
                                    ? "bg-background shadow text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Mapa
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-card rounded-lg border border-border min-h-[500px] flex flex-col overflow-hidden">
                {viewMode === 'list' ? (
                    <InventoryList onCreate={() => setIsFormOpen(true)} />
                ) : (
                    <ClusteredMapComponent
                        selectedTreeId={selectedTreeId}
                        onSelectTree={handleSelectTree}
                    />
                )}
            </div>

            {/* Modals & Overlays - Adaptive Shell */}
            {density === 'office' ? (
                <TreeBlade />
            ) : (
                <TreeDrawer />
            )}

            <Sheet
                open={isFormOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsFormOpen(false);
                        setEditTreeId(null);
                    }
                }}
            >
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md p-0 overflow-hidden border-l border-border shadow-2xl"
                    showClose={false}
                >
                    <SheetHeader className="sr-only">
                        <SheetTitle>{editTreeId ? 'Editar Árvore' : 'Nova Árvore'}</SheetTitle>
                        <SheetDescription>
                            {editTreeId ? 'Atualize as informações desta árvore.' : 'Cadastre uma nova árvore no sistema.'}
                        </SheetDescription>
                    </SheetHeader>
                    {isFormOpen && (
                        <TreeForm
                            onClose={() => {
                                setIsFormOpen(false);
                                setEditTreeId(null);
                            }}
                            treeId={editTreeId || undefined}
                        />
                    )}
                </SheetContent>
            </Sheet>


        </PageContainer>
    );
}
