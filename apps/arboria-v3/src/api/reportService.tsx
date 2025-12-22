// Re-trigger build
import { supabase } from '../lib/supabase';
import { renderToStaticMarkup } from 'react-dom/server';
import { InterventionPlanReport } from '../components/reports/templates/InterventionPlanReport';
import { TreeReport } from '../components/reports/templates/TreeReport';
import { ScheduleReport } from '../components/reports/templates/ScheduleReport';
import { RiskInventoryReport } from '../components/reports/templates/RiskInventoryReport';

export const ReportService = {
    async generateReport(data: any) {
        try {
            console.log("Fetching PDF from: /api/reports/generate-report");
            const response = await fetch('/api/reports/generate-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Failed to generate PDF');
            }

            // Return Blob for download
            return await response.blob();
        } catch (error) {
            console.error("Report Service Error:", error);
            throw error;
        }
    },

    async generateInterventionPlanReport(planId: string) {
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
            console.log("Fetching PDF from: /api/reports/generate-pdf-from-html");
            const response = await fetch('/api/reports/generate-pdf-from-html', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ html, mapData }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Failed to generate intervention plan report');
            }

            return await response.blob();
        } catch (error) {
            console.error("Intervention Plan Report Error:", error);
            throw error;
        }
    },

    async generateTreeReport(treeId: string) {
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
            console.log("Fetching PDF from: /api/reports/generate-pdf-from-html");
            const response = await fetch('/api/reports/generate-pdf-from-html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, mapData }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Failed to generate tree report');
            }

            return await response.blob();
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
            console.log("Fetching PDF from: /api/reports/generate-pdf-from-html");
            const response = await fetch('/api/reports/generate-pdf-from-html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, mapData: null }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Failed to generate schedule report');
            }

            return await response.blob();
        } catch (error) {
            console.error("Schedule Report Error:", error);
            throw error;
        }
    },

    async generateRiskInventoryReport(payload: any) {
        try {
            const { installation, trees: payloadTrees, stats } = payload;
            const installationName = installation.nome || 'Instalação';

            // 1. Enrich Trees with Photos
            // We need to fetch photos because the basic tree list doesn't have them
            const trees = [...payloadTrees];
            const treeIds = trees.map((t: any) => t.id);

            if (treeIds.length > 0) {
                // Fetch all photos for these trees
                const { data: allPhotos } = await supabase
                    .from('tree_photos')
                    .select('*')
                    .in('tree_id', treeIds)
                    .order('created_at', { ascending: false });

                if (allPhotos && allPhotos.length > 0) {
                    // Create map of tree_id -> photo
                    const photoMap = new Map();

                    // Since it's ordered by created_at desc, the first one seen is the latest
                    for (const photo of allPhotos) {
                        if (!photoMap.has(photo.tree_id)) {
                            photoMap.set(photo.tree_id, photo);
                        }
                    }

                    // Generate signed URLs in parallel
                    await Promise.all(trees.map(async (tree: any) => {
                        const photo = photoMap.get(tree.id);
                        if (photo) {
                            const { data } = await supabase.storage
                                .from('tree-photos')
                                .createSignedUrl(photo.storage_path, 3600);

                            if (data?.signedUrl) {
                                tree.photoUrl = data.signedUrl;
                                tree.foto_url = data.signedUrl; // Legacy support
                            }
                        }
                    }));
                }
            }

            // 1. Render HTML
            const html = renderToStaticMarkup(
                <RiskInventoryReport
                    installationName={installationName}
                    trees={trees}
                    stats={stats}
                />
            );

            // 2. Prepare Map Data
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

            // 3. Generate PDF
            console.log("Fetching PDF from: /api/reports/generate-pdf-from-html");
            const response = await fetch('/api/reports/generate-pdf-from-html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, mapData }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.details || 'Failed to generate risk inventory report');
            }

            return await response.blob();
        } catch (error) {
            console.error("Risk Inventory Report Error:", error);
            throw error;
        }
    }
};
