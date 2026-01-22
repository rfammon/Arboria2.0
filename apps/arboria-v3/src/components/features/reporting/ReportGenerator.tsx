import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Loader2, FileText, Download } from 'lucide-react';
import { ReportMap } from './ReportMap';
import { toast } from 'sonner';
import { useReports } from '../../../context/ReportContext';

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

export function ReportGenerator() {
    const { activeInstallation } = useAuth();
    const [loading, setLoading] = useState(false);
    const [trees, setTrees] = useState<TreeData[]>([]);

    // State
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef<any>(null);
    const { requestCapture, queue } = useReports();

    const isGenerating = queue.some(q => q.type === 'risk-inventory');

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

            // Process trees
            const safeTrees: TreeData[] = (treesData || []).map((t: any) => {
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
                    longitude: t.longitude
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

    const calculateStats = (_treesList: TreeData[]) => {
        // Stats calculations removed as they are not used in the UI anymore but processed in background
    };

    const handleGenerateReport = async () => {
        toast.info("Iniciando geração do inventário em segundo plano...");
        requestCapture('risk-inventory', undefined, trees);
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
                            disabled={isGenerating || !mapReady}
                            className="w-full"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Gerando em segundo plano...
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

                <div className="relative space-y-6">
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
