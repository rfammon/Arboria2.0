import { Download, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ReportSelector, type ReportType } from '../components/reports/ReportSelector';
import { ReportService } from '../api/reportService';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Reports() {
    const { activeInstallation } = useAuth();

    const handleGenerateReport = async (type: ReportType, selectedId?: string) => {
        if (!activeInstallation) {
            toast.error('Selecione uma instalação');
            return;
        }

        try {
            let pdfBlob: Blob;
            let filename: string;

            switch (type) {
                case 'intervention-plan':
                    if (!selectedId) {
                        toast.error('Selecione um plano');
                        return;
                    }
                    toast.info('Gerando relatório de plano de intervenção...');
                    pdfBlob = await ReportService.generateInterventionPlanReport(selectedId);
                    filename = `Plano_Intervencao_${selectedId}.pdf`;
                    break;

                case 'tree-individual':
                    if (!selectedId) {
                        toast.error('Selecione uma árvore');
                        return;
                    }
                    toast.info('Gerando ficha individual...');
                    pdfBlob = await ReportService.generateTreeReport(selectedId);
                    filename = `Arvore_${selectedId}.pdf`;
                    break;

                case 'schedule':
                    toast.info('Gerando cronograma...');
                    pdfBlob = await ReportService.generateScheduleReport();
                    filename = `Cronograma_${new Date().toISOString().split('T')[0]}.pdf`;
                    break;

                case 'risk-inventory':
                default:
                    toast.info('Gerando inventário de risco...');
                    // Fetch trees for the installation
                    const { data: trees } = await supabase
                        .from('arvores')
                        .select('*')
                        .eq('instalacao_id', activeInstallation.id)
                        .is('deleted_at', null);

                    if (!trees) throw new Error('Falha ao carregar dados das árvores');

                    // Calculate stats
                    const stats = {
                        totalTrees: trees.length,
                        highRiskCount: trees.filter(t => t.risklevel === 'Alto').length,
                        totalSpecies: new Set(trees.map(t => t.especie)).size,
                        avgDap: trees.reduce((acc, t) => acc + (t.dap || 0), 0) / (trees.length || 1),
                        avgHeight: trees.reduce((acc, t) => acc + (t.altura || 0), 0) / (trees.length || 1)
                    };

                    const payload = {
                        installation: activeInstallation,
                        trees: trees,
                        stats: stats
                    };
                    pdfBlob = await ReportService.generateRiskInventoryReport(payload);
                    filename = `Relatorio_${activeInstallation.nome?.replace(/\s+/g, '_') || 'Inventario'}.pdf`;
                    break;
            }

            // Download PDF
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Relatório gerado com sucesso!');

        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(`Erro ao gerar relatório: ${error.message}`);
        }
    };

    const handleAction = (action: string) => {
        toast.info(`Ação iniciada: ${action}`);
        // Implement actual logic later
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Relatórios e Documentos</h1>
                    <p className="text-gray-500 mt-2">Gere relatórios profissionais em PDF</p>
                </div>
            </div>

            <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="generate">Gerar Relatórios</TabsTrigger>
                    <TabsTrigger value="export">Exportar Dados</TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Relatórios Disponíveis</CardTitle>
                            <CardDescription>
                                Selecione o tipo de relatório e gere um PDF profissional
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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
        </div>
    );
}
