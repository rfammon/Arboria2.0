
import { pdf } from '@react-pdf/renderer';
import { PDFReport } from '../components/features/reporting/PDFReport';
import { platform } from '../platform';

// ... existing imports ...
import { supabase } from '../lib/supabase';
import { renderToStaticMarkup } from 'react-dom/server';

import { InterventionPlanReport } from '../components/reports/templates/InterventionPlanReport';
import { TreeReport } from '../components/reports/templates/TreeReport';
import { ScheduleReport } from '../components/reports/templates/ScheduleReport';
import { RiskInventoryReport } from '../components/reports/templates/RiskInventoryReport';
import { ExecutionReportTemplate } from '../components/reports/templates/ExecutionReportTemplate';
import { InterventionPlanPDF } from '../components/features/reporting/InterventionPlanPDF';
import { TreePDF } from '../components/features/reporting/TreePDF';
import { SchedulePDF } from '../components/features/reporting/SchedulePDF';
import { ExecutionReportPDF } from '../components/features/reporting/ExecutionReportPDF';

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
    if (platform.platformName === 'tauri') {
        return 'http://127.0.0.1:3001';
    }

    // On Capacitor, we must NOT use relative URLs as they fetch index.html
    const isCapacitor = platform.isNative;
    if (isCapacitor) {
        // For Android Emulator (10.0.2.2) or real device (needs actual IP or deployed server)
        // If you are testing on real device, you MUST use the Render URL or your PC's IP
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

    async generatePdfLocal(element: React.ReactElement): Promise<Blob> {
        try {
            return await pdf(element as any).toBlob();
        } catch (error) {
            console.error("Local PDF Generation Error:", error);
            throw new Error("Erro ao gerar PDF localmente.");
        }
    },

    async generateReport(data: any): Promise<Blob> {
        try {
            const baseUrl = getBaseUrl();
            if (!baseUrl && platform.isNative) {
                // For generic report generation on mobile, we might need a fallback or ensure all paths use specific methods
                // But this method seems to be a generic entry point.
                // Ideally we should route to specific local generators if possible.
                // For now, let's keep the existing logic but check for config.
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

    async generatePdfFromHtml(data: { html: string, mapData?: any, mapImage?: string }): Promise<Blob> {
        try {
            const baseUrl = getBaseUrl();
            if (!baseUrl && platform.isNative) {
                // On mobile, if this is called directly, we might be in trouble if we don't have a local alternative for this specific HTML.
                // But generateRiskInventoryReport calls this.
                throw new Error("Configuração ausente: A URL do servidor de relatórios não foi definida.");
            }
            const endpoint = `${baseUrl}/api/reports/generate-pdf-from-html`;

            // Wrap in full HTML document to ensure styles are applied
            const fullHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#15803d',
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Roboto', sans-serif;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        @media print {
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                visibility: visible !important;
            }
            .no-print {
                display: none !important;
            }
        }
    </style>
</head>
<body class="bg-white p-8">
    ${data.html}
</body>
</html>
            `;

            // Use fullHtml instead of fragment
            const payload = { ...data, html: fullHtml };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                await this.handleResponseError(response, 'Failed to generate PDF from HTML');
            }

            const blob = await response.blob();
            await this.validatePdf(blob);
            return blob;
        } catch (error: any) {
            console.error("PDF from HTML Error:", error);
            throw error;
        }
    },



    async generateInterventionPlanReport(planId: string, extraImages: { mapImage?: string, ganttImage?: string } = {}): Promise<Blob> {
        try {
            console.log(`[ReportService] Generating Intervention Plan Report: ${planId}`);

            // 1. Fetch Plan Details
            const { data: plan, error } = await supabase
                .from('intervention_plans')
                .select(`
                    *,
                    instalacao:instalacoes(nome),
                    tree:arvores(*)
                `)
                .eq('id', planId)
                .single();

            if (error) throw new Error(`Falha ao buscar plano: ${error.message}`);
            if (!plan) throw new Error('Plano não encontrado.');

            const tree = plan.tree;

            // 2. Fetch and Sign Photos for the Tree
            if (tree?.id) {
                const { data: photosData } = await supabase
                    .from('tree_photos')
                    .select('*')
                    .eq('tree_id', tree.id)
                    .order('created_at', { ascending: false });

                if (photosData && photosData.length > 0) {
                    const signedPhotos = await Promise.all(
                        photosData.map(async (photo) => {
                            const { data } = await supabase.storage
                                .from('tree-photos') // Correct bucket
                                .createSignedUrl(photo.storage_path, 3600);
                            return {
                                ...photo,
                                url: data?.signedUrl
                            };
                        })
                    );
                    // Attach to tree object as expected by InterventionPlanPDF and InterventionPlanReport 
                    tree.arvore_fotos = signedPhotos;
                }
            }

            const { mapImage, ganttImage } = extraImages;

            // MOBILE/OFFLINE STRATEGY (React-PDF)
            if (platform.supportsOfflineCapture) {
                console.log('[ReportService] Generating Mobile Intervention Plan PDF locally...');
                return await this.generatePdfLocal(
                    <InterventionPlanPDF
                        plan={plan}
                        tree={tree}
                        installationName={plan.instalacao?.nome}
                        mapImage={mapImage}
                        ganttImage={ganttImage}
                    />
                );
            }

            // 3. Render Template to HTML
            const html = renderToStaticMarkup(
                <InterventionPlanReport
                    plan={plan}
                    tree={tree}
                    installationName={plan.instalacao?.nome}
                    mapImage={mapImage}
                />
            );

            // 4. Map Data for Server
            let mapData = null;
            if (!platform.supportsOfflineCapture && tree?.latitude && tree?.longitude) {
                mapData = {
                    containerId: 'report-minimap',
                    lat: tree.latitude,
                    lng: tree.longitude
                };
            }

            // 5. Generate PDF
            return this.generatePdfFromHtml({ html, mapData, mapImage });

        } catch (error) {
            console.error('Error generating Intervention Plan report:', error);
            throw error;
        }
    },

    async generateExecutionReport(data: { tree: any, execution: any, mapImage?: string }): Promise<Blob> {
        try {
            console.log(`[ReportService] Generating Execution Report for Task: ${data.execution.id}`);

            // MOBILE/OFFLINE STRATEGY (React-PDF)
            if (platform.supportsOfflineCapture) {
                console.log('[ReportService] Generating Mobile Execution PDF locally...');
                return await this.generatePdfLocal(
                    <ExecutionReportPDF
                        tree={data.tree}
                        execution={data.execution}
                        mapImage={data.mapImage}
                    />
                );
            }
            
            const html = renderToStaticMarkup(
                <ExecutionReportTemplate
                    tree={data.tree}
                    execution={data.execution}
                    mapImage={data.mapImage}
                />
            );

            return this.generatePdfFromHtml({ html, mapImage: data.mapImage });
        } catch (error) {
            console.error('Error generating Execution report:', error);
            throw error;
        }
    },

    async generateExecutionReportById(taskId: string, extraImages: { mapImage?: string } = {}): Promise<Blob> {
        try {
            console.log(`[ReportService] Fetching data for Execution Report: ${taskId}`);

            // 1. Fetch Task Details
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select(`
                    *,
                    tree:arvores(*, tree_photos(*)),
                    evidence:task_evidence(*)
                `)
                .eq('id', taskId)
                .single();

            if (taskError) throw new Error(`Falha ao buscar tarefa: ${taskError.message}`);
            if (!task) throw new Error('Tarefa não encontrada.');

            // 2. Prepare Photos (Categorized)
            const photos = {
                antes: [] as string[],
                execucao: [] as string[],
                depois: [] as string[]
            };

            // Inventory photos -> ANTES
            if (task.tree?.tree_photos) {
                for (const photo of task.tree.tree_photos) {
                    const { data } = await supabase.storage
                        .from('tree-photos')
                        .createSignedUrl(photo.storage_path, 3600);
                    if (data?.signedUrl) photos.antes.push(data.signedUrl);
                }
            }

            // Evidence photos -> Stage grouped
            if (task.evidence) {
                for (const ev of task.evidence) {
                    if (!ev.photo_url) continue;
                    const stage = ev.stage as string;
                    if (stage === 'before') photos.antes.push(ev.photo_url);
                    else if (['during_1', 'during_2', 'during'].includes(stage)) photos.execucao.push(ev.photo_url);
                    else if (['after', 'completion', 'completed'].includes(stage)) photos.depois.push(ev.photo_url);
                }
            }

            // 3. Map Data
            const rawTree = task.tree || (task as any).arvores;
            const tree = Array.isArray(rawTree) ? rawTree[0] : rawTree;

            const treeData = {
                codigo: tree?.codigo || 'ARB-N/A',
                especie: tree?.especie || 'Espécie não identificada',
                localizacao: [tree?.local, tree?.bairro].filter(Boolean).join(', ') || 'Localização não informada',
                nivelRisco: tree?.risklevel || 'Baixo',
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
                equipe: (task as any).assignee_name || "Equipe ArborIA",
                fotos: photos
            };

            return this.generateExecutionReport({
                tree: treeData,
                execution: executionData,
                mapImage: extraImages.mapImage
            });

        } catch (error) {
            console.error('Error generating Execution report by ID:', error);
            throw error;
        }
    },

    async generateTreeReport(treeId: string, extraImages: { mapImage?: string } = {}) {
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
                            .from('tree-photos') // Correct bucket name
                            .createSignedUrl(photo.storage_path, 3600); // 1 hour expiry

                        return {
                            ...photo,
                            url: data?.signedUrl
                        };
                    })
                );
            }

            const { mapImage } = extraImages;

            // MOBILE/OFFLINE STRATEGY (React-PDF)
            if (platform.supportsOfflineCapture) {
                console.log('[ReportService] Generating Mobile Tree PDF locally...');
                return await this.generatePdfLocal(
                    <TreePDF
                        tree={tree}
                        photos={photos}
                        installationName={tree.instalacao?.nome || 'Instalação não identificada'}
                        mapImage={mapImage}
                    />
                );
            }

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
            if (!platform.supportsOfflineCapture && tree.latitude && tree.longitude) {
                mapData = {
                    containerId: 'report-minimap',
                    lat: tree.latitude,
                    lng: tree.longitude
                };
            }

            // 5. Generate PDF
            return this.generatePdfFromHtml({ html, mapData, mapImage });

        } catch (error) {
            console.error("Tree Report Error:", error);
            throw error;
        }
    },

    async generateScheduleReport(extraImages: { ganttImage?: string } = {}): Promise<Blob> {
        try {
            console.log('[ReportService] Generating Schedule Report...');

            // 1. Fetch Plans
            const { data: plans, error: plansError } = await supabase
                .from('intervention_plans')
                .select(`
                    *,
                    instalacao:instalacoes(nome),
                    tree:arvores(especie, codigo)
                `)
                .neq('status', 'CANCELLED') // Hide only cancelled
                .order('created_at', { ascending: true }); // By date

            if (plansError) throw new Error(`Erro ao buscar cronograma: ${plansError.message}`);

            // 2. Fetch Installation Name (from first plan or context)
            const installationName = plans[0]?.instalacao?.nome || 'Instalação';
            const { ganttImage } = extraImages;

            // MOBILE/OFFLINE STRATEGY (React-PDF)
            if (platform.supportsOfflineCapture) {
                console.log('[ReportService] Generating Mobile Schedule PDF locally...');
                return await this.generatePdfLocal(
                    <SchedulePDF
                        plans={plans}
                        installationName={installationName}
                        ganttImage={ganttImage}
                    />
                );
            }

            // 3. Render HTML
            const html = renderToStaticMarkup(
                <ScheduleReport
                    plans={plans}
                    installationName={installationName}
                />
            );

            // 4. Generate PDF (No map for schedule usually)
            return this.generatePdfFromHtml({ html, mapData: null });
        } catch (error) {
            console.error("Schedule Report Error:", error);
            throw error;
        }
    },

    async generateRiskInventoryReport(payload: any) {
        try {
            const { installation, trees: payloadTrees, stats, mapImage, chartsImages } = payload;
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
                    await Promise.all(trees.map(async (tree: any) => {
                        const photo = photoMap.get(tree.id);
                        if (photo) {
                            // Use transform if possible for 100x100 thumbnails
                            const { data } = await supabase.storage
                                .from('tree-photos') // Correct bucket
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

            // MOBILE/OFFLINE STRATEGY (React-PDF)
            if (platform.supportsOfflineCapture) {
                console.log('[ReportService] Generating Mobile PDF locally...');
                return await this.generatePdfLocal(
                    <PDFReport
                        installationName={installationName}
                        trees={trees}
                        stats={stats}
                        mapImage={mapImage}
                        chartsImages={chartsImages}
                    />
                );
            }

            // DESKTOP/WEB STRATEGY (Puppeteer Service)
            // Specialized endpoint for Risk Inventory
            if (platform.platformName === 'tauri' || platform.platformName === 'web') {
                try {
                    console.log(`Generating Risk Inventory for ${trees.length} trees (Specialized Server endpoint)...`);
                    return await this.generateReport({
                        installation,
                        stats,
                        trees
                    });
                } catch (e) {
                    console.warn("Specialized report failed, falling back to HTML-to-PDF:", e);
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

            // 4. Generate PDF
            console.log(`Generating Risk Inventory for ${trees.length} trees (Server-side)...`);
            return this.generatePdfFromHtml({ html, mapData, mapImage });

        } catch (error) {
            console.error("Risk Inventory Report Error:", error);
            throw error;
        }
    }
};
