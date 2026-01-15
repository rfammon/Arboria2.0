import { Download, Upload } from 'lucide-react';
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
import { useRef } from 'react';
import { downloadFile } from '../utils/downloadUtils';
import { useDownloads } from '../context/DownloadContext';

export default function Reports() {
    const { activeInstallation } = useAuth();
    const { plans } = usePlans();
    const { data: trees = [] } = useTrees();
    const { addDownload, updateDownload } = useDownloads();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateReport = async (type: ReportType, selectedId?: string) => {
        if (!activeInstallation) {
            toast.error('Selecione uma instalação');
            return;
        }

        let downloadId = '';
        try {
            let pdfBlob: Blob;
            let filename: string;

            // Pre-calculate filename for early registration
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

            switch (type) {
                case 'intervention-plan':
                    if (!selectedId) {
                        toast.error('Selecione um plano');
                        return;
                    }
                    toast.info('Gerando relatório de plano de intervenção...');
                    const planBlob = await ReportService.generateInterventionPlanReport(selectedId);
                    pdfBlob = new Blob([planBlob], { type: 'application/pdf' });

                    // Try to find human readable ID
                    const plan = (plans || []).find(p => p.id === selectedId);
                    const planCode = plan?.plan_id || selectedId.slice(0, 8);
                    filename = `Plano_${planCode}.pdf`;
                    break;

                case 'tree-individual':
                    if (!selectedId) {
                        toast.error('Selecione uma árvore');
                        return;
                    }
                    toast.info('Gerando ficha individual...');
                    const treeBlob = await ReportService.generateTreeReport(selectedId);
                    pdfBlob = new Blob([treeBlob], { type: 'application/pdf' });

                    const tree = (trees || []).find(t => t.id === selectedId);
                    const treeCode = tree?.codigo || selectedId.slice(0, 8);
                    filename = `Ficha_${treeCode}.pdf`;
                    break;

                case 'schedule':
                    toast.info('Gerando cronograma...');
                    const scheduleBlob = await ReportService.generateScheduleReport();
                    pdfBlob = new Blob([scheduleBlob], { type: 'application/pdf' });
                    filename = `Cronograma_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
                    break;

                case 'risk-inventory':
                default:
                    toast.info('Gerando inventário de risco...');
                    // Fetch trees for the installation
                    const { data: treesData } = await supabase
                        .from('arvores')
                        .select('*')
                        .eq('instalacao_id', activeInstallation.id)
                        .is('deleted_at', null);

                    if (!treesData) throw new Error('Falha ao carregar dados das árvores');

                    // Calculate stats
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
                        stats: stats
                    };
                    const inventoryBlob = await ReportService.generateRiskInventoryReport(payload);
                    pdfBlob = new Blob([inventoryBlob], { type: 'application/pdf' });

                    const safeInstallName = activeInstallation.nome?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '_');
                    filename = `Inventario_Risco_${safeInstallName || 'Geral'}.pdf`;
                    break;
            }

            // Download PDF
            updateDownload(downloadId, { progress: 50 });
            const result = await downloadFile(pdfBlob, filename);
            updateDownload(downloadId, {
                status: 'success',
                progress: 100,
                path: result.path,
                filename: filename // Update in case it changed
            });

            toast.success('Relatório gerado com sucesso!');

        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(`Erro ao gerar relatório: ${error.message}`);
            if (downloadId) {
                updateDownload(downloadId, { status: 'error', error: error.message });
            }
        }
    };

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
        <div className="space-y-8 animate-in fade-in duration-500">
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
