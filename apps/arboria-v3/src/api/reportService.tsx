// Re-trigger build
import { supabase } from '../lib/supabase';
import { renderToStaticMarkup } from 'react-dom/server';
import { InterventionPlanReport } from '../components/reports/templates/InterventionPlanReport';
import { TreeReport } from '../components/reports/templates/TreeReport';
import { ScheduleReport } from '../components/reports/templates/ScheduleReport';
import { RiskInventoryReport } from '../components/reports/templates/RiskInventoryReport';

const getBaseUrl = () => {
    // Priority 1: Environment variable
    let url = import.meta.env.VITE_REPORT_SERVER_URL || '';

    if (url) {
        url = url.trim();
        // Remove trailing slash
        url = url.replace(/\/$/, '');
        // Remove /api/reports if it was included in the .env by mistake
        url = url.replace(/\/api\/reports$/, '');
        return url;
    }

    // In Tauri v2 production, protocol is often 'http:' with hostname 'tauri.localhost'
    const isTauri = window.location.origin.includes('tauri.localhost') ||
        window.location.protocol === 'tauri:' ||
        (!!window.__TAURI__);

    // In production, there is usually no port or it's not a standard dev port
    const isProd = !window.location.port || window.location.port === '';

    if (isTauri && isProd) {
        return 'http://127.0.0.1:3001';
    }

    // On Capacitor, we must NOT use relative URLs as they fetch index.html
    const isCapacitor = window.location.protocol === 'capacitor:';
    if (isCapacitor) {
        return '';
    }

    return '';
};

