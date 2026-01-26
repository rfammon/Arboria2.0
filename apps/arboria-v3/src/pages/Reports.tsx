import { SectionHeader } from '../components/ui/section-header';
import { FileBarChart, Download, Upload, History, FileText, Trash2, Printer, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ReportSelector, type ReportType } from '../components/reports/ReportSelector';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { usePlans } from '../hooks/usePlans';
import { useTrees } from '../hooks/useTrees';
import { useTasks } from '../hooks/useExecution';
import { BackupService } from '../services/backupService';
import { executionService } from '../services/executionService';
import { useRef } from 'react';
import { useDownloads } from '../context/DownloadContext';
import { useReports } from '../context/ReportContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reports() {
    const { activeInstallation } = useAuth();
    const { plans } = usePlans();
    const { data: trees = [] } = useTrees();
    const { data: allTasks = [], refetch: refetchTasks } = useTasks();
    const { addDownload, updateDownload } = useDownloads();
    const { requestCapture } = useReports();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter finished reports
    const finishedReports = allTasks.filter(t => 
        (t.status === 'COMPLETED' || t.status === 'PENDING_APPROVAL') && 
        t.instalacao_id === activeInstallation?.id
    ).sort((a, b) => new Date(b.completed_at || b.updated_at).getTime() - new Date(a.completed_at || a.updated_at).getTime());

    const handleDeleteReport = async (taskId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este relatório de execução permanentemente?')) return;

        try {
            // Note: In this system, deleting a report is deleting the task or archiving it.
            // Since we don't have a dedicated delete report RPC for tasks yet, we use the work_order delete or similar.
            // For now, let's implement a direct delete if possible or show a warning.
            toast.promise(executionService.cancelTask(taskId, 'Exclusão de relatório', 'user_id'), {
                loading: 'Removendo relatório...',
                success: () => {
                    refetchTasks();
                    return 'Relatório removido com sucesso';
                },
                error: 'Falha ao remover relatório'
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerateReport = (type: ReportType, selectedId?: string) => {
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
            data = (plans || []).filter(p => p.status !== 'CANCELLED');
        } else if (type === 'risk-inventory') {
            data = trees;
        } else if (type === 'execution-report' && selectedId) {
            data = (allTasks || []).find(t => t.id === selectedId);
        }

        toast.info('Geração do relatório iniciada em segundo plano. Você pode continuar usando o app.');

        requestCapture(type, selectedId, data);
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
        <div className="space-y-6 animate-in fade-in duration-500 relative bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl min-h-full">
            <SectionHeader 
                badge="Intelligence"
                title="Relatórios &"
                highlight="Documentos"
                description="Gere relatórios profissionais e gerencie dados analíticos do sistema."
                icon={FileBarChart}
                align="left"
            />

            <Tabs defaultValue="generate" className="w-full space-y-6">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-muted/50 p-1 text-muted-foreground border border-white/5 shadow-inner">
                    <TabsTrigger value="generate" className="rounded-xl px-8 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">Gerar Relatórios</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-8 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all flex items-center gap-2">
                        <History className="w-4 h-4" /> Execuções
                    </TabsTrigger>
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

                <TabsContent value="history" className="space-y-4">
                    <div className="grid gap-4">
                        {finishedReports.length === 0 ? (
                            <Card className="p-12 text-center flex flex-col items-center justify-center bg-muted/20 border-dashed">
                                <FileText className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                                <h3 className="text-lg font-bold text-muted-foreground">Nenhum relatório de execução encontrado</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">Relatórios aparecem aqui assim que as tarefas são finalizadas em campo.</p>
                            </Card>
                        ) : (
                            finishedReports.map(report => (
                                <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-all group border-white/5">
                                    <div className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-black text-slate-900 uppercase tracking-tight">#{report.id.substring(0, 8).toUpperCase()}</h3>
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-500 uppercase">{report.intervention_type}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    Árvore: <span className="font-bold text-slate-700">{report.tree?.especie || report.tree_id.substring(0, 8)}</span>
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    <span>{report.completed_at ? format(new Date(report.completed_at), "dd MMM yyyy", { locale: ptBR }) : 'Data N/A'}</span>
                                                    <span>&bull;</span>
                                                    <span>{report.assignee_name || 'Equipe Arboria'}</span>
                                                </div>
                                            </div>
                                        </div>

                                         <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                                            <Button 
                                                variant="contorno" 
                                                size="sm" 
                                                className="h-9 px-4 rounded-xl font-bold gap-2 hover:bg-emerald-50 hover:text-emerald-700"
                                                onClick={() => navigate(`/execution/report/${report.id}`)}
                                            >
                                                <Printer className="w-4 h-4" /> Visualizar / Imprimir
                                            </Button>
                                            <Button 
                                                variant="fantasma" 
                                                size="icon" 
                                                className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={() => handleDeleteReport(report.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
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
                                    variant="principal"
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
                                    variant="principal"
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
                                    variant="principal"
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
