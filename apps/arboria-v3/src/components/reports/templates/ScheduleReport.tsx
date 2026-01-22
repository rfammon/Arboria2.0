
import { ReportHeader } from '../shared/ReportHeader';
import { ReportGeneralGantt } from '../shared/ReportGeneralGantt';

interface ScheduleReportProps {
    plans: any[];
    installationName: string;
    period?: { start: string; end: string };
}

const STATUS_MAP: Record<string, string> = {
    'draft': 'Rascunho',
    'pending': 'Pendente',
    'approved': 'Aprovado',
    'in_progress': 'Em Andamento',
    'completed': 'Concluído',
    'concluido': 'Concluído',
    'cancelled': 'Cancelado',
    'rejected': 'Rejeitado'
};

export function ScheduleReport({ plans, installationName, period }: ScheduleReportProps) {
    // Sort plans by date
    const sortedPlans = [...plans].sort((a, b) => {
        const dateA = new Date(a.schedule?.start || a.schedule?.startDate || 0).getTime();
        const dateB = new Date(b.schedule?.start || b.schedule?.startDate || 0).getTime();
        return dateA - dateB;
    });

    return (
        <div className="schedule-report" style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: '10pt',
            lineHeight: 1.3,
            color: '#111'
        }}>
            <style>{`
                @page { size: A4 landscape; margin: 10mm; }
                @media print {
                    body { background: white; }
                    .page-break { page-break-before: always; }
                }
            `}</style>

            <ReportHeader
                title="Cronograma de Intervenções"
                subtitle={`Total de ${plans.length} intervenções programadas`}
                installationName={installationName}
            />

            {period && (
                <div style={{
                    background: '#f5f5f5',
                    padding: '10px 15px',
                    borderRadius: '4px',
                    marginBottom: '1.5rem',
                    fontSize: '9pt',
                    borderLeft: '4px solid #4caf50'
                }}>
                    <strong>Período Visualizado:</strong> {new Date(period.start).toLocaleDateString('pt-BR')} até {new Date(period.end).toLocaleDateString('pt-BR')}
                </div>
            )}

            {/* General Gantt Chart */}
            <div className="mb-8 avoid-break">
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px', color: '#2e7d32' }}>Visão Geral do Cronograma</h3>
                <ReportGeneralGantt plans={sortedPlans} variant="tauri" />
            </div>

            {/* Detailed Table */}
            <div className="report-table-section">
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '10px', color: '#2e7d32' }}>Detalhamento das Intervenções</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '8px', textAlign: 'left', width: '40px' }}>#</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Data Início</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Data Fim</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>ID Plano</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Tipo</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Árvore</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedPlans.map((plan, index) => {
                            const start = plan.schedule?.start || plan.schedule?.startDate;
                            const end = plan.schedule?.end || plan.schedule?.endDate;
                            return (
                                <tr key={plan.id} style={{ borderBottom: '1px solid #eee', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{index + 1}</td>
                                    <td style={{ padding: '8px' }}>{start ? new Date(start).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td style={{ padding: '8px' }}>{end ? new Date(end).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td style={{ padding: '8px', fontFamily: 'monospace' }}>{plan.plan_id || plan.id.slice(0, 8)}</td>
                                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{plan.intervention_type}</td>
                                    <td style={{ padding: '8px' }}>{plan.tree?.especie || 'N/A'}</td>
                                    <td style={{ padding: '8px' }}>
                                        <span style={{
                                            padding: '2px 6px',
                                            borderRadius: '3px',
                                            fontSize: '8pt',
                                            background: ['concluido', 'completed', 'approved'].includes(plan.status?.toLowerCase()) ? '#e8f5e9' : '#fff3e0',
                                            color: ['concluido', 'completed', 'approved'].includes(plan.status?.toLowerCase()) ? '#2e7d32' : '#ef6c00'
                                        }}>
                                            {STATUS_MAP[plan.status?.toLowerCase()] || plan.status || 'Pendente'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '3rem',
                borderTop: '1px solid #eee',
                paddingTop: '1rem',
                textAlign: 'center',
                fontSize: '8pt',
                color: '#999'
            }}>
                ArborIA - Gestão de Cronograma - Gerado em {new Date().toLocaleDateString('pt-BR')}
            </div>
        </div>
    );
}
