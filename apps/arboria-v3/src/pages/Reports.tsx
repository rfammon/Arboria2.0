import { Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ReportSelector, type ReportType } from '../components/reports/ReportSelector';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { usePlans } from '../hooks/usePlans';
import { useTrees } from '../hooks/useTrees';
import { BackupService } from '../services/backupService';
import { useRef } from 'react';
import { useDownloads } from '../context/DownloadContext';
import { useReports } from '../context/ReportContext';

export default function Reports() {
    const { activeInstallation } = useAuth();
    const { plans } = usePlans();
    const { data: trees = [] } = useTrees();
    const { addDownload, updateDownload } = useDownloads();
    const { requestCapture } = useReports();
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        <div className="space-y-8 animate-in fade-in duration-500 relative">
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
