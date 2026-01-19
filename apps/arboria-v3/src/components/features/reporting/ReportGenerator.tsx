import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Loader2, FileText, Download } from 'lucide-react';
import { ReportMap } from './ReportMap';
import { toast } from 'sonner';
import { ReportService } from '../../../api/reportService';
import { downloadFile } from '../../../utils/downloadUtils';
import { sanitizeFilename } from '../../../utils/fileUtils';
import { useDownloads } from '../../../context/DownloadContext';

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

export function ReportGenerator() {
    const navigate = useNavigate();
    const { activeInstallation } = useAuth();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);
    const [trees, setTrees] = useState<TreeData[]>([]);

    // State
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef<any>(null);

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

        setStats({
            totalTrees,
            totalSpecies: distinctSpecies,
            avgDap,
            avgHeight,
            highRiskCount
        });
    };

    const { addDownload, updateDownload } = useDownloads();

    // 1. Prepare Map Snapshot
    const getMapSnapshot = () => {
        if (mapRef.current) {
            try {
                return mapRef.current.getCanvas().toDataURL('image/png');
            } catch (err) {
                console.warn("Failed to capture map snapshot:", err);
            }
        }
        return null;
    };



    const handleGenerateReport = async () => {
        setGenerating(true);
        let downloadId = '';
        try {
            const mapImage = getMapSnapshot();

            const payload = {
                installation: activeInstallation,
                stats: stats,
                trees: trees,
                mapImage: mapImage
            };

            const baseFilename = `Relatorio_${activeInstallation?.nome || 'Inventario'}.pdf`;
            const filename = sanitizeFilename(baseFilename);

            downloadId = addDownload({
                filename,
                type: 'pdf'
            });

            navigate('/downloads');

            toast.info("Gerando PDF no servidor...");
            updateDownload(downloadId, { progress: 30 });

            const pdfBlob = await ReportService.generateReport(payload);

            updateDownload(downloadId, { progress: 70 });
            const result = await downloadFile(pdfBlob, filename);

            updateDownload(downloadId, {
                status: 'success',
                progress: 100,
                path: result.path
            });

            toast.success("Relatório gerado com sucesso!");

        } catch (e: any) {
            console.error(e);
            toast.error(`Erro ao gerar PDF: ${e.message} `);
            if (downloadId) {
                updateDownload(downloadId, { status: 'error', error: e.message });
            }
            toast.warning("Tente o modo Offline se o servidor falhar.");
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
                        Gere relatórios PDF do inventário.
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
                            <h4 className="font-medium mb-2 text-sm">Conteúdo do Relatório:</h4>

                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Estatísticas Gerais</li>
                                <li>Mapa de Localização</li>
                                <li>Tabela de Inventário ({trees.length} árvores)</li>
                                <li className="text-green-600 font-semibold">
                                    Renderização no Servidor (Alta Qualidade)
                                </li>
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
                    {/* Map Preview (Only for visual feedback, not capture) */}
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Pré-visualização do Mapa:</div>
                        <div className="border rounded-lg overflow-hidden bg-white h-[400px] w-full relative">
                            <ReportMap
                                trees={trees}
                                onLoad={(map) => {
                                    mapRef.current = map;
                                    setMapReady(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}


