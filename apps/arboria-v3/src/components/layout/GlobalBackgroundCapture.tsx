import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { useReports } from '../../context/ReportContext';
import { useDownloads } from '../../context/DownloadContext';
import { useAuth } from '../../context/AuthContext';
import { usePlans } from '../../hooks/usePlans';
import { useTrees } from '../../hooks/useTrees';
import { ReportService } from '../../services/reportService';
import { downloadFile } from '../../utils/downloadUtils';
import { toast } from 'sonner';
import { platform } from '../../platform';

// Components for Capture
import { ReportMap } from '../features/reporting/ReportMap';
import { ReportGantt } from '../reports/shared/ReportGantt';
import { ReportGeneralGantt } from '../reports/shared/ReportGeneralGantt';

export const GlobalBackgroundCapture: React.FC = () => {
    const { queue, completeCapture } = useReports();
    const { addDownload, updateDownload } = useDownloads();
    const { activeInstallation } = useAuth();
    const { plans } = usePlans();
    const { data: trees = [] } = useTrees();

    const [currentRequest, setCurrentRequest] = useState<any>(null);
    const mapRef = useRef<any>(null);
    const ganttRef = useRef<HTMLDivElement>(null);
    const generalGanttRef = useRef<HTMLDivElement>(null);

    // Process queue one by one
    useEffect(() => {
        // ALWAYS process the queue, even if local capture is disabled
        // (Tauri uses this to manage the background generation of server-side reports)
        if (queue.length > 0 && !currentRequest) {
            processRequest(queue[0]);
        }
    }, [queue, currentRequest]);

    const processRequest = async (request: any) => {
        setCurrentRequest(request);
        const { id, type, selectedId, data: requestData } = request;
        let downloadId = '';
        let filename = 'Relatorio.pdf';

        try {
            console.log(`[BackgroundCapture] Starting: ${type} (${id})`);

            // 1. Prepare Filename
            if (type === 'intervention-plan') {
                const plan = (plans || []).find((p: any) => p.id === selectedId);
                filename = `Plano_${plan?.plan_id || 'Intervencao'}.pdf`;
            } else if (type === 'tree-individual') {
                const tree = (trees || []).find((t: any) => t.id === selectedId);
                filename = `Ficha_${tree?.codigo || 'Arvore'}.pdf`;
            } else if (type === 'schedule') {
                filename = `Cronograma.pdf`;
            } else if (type === 'risk-inventory') {
                filename = `Inventario_Risco.pdf`;
            } else if (type === 'execution-report') {
                filename = `Relatorio_Execucao_${selectedId?.substring(0, 8)}.pdf`;
            }

            // 2. Add to Download Hub
            downloadId = addDownload({
                filename,
                type: 'pdf'
            });

            // 3. Wait for components to render (Hidden)
            await new Promise(r => setTimeout(r, 1500));

            const images: { mapImage?: string; ganttImage?: string } = {};

            // 4. Capture Map (if needed)
            const needsMap = ['intervention-plan', 'tree-individual', 'risk-inventory', 'execution-report'].includes(type);
            const canCaptureLocally = platform.supportsOfflineCapture || platform.platformName === 'tauri';

            if (needsMap && canCaptureLocally) {
                let attempts = 0;
                while (!mapRef.current && attempts < 20) {
                    await new Promise(r => setTimeout(r, 500));
                    attempts++;
                }

                if (mapRef.current) {
                    const map = mapRef.current;
                    if (!map.loaded()) {
                        await Promise.race([
                            new Promise(resolve => map.once('idle', resolve)),
                            new Promise(resolve => setTimeout(resolve, 8000))
                        ]);
                    }
                    await new Promise(r => setTimeout(r, 200));
                    images.mapImage = map.getCanvas().toDataURL('image/png');
                }
            }

            // 5. Capture Gantt (if needed)
            if (canCaptureLocally) {
                if (type === 'intervention-plan' && ganttRef.current) {
                    const canvas = await html2canvas(ganttRef.current, { scale: 3, logging: false, useCORS: true, backgroundColor: '#ffffff' });
                    images.ganttImage = canvas.toDataURL('image/png');
                } else if (type === 'schedule' && generalGanttRef.current) {
                    const canvas = await html2canvas(generalGanttRef.current, { scale: 3, logging: false, useCORS: true, backgroundColor: '#ffffff' });
                    images.ganttImage = canvas.toDataURL('image/png');
                }
            }

            updateDownload(downloadId, { progress: 30 });

            // 6. Generate PDF
            let reportResult: Blob;
            switch (type) {
                case 'intervention-plan':
                    reportResult = await ReportService.generateInterventionPlanReport(selectedId, images);
                    break;
                case 'tree-individual':
                    reportResult = await ReportService.generateTreeReport(selectedId, images);
                    break;
                case 'schedule':
                    reportResult = await ReportService.generateScheduleReport(images);
                    break;
                case 'execution-report':
                    reportResult = await ReportService.generateExecutionReportById(selectedId, images);
                    break;
                case 'risk-inventory':
                default:
                    // For Risk Inventory, payload preparation is needed similar to Reports.tsx
                    const stats = {
                        totalTrees: requestData.length,
                        highRiskCount: requestData.filter((t: any) => t.risklevel === 'Alto').length,
                        totalSpecies: new Set(requestData.map((t: any) => t.especie)).size,
                        avgDap: requestData.reduce((acc: number, t: any) => acc + (t.dap || 0), 0) / (requestData.length || 1),
                        avgHeight: requestData.reduce((acc: number, t: any) => acc + (t.altura || 0), 0) / (requestData.length || 1)
                    };
                    const payload = {
                        installation: activeInstallation,
                        trees: requestData,
                        stats: stats,
                        mapImage: images.mapImage
                    };
                    reportResult = await ReportService.generateRiskInventoryReport(payload);
                    break;
            }

            updateDownload(downloadId, { progress: 80 });

            // 7. Save File
            const result = await downloadFile(reportResult, filename);

            updateDownload(downloadId, {
                status: 'success',
                progress: 100,
                path: result.path
            });

            toast.success(`Relatório ${filename} gerado com sucesso!`);

        } catch (e: any) {
            console.error('[BackgroundCapture] Error:', e);
            toast.error(`Erro ao gerar relatório ${filename}: ${e.message}`);
            if (downloadId) {
                updateDownload(downloadId, { status: 'error', error: e.message });
            }
        } finally {
            completeCapture(id);
            setCurrentRequest(null);
        }
    };

    if (!currentRequest) return null;

    // We render capture components if we support offline capture (Android)
    // OR if we are on Tauri (where we need map snapshots for the local server)
    const shouldRenderCapture = platform.supportsOfflineCapture || platform.platformName === 'tauri';
    if (!shouldRenderCapture) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: -3000,
            right: -3000,
            width: '1200px', // Increased from 1000px for better PDF resolution
            opacity: 0.05,
            pointerEvents: 'none',
            zIndex: -100
        }}>
            {/* Map Capture */}
            {['intervention-plan', 'tree-individual', 'risk-inventory', 'execution-report'].includes(currentRequest.type) && (
                <div style={{ width: 800, height: 600 }}>
                    <ReportMap
                        trees={
                            currentRequest.type === 'tree-individual' && currentRequest.data ? [currentRequest.data] :
                                currentRequest.type === 'intervention-plan' && currentRequest.data?.tree ? [currentRequest.data.tree] :
                                    currentRequest.type === 'execution-report' && currentRequest.data?.tree ? [currentRequest.data.tree] :
                                        (currentRequest.data || [])
                        }
                        onLoad={(map: any) => { mapRef.current = map; }}
                    />
                </div>
            )}

            {/* Gantt Capture (Individual) */}
            {currentRequest.type === 'intervention-plan' && currentRequest.data && (
                <div ref={ganttRef} style={{ width: 800, backgroundColor: 'white', padding: 20 }}>
                    <ReportGantt plan={currentRequest.data} bufferDays={5} />
                </div>
            )}

            {/* Gantt Capture (General/Schedule) */}
            {currentRequest.type === 'schedule' && (
                <div ref={generalGanttRef} style={{ width: 1100, backgroundColor: 'white', padding: 25 }}>
                    <ReportGeneralGantt
                        plans={currentRequest.data || plans || []}
                        bufferDays={3}
                        variant={platform.platformName === 'tauri' ? 'tauri' : 'default'}
                    />
                </div>
            )}
        </div>
    );
};
