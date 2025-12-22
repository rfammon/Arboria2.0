import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PageContainer } from '../components/layout/PageContainer';
import TreeDetailContent from '../components/features/TreeDetailContent';

export default function TreeDetails() {
    const { treeId } = useParams<{ treeId: string }>();
    const navigate = useNavigate();

    if (!treeId) {
        return (
            <PageContainer>
                <div className="text-center p-8 text-destructive font-medium">
                    ID da árvore inválido
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Minimal Header for the Page View */}
            <div className="flex items-center gap-4 mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/inventory')}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm font-medium text-muted-foreground">Voltar para Inventário</span>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
                <TreeDetailContent treeId={treeId} />
            </div>
        </PageContainer>
    );
}
