import { Download, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ReportSelector, type ReportType } from '../components/reports/ReportSelector';
import { ReportService } from '../api/reportService';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { usePlans } from '../hooks/usePlans';
import { useTrees } from '../hooks/useTrees';
import { supabase } from '../lib/supabase';
import { BackupService } from '../services/backupService';
import { useRef, useState, useEffect } from 'react';
import { downloadFile } from '../utils/downloadUtils';
import { useDownloads } from '../context/DownloadContext';
import html2canvas from 'html2canvas';

// Visual Components for Capture
import { ReportMap } from '../components/features/reporting/ReportMap';
import { ReportGantt } from '../components/reports/shared/ReportGantt';
import { ReportGeneralGantt } from '../components/reports/shared/ReportGeneralGantt';

export default function Reports() {
    const { activeInstallation } = useAuth();
    const { plans } = usePlans();
    const { data: trees = [] } = useTrees();
    const { addDownload, updateDownload } = useDownloads();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State for Headless Capture
    const [generating, setGenerating] = useState(false);
    const [captureConfig, setCaptureConfig] = useState<{
        type: ReportType | null;
        id?: string;
        data?: any; // The tree or plan object
    }>({ type: null });

    // Unused state removed
    const mapRef = useRef<any>(null);
    const ganttRef = useRef<HTMLDivElement>(null);
    const generalGanttRef = useRef<HTMLDivElement>(null);

    // Cleanup state when finished
    const resetCapture = () => {
        setCaptureConfig({ type: null });
        setGenerating(false);
        mapRef.current = null;
    };

    // The actual generation function triggered after capture readiness or immediate if no capture needed
    const executeGeneration = async (images: { mapImage?: string; ganttImage?: string } = {}) => {
        if (!activeInstallation || !captureConfig.type) return;

        const { type, id: selectedId } = captureConfig;
        let downloadId = '';

        try {
            let reportResult: Blob | { path: string; platform: 'android' };
            let filename: string;

            // Pre-calculate filename
            let initialFilename = 'Relatorio.pdf';
            if (type === 'intervention-plan') {
                const plan = (plans || []).find(p => p.id === selectedId);
                initialFilename = `Plano_${plan?.plan_id || 'Intervencao'}.pdf`;
            } else if (type === 'tree-individual') {
                const tree = (trees || []).find(t => t.id === selectedId);
                initialFilename = `Ficha_${tree?.codigo || 'Arvore'}.pdf`;
            } else if (type === 'schedule') {
                initialFilename = `Cronograma.pdf`;
            } else {
                initialFilename = `Inventario_Risco.pdf`;
            }

            downloadId = addDownload({
                filename: initialFilename,
                type: 'pdf'
            });

            updateDownload(downloadId, { progress: 30 }); // Started

            switch (type) {
                case 'intervention-plan':
                    if (!selectedId) throw new Error('Selecione um plano');
                    toast.info('Gerando relatório de plano de intervenção...');

                    reportResult = await ReportService.generateInterventionPlanReport(selectedId, {
                        mapImage: images.mapImage,
                        ganttImage: images.ganttImage
                    });

                    const plan = (plans || []).find(p => p.id === selectedId);
                    filename = `Plano_${plan?.plan_id || selectedId.slice(0, 8)}.pdf`;
                    break;

                case 'tree-individual':
                    if (!selectedId) throw new Error('Selecione uma árvore');
                    toast.info('Gerando ficha individual...');

                    reportResult = await ReportService.generateTreeReport(selectedId, {
                        mapImage: images.mapImage
                    });

                    const tree = (trees || []).find(t => t.id === selectedId);
                    filename = `Ficha_${tree?.codigo || selectedId.slice(0, 8)}.pdf`;
                    break;

                case 'schedule':
                    toast.info('Gerando cronograma...');

                    reportResult = await ReportService.generateScheduleReport({
                        ganttImage: images.ganttImage
                    });

                    filename = `Cronograma_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
                    break;

                case 'risk-inventory':
                default:
                    toast.info('Gerando inventário de risco...');
                    // Logic from ReportGenerator usually handles this via other means, but if called here:
                    const { data: treesData } = await supabase
                        .from('arvores')
                        .select('*')
                        .eq('instalacao_id', activeInstallation.id)
                        .is('deleted_at', null);

                    if (!treesData) throw new Error('Falha ao carregar dados das árvores');

                    const stats = {
                        totalTrees: treesData.length,
                        highRiskCount: treesData.filter(t => t.risklevel === 'Alto').length,
                        totalSpecies: new Set(treesData.map(t => t.especie)).size,
                        avgDap: treesData.reduce((acc, t) => acc + (t.dap || 0), 0) / (treesData.length || 1),
                        avgHeight: treesData.reduce((acc, t) => acc + (t.altura || 0), 0) / (treesData.length || 1)
                    };

                    const payload = {
                        installation: activeInstallation,
                        trees: treesData,
                        stats: stats,
                        mapImage: images.mapImage
                        // Note: Charts are missed here unless we also render them hidden. 
                        // Assuming Risk Inventory usually goes via ReportGenerator component.
                    };
                    reportResult = await ReportService.generateRiskInventoryReport(payload);
                    filename = `Inventario_Risco.pdf`;
                    break;
            }

            updateDownload(downloadId, { progress: 80 });

            // Download PDF
            const result = await downloadFile(reportResult as Blob, filename);

            updateDownload(downloadId, {
                status: 'success',
                progress: 100,
                path: result.path,
                filename: filename
            });

            toast.success('Relatório gerado com sucesso!');

        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(`Erro ao gerar relatório: ${error.message}`);
            if (downloadId) updateDownload(downloadId, { status: 'error', error: error.message });
        } finally {
            resetCapture();
        }
    };

    const handleGenerateReport = async (type: ReportType, selectedId?: string) => {
        if (!activeInstallation) {
            toast.error('Selecione uma instalação');
            return;
        }

        // Specific data preparation for capture
        let data: any = null;
        if (type === 'intervention-plan' && selectedId) {
            data = (plans || []).find(p => p.id === selectedId);
        } else if (type === 'tree-individual' && selectedId) {
            data = (trees || []).find(t => t.id === selectedId);
        } else if (type === 'schedule') {
            // Include all active and completed plans for the summary schedule, ignore only cancelled/drafts if we want to be clean
            // Let's show everything that isn't explicitly cancelled.
            data = (plans || []).filter(p => p.status !== 'CANCELLED');
        } else if (type === 'risk-inventory') {
            // For Risk Inventory, we need trees to render the map
            data = trees;
        }

        // If not mobile, we might skip capture if we trust Puppeteer, 
        // BUT Puppeteer might also miss dynamic JS maps if not waited properly.
        // Let's use capture for consistency if possible, or just for Mobile.
        // For this task (fix Android), we MUST use capture.

        setGenerating(true);
        setCaptureConfig({ type, id: selectedId, data });

        // The useEffect below will trigger the actual capture once logic determines 'ready'
    };

    // Effect to trigger capture sequence
    useEffect(() => {
        if (!generating || !captureConfig.type) return;

        let cancelled = false;

        const runCapture = async () => {
            console.log(`[Reports] Starting capture sequence for: ${captureConfig.type}`);

            // 1. Wait for components to render
            await new Promise(r => setTimeout(r, 1000));
            if (cancelled) return;

            const images: { mapImage?: string; ganttImage?: string } = {};

            // 2. Wait for MapRef if needed
            const needsMap = ['intervention-plan', 'tree-individual', 'risk-inventory'].includes(captureConfig.type!);
            if (needsMap) {
                console.log("[Reports] Waiting for map component to initialize...");
                let attempts = 0;
                while (!mapRef.current && attempts < 20) { // Wait up to 10s (20 * 500ms)
                    await new Promise(r => setTimeout(r, 500));
                    if (cancelled) return;
                    attempts++;
                }

                if (!mapRef.current) {
                    console.warn("[Reports] Map reference never populated. Capture might fail.");
                } else {
                    console.log("[Reports] Map reference found, proceeding to capture.");
                }
            }

            // 3. Capture Map (if applicable)
            if (needsMap && mapRef.current) {
                try {
                    const map = mapRef.current;
                    if (!map.loaded()) {
                        console.log("[Reports] Waiting for map idle/tiles...");
                        // Wait up to 8s more for idle (satellite tiles are slow)
                        await Promise.race([
                            new Promise(resolve => map.once('idle', resolve)),
                            new Promise(resolve => setTimeout(resolve, 8000))
                        ]);
                    }

                    // Small delay to ensure WebGL buffer is ready after idle
                    await new Promise(r => setTimeout(r, 200));

                    images.mapImage = map.getCanvas().toDataURL('image/png');

                    if (images.mapImage && images.mapImage.length > 1000) {
                        console.log(`[Reports] Map captured successfully. Image size: ${Math.round(images.mapImage.length / 1024)} KB`);
                    } else {
                        console.warn("[Reports] Map capture returned empty or suspicious payload:", images.mapImage?.slice(0, 100));
                        // Try one more time with a frame request
                        await new Promise(r => requestAnimationFrame(r));
                        images.mapImage = map.getCanvas().toDataURL('image/png');
                        console.log(`[Reports] Retry capture size: ${images.mapImage?.length || 0} bytes`);
                    }
                } catch (e) {
                    console.warn("Map capture failed", e);
                }
            }

            // 4. Capture Gantt (if applicable)
            try {
                if (captureConfig.type === 'intervention-plan' && ganttRef.current) {
                    const canvas = await html2canvas(ganttRef.current, { scale: 2, logging: false, useCORS: true, backgroundColor: '#ffffff', allowTaint: true });
                    images.ganttImage = canvas.toDataURL('image/png');
                } else if (captureConfig.type === 'schedule' && generalGanttRef.current) {
                    const canvas = await html2canvas(generalGanttRef.current, { scale: 2, logging: false, useCORS: true, backgroundColor: '#ffffff', allowTaint: true });
                    images.ganttImage = canvas.toDataURL('image/png');
                }
            } catch (e) {
                console.warn("Gantt capture failed", e);
            }

            // Proceed to generation
            if (!cancelled) {
                await executeGeneration(images);
            }
        };

        runCapture();

        return () => { cancelled = true; };
    }, [generating, captureConfig]);


    const handleAction = async (action: string) => {
        let downloadId = '';
        try {
            switch (action) {
                case 'Exportar CSV': {
                    toast.info('Iniciando exportação CSV...');
                    const filename = `arboria_arvores_${new Date().toISOString().split('T')[0]}.csv`;
                    downloadId = addDownload({ filename, type: 'csv' });

                    const result = await BackupService.exportTreesCSV(activeInstallation?.id);

                    if (result) {
                        updateDownload(downloadId, {
                            status: 'success',
                            progress: 100,
                            path: result.path
                        });
                    }
                    break;
                }
                case 'Baixar Backup': {
                    toast.info('Gerando backup ZIP...');
                    const filename = `arboria_backup_${new Date().toISOString().split('T')[0]}.zip`;
                    downloadId = addDownload({ filename, type: 'zip' });

                    const result = await BackupService.exportData(activeInstallation?.id);

                    if (result) {
                        updateDownload(downloadId, {
                            status: 'success',
                            progress: 100,
                            path: result.path
                        });
                    }
                    break;
                }
                case 'Importar Dados':
                    fileInputRef.current?.click();
                    break;
            }
        } catch (error: any) {
            console.error(`Action ${action} failed:`, error);
            toast.error(`Falha na ação: ${error.message}`);
            if (downloadId) {
                updateDownload(downloadId, { status: 'error', error: error.message });
            }
        }
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast.info('Iniciando importação de backup...');
        try {
            await BackupService.importData(file);
            // Clear input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
            toast.error(`Erro na importação: ${error.message}`);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
            {/* Headless Capture Container - Off-screen but rendered */}
            {generating && (
                <div style={{
                    position: 'fixed',
                    bottom: -2000,
                    right: -2000,
                    width: '1000px',
                    opacity: 0.1, // Keep it slightly visible to prevent browser throttling WebGL
                    pointerEvents: 'none',
                    zIndex: -1
                }}>

                    {/* Map Capture */}
                    {['intervention-plan', 'tree-individual', 'risk-inventory'].includes(captureConfig.type!) && (
                        <div style={{ width: 800, height: 600 }}>
                            <ReportMap
                                trees={
                                    captureConfig.type === 'tree-individual' && captureConfig.data ? [captureConfig.data] :
                                        captureConfig.type === 'intervention-plan' && captureConfig.data?.tree ? [captureConfig.data.tree] :
                                            (trees || [])
                                }
                                onLoad={(map) => { mapRef.current = map; }}
                            />
                        </div>
                    )}

                    {/* Gantt Capture (Individual) */}
                    {captureConfig.type === 'intervention-plan' && captureConfig.data && (
                        <div ref={ganttRef} style={{ width: 800, backgroundColor: 'white', padding: 20 }}>
                            <ReportGantt plan={captureConfig.data} bufferDays={5} />
                        </div>
                    )}

                    {/* Gantt Capture (General/Schedule) */}
                    {captureConfig.type === 'schedule' && (
                        <div ref={generalGanttRef} style={{ width: 800, backgroundColor: 'white', padding: 20 }}>
                            <ReportGeneralGantt plans={captureConfig.data || plans || []} bufferDays={5} />
                        </div>
                    )}
                </div>
            )}

            {/* Status Overlay */}
            {generating && (
                <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-background p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <div className="text-center">
                            <h3 className="font-bold text-lg">Gerando Relatório</h3>
                            <p className="text-muted-foreground text-sm">Capturando gráficos e mapas...</p>
                        </div>
                    </div>
                </div>
            )}


            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight font-display">
                        Relatórios & <span className="text-primary italic">Documentos</span>
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Gere relatórios profissionais e gerencie dados do sistema</p>
                </div>
            </div>

            <Tabs defaultValue="generate" className="w-full space-y-6">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-muted/50 p-1 text-muted-foreground border border-white/5 shadow-inner">
                    <TabsTrigger value="generate" className="rounded-xl px-8 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">Gerar Relatórios</TabsTrigger>
                    <TabsTrigger value="export" className="rounded-xl px-8 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">Exportar Dados</TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-4">
                    <Card className="bg-card/70 backdrop-blur-md border-white/10 shadow-[var(--shadow-soft)] overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <CardHeader>
                            <CardTitle className="font-bold flex items-center gap-2">
                                <Download className="w-5 h-5 text-primary" />
                                Relatórios Disponíveis
                            </CardTitle>
                            <CardDescription className="font-medium">
                                Selecione o tipo de relatório e gere um PDF profissional com um clique
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <ReportSelector onGenerate={handleGenerateReport} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="export" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader>
                                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                                    <Download className="w-5 h-5 text-green-700" />
                                </div>
                                <CardTitle className="text-lg">Exportar Dados (CSV)</CardTitle>
                                <CardDescription>Baixar tabela de dados para Excel/Planilhas</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => handleAction('Exportar CSV')}
                                >
                                    Exportar CSV
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                                    <Download className="w-5 h-5 text-blue-700" />
                                </div>
                                <CardTitle className="text-lg">Backup Completo (ZIP)</CardTitle>
                                <CardDescription>Backup completo com fotos e dados locais</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => handleAction('Baixar Backup')}
                                >
                                    Baixar Backup
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                                    <Upload className="w-5 h-5 text-purple-700" />
                                </div>
                                <CardTitle className="text-lg">Importar Dados</CardTitle>
                                <CardDescription>Restaurar backup ou importar planilha</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => handleAction('Importar Dados')}
                                >
                                    Importar
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Hidden Input for Backup Import */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".zip"
                onChange={handleImportFile}
            />
        </div>
    );
}
