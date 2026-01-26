import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../hooks/useExecution';
import ExecutionReport from '../components/features/reporting/ExecutionReport';
import { Button } from '../components/ui/button';
import { Printer, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { getPhotoSignedUrl } from '../lib/photoUrlService';
import { ReportService } from '../services/reportService';
import { toast } from 'sonner';

/**
 * ExecutionReportView Component
 * Renders a full-page preview of the Execution Report for a specific task.
 * Optimized for viewing (with scroll) and printing (Puppeteer layout).
 */
const ExecutionReportView: React.FC = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const { data: task, isLoading, isError } = useTask(taskId);
    const [treePhotoUrl, setTreePhotoUrl] = useState<string>('');
    const [categorizedPhotos, setCategorizedPhotos] = useState<{
        antes: string[];
        execucao: string[];
        depois: string[];
    }>({ antes: [], execucao: [], depois: [] });
    const [loadingUrls, setLoadingUrls] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Helper to capture map as image if needed
    const captureMap = async (): Promise<string | undefined> => {
        const canvas = document.querySelector('.maplibregl-canvas') as HTMLCanvasElement;
        if (!canvas) return undefined;
        return canvas.toDataURL('image/png');
    };

    const handlePrint = async () => {
        if (!task) return;
        
        setIsGeneratingPdf(true);
        const toastId = toast.loading('Preparando PDF profissional...');

        try {
            const mapImage = await captureMap();
            
            // Map data for the template
            const rawTree = task.tree || (task as any).arvores;
            const tree = Array.isArray(rawTree) ? rawTree[0] : rawTree;

            const treeData = {
                codigo: tree?.codigo || 'ARB-N/A',
                especie: tree?.especie || 'Espécie não identificada',
                localizacao: [tree?.local, tree?.bairro].filter(Boolean).join(', ') || 'Localização não informada',
                nivelRisco: mapRiskLevel(tree?.risklevel),
                altura: tree?.altura || 0,
                dap: tree?.dap || 0,
                latitude: Number(tree?.latitude || task.tree_lat || 0),
                longitude: Number(tree?.longitude || task.tree_lng || 0)
            };

            const executionData = {
                id: task.id.slice(0, 8).toUpperCase(),
                dataEmissao: task.completed_at ? new Date(task.completed_at) : new Date(),
                diagnostico: task.description || "Intervenção técnica programada.",
                acao: task.intervention_type?.toUpperCase() || "EXECUÇÃO",
                observacoes: task.notes || "Execução realizada sem intercorrências.",
                equipe: (task as any).assignee?.nome || (task as any).assignee_name || "Equipe ArborIA",
                fotos: categorizedPhotos
            };

            const blob = await ReportService.generateExecutionReport({
                tree: treeData,
                execution: executionData,
                mapImage
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `relatorio-execucao-${treeData.codigo}.pdf`;
            link.click();
            
            toast.success('PDF gerado com sucesso!', { id: toastId });
        } catch (err: any) {
            console.error('PDF Generation Error:', err);
            toast.error(`Falha ao gerar PDF: ${err.message}`, { id: toastId });
            // Fallback to browser print if server fails
            window.print();
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    useEffect(() => {
        const loadPhotos = async () => {
            if (!task) return;
            setLoadingUrls(true);
            try {
                const photos = {
                    antes: [] as string[],
                    execucao: [] as string[],
                    depois: [] as string[]
                };

                // 1. Load Tree Photos (Inventory) -> ANTES
                if ((task.tree as any)?.tree_photos) {
                    for (const photo of (task.tree as any).tree_photos) {
                        const url = photo.storage_path ? await getPhotoSignedUrl(photo.storage_path) : photo.url;
                        if (url) photos.antes.push(url);
                    }
                }

                // 2. Load Task Evidence -> Group by stage
                if (task.evidence) {
                    for (const ev of task.evidence) {
                        const url = ev.photo_url;
                        if (!url) continue;
                        
                        const stage = ev.stage as string;

                        if (stage === 'before') {
                            photos.antes.push(url);
                        } else if (stage === 'during_1' || stage === 'during_2' || stage === 'during') {
                            photos.execucao.push(url);
                        } else if (stage === 'after' || stage === 'completion' || stage === 'completed') {
                            photos.depois.push(url);
                        }
                    }
                }

                setCategorizedPhotos(photos);
                if (photos.antes.length > 0) setTreePhotoUrl(photos.antes[0]);
            } catch (err) {
                console.error('Error loading report photos:', err);
            } finally {
                setLoadingUrls(false);
            }
        };

        loadPhotos();
    }, [task]);

    if (isLoading || loadingUrls) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <Loader2 className="w-12 h-12 text-[#2e7d32] animate-spin mb-4" />
                <p className="text-slate-600 font-medium animate-pulse">Gerando visualização técnica...</p>
            </div>
        );
    }

    if (isError || !task) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Registro não encontrado</h2>
                    <p className="text-slate-600 mb-6 font-medium">Não foi possível localizar os dados desta execução.</p>
                    <Button onClick={() => navigate(-1)} variant="outline" className="w-full h-12 rounded-xl border-2 border-slate-100 font-bold hover:bg-slate-50 transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
                    </Button>
                </div>
            </div>
        );
    }

    // Helper to map English/Raw risk levels to Portuguese display labels
    const mapRiskLevel = (risk: string | null | undefined): 'Baixo' | 'Médio' | 'Alto' => {
        if (!risk) return 'Baixo';
        const r = risk.toLowerCase();
        if (r.includes('alto') || r.includes('high') || r.includes('3')) return 'Alto';
        if (r.includes('médio') || r.includes('medio') || r.includes('medium') || r.includes('2')) return 'Médio';
        return 'Baixo';
    };

    // Data Mapping - Explicitly check for tree and coordinates
    const rawTree = task.tree || (task as any).arvores;
    const tree = Array.isArray(rawTree) ? rawTree[0] : rawTree;

    const treeData: any = {
        id: tree?.id || task.tree_id || '',
        codigo: tree?.codigo || 'ARB-N/A',
        especie: tree?.especie || 'Espécie não identificada',
        localizacao: [tree?.local, tree?.bairro].filter(Boolean).join(', ') || 'Localização não informada no cadastro',
        nivelRisco: mapRiskLevel(tree?.risklevel),
        altura: tree?.altura || 0,
        dap: tree?.dap || 0,
        fotoUrl: treePhotoUrl,
        // Ensure numeric conversion and fallback to task level coords
        latitude: Number(tree?.latitude || task.tree_lat || 0),
        longitude: Number(tree?.longitude || task.tree_lng || 0)
    };

    console.log('[ExecutionReport] Coords:', treeData.latitude, treeData.longitude);

    const executionData: any = {
        diagnostico: task.description || "Intervenção técnica programada conforme cronograma de manutenção.",
        acao: task.intervention_type?.toUpperCase() || "INTERVENÇÃO TÉCNICA",
        observacoes: task.notes || "Execução realizada sem intercorrências críticas.",
        equipe: (task as any).assignee?.nome || (task as any).assignee_name || "Equipe Técnica Arboria",
        fotos: categorizedPhotos
    };



    return (
        <div className="h-screen w-full flex flex-col bg-slate-100 print:h-auto print:bg-white overflow-hidden">
            {/* Action Bar - Hidden during print */}
            <div className="flex-none bg-white/80 backdrop-blur-md border-b shadow-sm z-20 px-6 py-4 print:hidden">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px]">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                        </Button>
                        <div className="h-6 w-px bg-slate-200" />
                        <h1 className="text-xs font-black text-slate-900 uppercase tracking-tighter">
                            Visualização do Relatório <span className="text-emerald-600 ml-2">#{task.id.slice(0, 8).toUpperCase()}</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button 
                            onClick={handlePrint} 
                            disabled={isGeneratingPdf}
                            className="bg-slate-900 hover:bg-black text-white px-6 h-10 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingPdf ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Printer className="w-4 h-4" /> 
                            )}
                            {isGeneratingPdf ? 'Gerando...' : 'Imprimir / PDF'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Scrollable Container for Preview */}
            <div className="flex-1 overflow-y-auto p-4 md:p-12 print:p-0 print:overflow-visible custom-scrollbar">
                <div className="mx-auto shadow-2xl shadow-slate-300 print:shadow-none max-w-fit rounded-3xl overflow-hidden bg-white">
                    <ExecutionReport 
                        id={`EXE-${task.id.slice(0, 8).toUpperCase()}`}
                        dataEmissao={task.completed_at ? new Date(task.completed_at) : new Date()}
                        tree={treeData}
                        execution={executionData}
                    />
                </div>
                
                {/* Visual margin at the bottom of web preview */}
                <div className="h-20 print:hidden" />
            </div>

            {/* Style injection for layout fixes */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    html, body, #root { 
                        height: auto !important; 
                        overflow: visible !important; 
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    @page { 
                        margin: 0mm; 
                        size: A4; 
                    }
                }
                
                /* Better scrollbar for web view */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </div>
    );
};

export default ExecutionReportView;
