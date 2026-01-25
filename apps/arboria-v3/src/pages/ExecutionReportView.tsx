import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../hooks/useExecution';
import ExecutionReport from '../components/features/reporting/ExecutionReport';
import { Button } from '../components/ui/button';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';

/**
 * ExecutionReportView Component
 * Renders a full-page preview of the Execution Report for a specific task.
 * Optimized for viewing and printing.
 */
const ExecutionReportView: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const { data: task, isLoading, isError } = useTask(taskId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-12 h-12 text-[#2e7d32] animate-spin mb-4" />
                <p className="text-slate-600 font-medium animate-pulse">Gerando visualização do relatório...</p>
            </div>
        );
    }

    if (isError || !task) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowLeft className="w-8 h-8 rotate-45" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Relatório não encontrado</h2>
                    <p className="text-slate-600 mb-6">Não foi possível localizar os dados deste serviço de execução ou o registro foi removido.</p>
                    <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Execução
                    </Button>
                </div>
            </div>
        );
    }

    // Map Task to ExecutionReport props according to requirements
    const treeData: any = {
        id: task.tree?.id || '',
        codigo: task.tree?.codigo || 'N/A',
        especie: task.tree?.especie || 'Espécie não identificada',
        localizacao: task.tree?.local || 'Localização não informada',
        nivelRisco: (task.tree?.risklevel as any) || 'Baixo',
        altura: task.tree?.altura || 0,
        dap: task.tree?.dap || 0,
        // Requirement: Use fotoUrl from task.tree.arvore_fotos[0]?.url
        fotoUrl: (task.tree as any)?.arvore_fotos?.[0]?.url || '/placeholder-tree.jpg'
    };

    // Requirement: Look in task.evidence array for an item where stage === 'after'
    const afterPhoto = task.evidence?.find(e => e.stage === 'after')?.photo_url;

    const executionData: any = {
        // Requirement: task.description or "Manutenção Programada"
        diagnostico: task.description || "Manutenção Programada",
        // Requirement: task.type or task.intervention_type
        acao: (task as any).type || task.intervention_type || "Intervenção Técnica",
        // Requirement: task.notes or "Execução realizada conforme padrão técnico."
        observacoes: task.notes || "Execução realizada conforme padrão técnico.",
        // Requirement: task.assignee?.nome or "Equipe Arboria"
        equipe: (task as any).assignee?.nome || (task as any).assignee_name || "Equipe Arboria",
        // Requirement: Use URL from 'after' stage or a placeholder
        fotoDepoisUrl: afterPhoto || 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=1000&auto=format&fit=crop'
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-20 print:pb-0">
            {/* Action Bar - Hidden in print */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between no-print shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-600 hover:text-slate-900">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <h1 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                        Relatório de Execução <span className="text-slate-400 font-medium ml-2">#{task.id.slice(0, 8)}</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button onClick={handlePrint} className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white shadow-md transition-all active:scale-95">
                        <Printer className="w-4 h-4 mr-2" /> Imprimir / Salvar PDF
                    </Button>
                </div>
            </div>

            {/* Report Content */}
            <div className="flex justify-center pt-8 px-4 print:p-0">
                <ExecutionReport 
                    id={`EXE-${task.id.slice(0, 8).toUpperCase()}`}
                    dataEmissao={task.completed_at ? new Date(task.completed_at) : new Date()}
                    tree={treeData}
                    execution={executionData}
                />
            </div>

            {/* Print specific styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    @page { margin: 0; size: auto; }
                }
            `}} />
        </div>
    );
};

export default ExecutionReportView;
