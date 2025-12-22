import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Loader2, FileText, Download, AlertCircle } from 'lucide-react';
import { ReportStats } from './ReportStats';
import { ReportMap } from './ReportMap';
import { toast } from 'sonner';
import { ReportService } from '../../../api/reportService';

// Type definitions
interface TreeData {
    id: string;
    especie: string;
    dap: number;
    altura: number;
    risco: string;
    fatores_risco?: string[];
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
}

interface Stats {
    totalTrees: number;
    totalSpecies: number;
    avgDap: number;
    avgHeight: number;
    highRiskCount: number;
}

interface ChartsData {
    riskDistribution: { name: string; value: number; color: string }[];
    speciesDistribution: { name: string; value: number }[];
}

export function ReportGenerator() {
    const { activeInstallation } = useAuth();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [trees, setTrees] = useState<TreeData[]>([]);
    const [chartsData, setChartsData] = useState<ChartsData | null>(null);

    // State
    const [mapReady, setMapReady] = useState(false);

    // Load initial data
    useEffect(() => {
        if (activeInstallation) {
            loadData();
        }
    }, [activeInstallation]);

    const loadData = async () => {
        if (!activeInstallation) return;
        setLoading(true);
        try {
            // Fetch Trees
            const { data: treesData, error } = await supabase
                .from('arvores')
                .select('*')
                .eq('instalacao_id', activeInstallation.id)
                .is('deleted_at', null);

            if (error) throw error;

            console.log("Trees data fetched:", treesData?.length);

            // Fetch Photos for these trees
            const treeIds = (treesData || []).map((t: any) => t.id);
            const photoMap: Record<string, string> = {};

            if (treeIds.length > 0) {
                // Fetch latest photo for each tree
                const { data: photosData } = await supabase
                    .from('tree_photos')
                    .select('tree_id, storage_path')
                    .in('tree_id', treeIds)
                    .order('created_at', { ascending: false });

                if (photosData) {
                    // Group by tree_id to get only the first one (latest) per tree
                    const latestPhotos: Record<string, string> = {};
                    photosData.forEach((p: any) => {
                        if (!latestPhotos[p.tree_id]) {
                            latestPhotos[p.tree_id] = p.storage_path;
                        }
                    });

                    // Generate signed URLs
                    const paths = Object.values(latestPhotos);
                    if (paths.length > 0) {
                        const { data: signedData } = await supabase.storage
                            .from('tree-photos')
                            .createSignedUrls(paths, 3600);

                        if (signedData) {
                            // Map path to URL
                            const urlMap: Record<string, string> = {};
                            signedData.forEach((item) => {
                                if (item.path && item.signedUrl) {
                                    urlMap[item.path] = item.signedUrl;
                                }
                            });

                            // Map tree_id to URL
                            Object.keys(latestPhotos).forEach(tid => {
                                const path = latestPhotos[tid];
                                if (urlMap[path]) {
                                    photoMap[tid] = urlMap[path];
                                }
                            });
                        }
                    }
                }
            }

            // Process trees
            const safeTrees: TreeData[] = (treesData || []).map((t: any) => {
                // Parse risk factors
                let parsedFactors: string[] = [];
                if (Array.isArray(t.fatores_risco)) {
                    parsedFactors = t.fatores_risco;
                } else if (typeof t.fatores_risco === 'string') {
                    try {
                        const parsed = JSON.parse(t.fatores_risco);
                        if (Array.isArray(parsed)) parsedFactors = parsed;
                    } catch {
                        parsedFactors = [t.fatores_risco];
                    }
                }

                return {
                    id: t.id,
                    especie: t.especie,
                    dap: Number(t.dap) || 0,
                    altura: Number(t.altura) || 0,
                    risco: t.risco,
                    fatores_risco: parsedFactors,
                    latitude: t.latitude,
                    longitude: t.longitude,
                    photoUrl: photoMap[t.id]
                };
            });

            calculateStats(safeTrees);
            setTrees(safeTrees);
        } catch (err) {
            console.error('Error loading report data:', err);
            toast.error('Erro ao carregar dados para o relatório.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (treesList: TreeData[]) => {
        const totalTrees = treesList.length;
        const distinctSpecies = new Set(treesList.map(t => t.especie)).size;

        const validDap = treesList.filter(t => t.dap).map(t => Number(t.dap));
        const avgDap = validDap.length ? validDap.reduce((a, b) => a + b, 0) / validDap.length : 0;

        const validHeight = treesList.filter(t => t.altura).map(t => Number(t.altura));
        const avgHeight = validHeight.length ? validHeight.reduce((a, b) => a + b, 0) / validHeight.length : 0;

        const riskCounts: Record<string, number> = { Alto: 0, Médio: 0, Baixo: 0 };
        treesList.forEach(t => {
            if (t.risco && riskCounts[t.risco] !== undefined) riskCounts[t.risco]++;
        });

        const highRiskCount = riskCounts['Alto'];

        const speciesCounts: Record<string, number> = {};
        treesList.forEach(t => {
            const sp = t.especie || 'Não Identificada';
            speciesCounts[sp] = (speciesCounts[sp] || 0) + 1;
        });

        const sortedSpecies = Object.entries(speciesCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));

        setStats({
            totalTrees,
            totalSpecies: distinctSpecies,
            avgDap,
            avgHeight,
            highRiskCount
        });

        setChartsData({
            riskDistribution: [
                { name: 'Alto', value: riskCounts['Alto'], color: '#ef4444' },
                { name: 'Médio', value: riskCounts['Médio'], color: '#f59e0b' },
                { name: 'Baixo', value: riskCounts['Baixo'], color: '#22c55e' },
            ].filter(d => d.value > 0),
            speciesDistribution: sortedSpecies
        });
    };

    const handleGenerateReport = async () => {
        setGenerating(true);
        try {
            // 1. Prepare Payload (No map image needed, server handles it)
            const payload = {
                installation: activeInstallation,
                stats: stats,
                trees: trees
            };

            // 2. Call Backend
            toast.info("Gerando PDF no servidor (renderizando mapa)...");
            const pdfBlob = await ReportService.generateReport(payload);

            // 3. Trigger Download
            const url = window.URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Relatorio_${activeInstallation?.nome?.replace(/\s+/g, '_') || 'Inventario'}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Relatório gerado com sucesso!");

        } catch (e: any) {
            console.error(e);
            toast.error(`Erro ao gerar PDF: ${e.message} `);
            toast.warning("Certifique-se que o servidor está rodando (npm run server em /server)");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Carregando dados...</span>
            </div>
        );
    }

    if (!activeInstallation) return <div className="p-8">Selecione uma instalação.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
                    <p className="text-muted-foreground">
                        Gere relatórios PDF profissionais (Processamento no Servidor).
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Action Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Relatório Completo
                        </CardTitle>
                        <CardDescription>
                            Gera um PDF contendo resumo, gráficos, mapa e fotos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md border p-4 bg-muted/50">
                            <h4 className="font-medium mb-2 text-sm">Conteúdo:</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Estatísticas Gerais</li>
                                <li>Mapa de Localização (Satélite)</li>
                                <li>Tabela de Inventário ({trees.length} árvores)</li>
                                <li className="text-green-600 font-semibold">Renderização pelo Puppeteer (Server-Side)</li>
                            </ul>
                        </div>

                        <Button
                            onClick={handleGenerateReport}
                            disabled={generating || !mapReady}
                            className="w-full"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando PDF...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 h-4 w-4" />
                                    Gerar Relatório PDF
                                </>
                            )}
                        </Button>

                        {!mapReady && trees.length > 0 && (
                            <p className="text-xs text-center text-yellow-600">
                                Aguardando carregamento do mapa...
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <div className="relative space-y-6">
                    {/* Charts Preview */}
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Pré-visualização dos Gráficos:</div>
                        {chartsData && (
                            <div className="border rounded-lg overflow-hidden bg-white h-[400px] w-full p-4">
                                <ReportStats stats={chartsData} />
                            </div>
                        )}
                    </div>

                    {/* Map Preview (Only for visual feedback, not capture) */}
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Pré-visualização do Mapa (Interativo):</div>
                        <div className="border rounded-lg overflow-hidden bg-white h-[400px] w-full relative">
                            <ReportMap
                                trees={trees}
                                onLoad={() => setMapReady(true)}
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">* O mapa do PDF será gerado em alta resolução no servidor.</p>
                    </div>
                </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 flex gap-3 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                    <strong>Backend Ativo:</strong> A geração do PDF agora é feita por um serviço Node.js dedicado.
                </div>
            </div>
        </div>
    );
}