export const ReportService = {
    async healthCheck() {
        try {
            const baseUrl = getBaseUrl();
            if (!baseUrl) return;

            const response = await fetch(`${baseUrl}/health`);
            if (response.ok) {
                console.log('[ReportService] Health check OK');
            }
        } catch (e) {
            console.warn('[ReportService] Health check failed', e);
        }
    },

    async handleResponseError(response: Response, fallbackMessage: string) {
        const text = await response.text();
        try {
            // Check if it's actually HTML (common routing error)
            if (text.toLowerCase().includes('<!doctype') || text.toLowerCase().includes('<html')) {
                throw new Error("O servidor retornou uma página HTML em vez de um erro JSON. Verifique se a URL do servidor está correta.");
            }

            const error = JSON.parse(text);
            throw new Error(error.details || error.error || fallbackMessage);
        } catch (e: any) {
            if (e.message.includes("página HTML")) throw e;
            throw new Error(`Erro do Servidor (${response.status}): ${text.slice(0, 100)}...`);
        }
    },

    async validatePdf(blob: Blob) {
        // 1. Basic size check
        if (blob.size < 100) {
            const text = await blob.text();
            console.error("PDF too small:", text);
            throw new Error("O servidor retornou um arquivo vazio ou muito pequeno.");
        }

        // 2. Check for HTML fallback (Routing error)
        const headerBuffer = await blob.slice(0, 15).arrayBuffer();
        const header = new TextDecoder().decode(headerBuffer);

        if (header.toLowerCase().includes('<!doctype') || header.toLowerCase().includes('<html')) {
            console.error("Received HTML instead of PDF:", header);
            throw new Error("Erro de Roteamento: O aplicativo recebeu uma página HTML em vez de um PDF. Verifique se o endereço do servidor de relatórios está correto.");
        }

        // 3. Verify PDF Magic Bytes
        if (!header.startsWith('%PDF-')) {
            console.error("Invalid PDF Header:", header);
            throw new Error("O arquivo recebido não é um PDF válido.");
        }
    },
    async generateReport(data: any) {
        try {
            const baseUrl = getBaseUrl();
            if (!baseUrl && window.location.protocol === 'capacitor:') {
                throw new Error("Configuração ausente: A URL do servidor de relatórios não foi definida. Verifique o arquivo .env.");
            }
            const endpoint = `${baseUrl}/api/reports/generate-report`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                await this.handleResponseError(response, 'Failed to generate PDF');
            }

            const blob = await response.blob();
            await this.validatePdf(blob);
            return blob;
        } catch (error: any) {
            console.error("Report Service Error:", error);
            if (error.message === 'Failed to fetch') {
                throw new Error("Erro de conexão com o servidor de relatórios. Verifique se o app foi instalado corretamente.");
            }
            throw error;
        }
    },

    async generateInterventionPlanReport(planId: string, mapImage?: string) {
        try {
            // 1. Fetch Plan Details
            const { data: plan, error: planError } = await supabase
                .from('intervention_plans')
                .select(`
                    *,
                    instalacao:instalacoes(nome)
                `)
                .eq('id', planId)
                .single();

            if (planError) throw new Error(`Erro ao buscar plano: ${planError.message}`);

            // 2. Fetch Tree Data (if associated)
            let tree = null;

            if (plan.tree_id) {
                const { data: treeData, error: treeError } = await supabase
                    .from('arvores')
                    .select('*')
                    .eq('id', plan.tree_id)
                    .single();

                if (treeError) {
                    console.warn('Erro ao buscar árvore:', treeError);
                } else {
                    tree = treeData;

                    // Fetch photos separately and generate URLs
                    const { data: photosData } = await supabase
                        .from('tree_photos')
                        .select('*')
                        .eq('tree_id', plan.tree_id)
                        .order('created_at', { ascending: false });

                    if (photosData && photosData.length > 0) {
                        // Generate signed URLs
                        const photosWithUrls = await Promise.all(
                            photosData.map(async (photo) => {
                                const { data } = await supabase.storage
                                    .from('tree-photos') // Correct bucket name
                                    .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

                                return {
                                    url: data?.signedUrl,
                                    data_foto: photo.created_at,
                                    is_cover: false // Add logic if needed
                                };
                            })
                        );

                        tree.arvore_fotos = photosWithUrls;
                    }
                }
            }

            // 3. Render Template to HTML
            // Note: We need to import these at top of file
            const html = renderToStaticMarkup(
                <InterventionPlanReport
                    plan={plan}
                    tree={tree}
                    installationName={plan.instalacao?.nome}
                    mapImage={mapImage}
                />
            );

            // 4. Prepare Map Data
            let mapData = null;
            if (tree && tree.latitude && tree.longitude) {
                mapData = {
                    containerId: 'report-minimap',
                    lat: tree.latitude,
                    lng: tree.longitude
                };
            }

            // 5. Send to Server for PDF Generation
            const baseUrl = getBaseUrl();
            if (!baseUrl && window.location.protocol === 'capacitor:') {
                throw new Error("Configuração ausente: A URL do servidor de relatórios não foi definida. Verifique o arquivo .env.");
            }
            const endpoint = `${baseUrl}/api/reports/generate-pdf-from-html`;
            console.log("Fetching PDF from:", endpoint);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ html, mapData, mapImage }),
            });

            if (!response.ok) {
                await this.handleResponseError(response, 'Failed to generate intervention plan report');
            }

            const blob = await response.blob();
            await this.validatePdf(blob);
            return blob;
        } catch (error) {
            console.error("Intervention Plan Report Error:", error);
            throw error;
        }
    },

    async generateTreeReport(treeId: string, mapImage?: string) {
        try {
            // 1. Fetch Tree Data
            const { data: tree, error: treeError } = await supabase
                .from('arvores')
                .select(`
                    *,
                    instalacao:instalacoes(nome)
                `)
                .eq('id', treeId)
                .single();

            if (treeError) throw new Error(`Erro ao buscar árvore: ${treeError.message}`);

            // 2. Fetch Photos
            const { data: photosData } = await supabase
                .from('tree_photos')
                .select('*')
                .eq('tree_id', treeId)
                .order('created_at', { ascending: false });

            let photos: any[] = [];
            if (photosData && photosData.length > 0) {
                photos = await Promise.all(
                    photosData.map(async (photo) => {
                        const { data } = await supabase.storage
                            .from('tree-photos')
                            .createSignedUrl(photo.storage_path, 3600);

                        return {
                            ...photo,
                            url: data?.signedUrl
                        };
                    })
                );
            }

            // 3. Render HTML
            const html = renderToStaticMarkup(
                <TreeReport
                    tree={tree}
                    photos={photos}
                    installationName={tree.instalacao?.nome || 'Instalação não identificada'}
                    mapImage={mapImage}
                />
            );

            // 4. Map Data
            let mapData = null;
            if (tree.latitude && tree.longitude) {
                mapData = {
                    containerId: 'report-minimap',
                    lat: tree.latitude,
                    lng: tree.longitude
                };
            }

            // 5. Generate PDF
            const baseUrl = getBaseUrl();
            const endpoint = `${baseUrl}/api/reports/generate-pdf-from-html`;
            console.log("Fetching PDF from:", endpoint);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, mapData, mapImage }),
            });

            if (!response.ok) {
                await this.handleResponseError(response, 'Failed to generate tree report');
            }

            const blob = await response.blob();
            await this.validatePdf(blob);
            return blob;
        } catch (error) {
            console.error("Tree Report Error:", error);
            throw error;
        }
    },

    async generateScheduleReport() {
        try {
            // 1. Fetch Plans
            const { data: plans, error: plansError } = await supabase
                .from('intervention_plans')
                .select(`
                    *,
                    instalacao:instalacoes(nome),
                    tree:arvores(especie, codigo)
                `)
                .neq('status', 'concluido') // Active plans
                .order('created_at', { ascending: true }); // By date

            if (plansError) throw new Error(`Erro ao buscar cronograma: ${plansError.message}`);

            // 2. Fetch Installation Name (from first plan or context)
            const installationName = plans[0]?.instalacao?.nome || 'Instalação';

            // 3. Render HTML
            const html = renderToStaticMarkup(
                <ScheduleReport
                    plans={plans}
                    installationName={installationName}
                />
            );

            // 4. Generate PDF (No map for schedule usually)
            const baseUrl = getBaseUrl();
            const endpoint = `${baseUrl}/api/reports/generate-pdf-from-html`;
            console.log("Fetching PDF from:", endpoint);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, mapData: null }),
            });

            if (!response.ok) {
                await this.handleResponseError(response, 'Failed to generate schedule report');
            }

            const blob = await response.blob();
            await this.validatePdf(blob);
            return blob;
        } catch (error) {
            console.error("Schedule Report Error:", error);
            throw error;
        }
    },

    async generateRiskInventoryReport(payload: any) {
        try {
            const { installation, trees: payloadTrees, stats, mapImage } = payload;
            const installationName = installation.nome || 'Instalação';

            // 1. Enrich Trees with Photos (Optimized)
            const trees = [...payloadTrees];
            const treeIds = trees.map((t: any) => t.id);

            if (treeIds.length > 0) {
                const { data: allPhotos } = await supabase
                    .from('tree_photos')
                    .select('*')
                    .in('tree_id', treeIds)
                    .order('created_at', { ascending: false });

                if (allPhotos && allPhotos.length > 0) {
                    const photoMap = new Map();
                    for (const photo of allPhotos) {
                        if (!photoMap.has(photo.tree_id)) {
                            photoMap.set(photo.tree_id, photo);
                        }
                    }

                    // For large inventories (e.g. > 50 trees), we MUST use small thumbnails
                    // to prevent Puppeteer timeouts and massive PDF sizes.

                    await Promise.all(trees.map(async (tree: any) => {
                        const photo = photoMap.get(tree.id);
                        if (photo) {
                            // Use transform if possible for 100x100 thumbnails
                            const { data } = await supabase.storage
                                .from('tree-photos')
                                .createSignedUrl(photo.storage_path, 3600, {
                                    transform: {
                                        width: 100,
                                        height: 100,
                                        resize: 'contain'
                                    }
                                });

                            if (data?.signedUrl) {
                                tree.photoUrl = data.signedUrl;
                                tree.foto_url = data.signedUrl;
                            }
                        }
                    }));
                }
            }

            // 2. Render HTML
            const html = renderToStaticMarkup(
                <RiskInventoryReport
                    installationName={installationName}
                    trees={trees}
                    stats={stats}
                    mapImage={mapImage}
                />
            );

            // 3. Prepare Map Data
            let mapData = null;
            const treesWithCoords = trees.filter((t: any) => t.latitude && t.longitude);

            if (treesWithCoords.length > 0) {
                const avgLat = treesWithCoords.reduce((sum: number, t: any) => sum + Number(t.latitude), 0) / treesWithCoords.length;
                const avgLng = treesWithCoords.reduce((sum: number, t: any) => sum + Number(t.longitude), 0) / treesWithCoords.length;

                mapData = {
                    containerId: 'report-map-container',
                    lat: avgLat,
                    lng: avgLng
                };
            }

            // 4. Generate PDF with extended timeout for large reports
            const baseUrl = getBaseUrl();
            const endpoint = `${baseUrl}/api/reports/generate-pdf-from-html`;
            console.log(`Generating Risk Inventory for ${trees.length} trees...`);
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, mapData, mapImage }),
            });

            if (!response.ok) {
                await this.handleResponseError(response, 'Failed to generate risk inventory report');
            }

            const blob = await response.blob();
            await this.validatePdf(blob);
            return blob;
        } catch (error) {
            console.error("Risk Inventory Report Error:", error);
            throw error;
        }
    }
};
