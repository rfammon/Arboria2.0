
import type { InterventionPlan } from '../../../types/plan';
import { ReportHeader } from '../shared/ReportHeader';
import { ReportSection } from '../shared/ReportSection';
import { ReportGantt } from '../shared/ReportGantt';

interface InterventionPlanReportProps {
    plan: InterventionPlan;
    tree?: any; // Tree data with photo
    installationName?: string;
    mapImage?: string;
}

const INTERVENTION_ICONS: Record<string, string> = {
    'poda': '✂️',
    'supressao': '🪓',
    'transplante': '🌱',
    'tratamento': '💊',
    'monitoramento': '👁️'
};

const INTERVENTION_COLORS: Record<string, string> = {
    'poda': '#4caf50',
    'supressao': '#d32f2f',
    'transplante': '#ff9800',
    'tratamento': '#2196f3',
    'monitoramento': '#9c27b0'
};

const INTERVENTION_LABELS: Record<string, string> = {
    'poda': 'Poda',
    'supressao': 'Supressão',
    'transplante': 'Transplante',
    'tratamento': 'Tratamento Fitossanitário',
    'monitoramento': 'Monitoramento'
};

export function InterventionPlanReport({ plan, tree, installationName, mapImage }: InterventionPlanReportProps) {
    const icon = INTERVENTION_ICONS[plan.intervention_type] || '📌';
    const color = INTERVENTION_COLORS[plan.intervention_type] || '#666';
    const label = INTERVENTION_LABELS[plan.intervention_type] || plan.intervention_type;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Não definida';
        const [y, m, d] = dateStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const startDate = plan.schedule?.start || plan.schedule?.startDate;
    const endDate = plan.schedule?.end || plan.schedule?.endDate;

    // Get tree photo URL
    const treePhotoUrl = tree?.arvore_fotos?.find((p: any) => p.is_cover)?.url || tree?.arvore_fotos?.[0]?.url;

    return (
        <div className="intervention-plan-report" style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: '10pt',
            lineHeight: 1.3,
            color: '#111'
        }}>
            <style>{`
                @page { size: A4; margin: 10mm 15mm; }
                @media print {
                    .report-wrapper { width: 100%; padding: 0; margin: 0; box-shadow: none; }
                    body { background: white; }
                }
            `}</style>

            <ReportHeader
                title="Plano de Intervenção"
                subtitle={label}
                reportId={plan.plan_id || plan.id}
                installationName={installationName}
            />

            {/* Plan Overview */}
            <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '4px',
                borderLeft: `5px solid ${color}`,
                marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>{icon}</span>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '14pt', textTransform: 'capitalize' }}>{label}</h3>
                        <div style={{ fontSize: '9pt', color: '#666', marginTop: '4px' }}>
                            {plan.plan_id || `ID: ${plan.id}`}
                        </div>
                    </div>
                </div>
                {plan.justification && (
                    <p style={{
                        margin: 0,
                        fontSize: '9pt',
                        color: '#555',
                        lineHeight: 1.5,
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #ddd'
                    }}>
                        <strong>Justificativa:</strong> {plan.justification}
                    </p>
                )}
            </div>

            {/* Tree Information & Photo Grid */}
            {tree && (
                <ReportSection title="Árvore" icon="🌳">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        {/* Tree Photo */}
                        <div>
                            {treePhotoUrl ? (
                                <img
                                    src={treePhotoUrl}
                                    alt="Foto da árvore"
                                    style={{
                                        width: '100%',
                                        height: '220px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        marginBottom: '10px'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '220px',
                                    background: '#f5f5f5',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999',
                                    fontSize: '9pt',
                                    marginBottom: '10px'
                                }}>
                                    Sem foto disponível
                                </div>
                            )}

                            {/* Minimap Container */}
                            <div style={{
                                width: '100%',
                                height: '180px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {mapImage ? (
                                    <img
                                        src={mapImage}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        alt="Localização"
                                    />
                                ) : (
                                    <div id="report-minimap" style={{ width: '100%', height: '100%' }}></div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '5px',
                                    right: '5px',
                                    background: 'rgba(255,255,255,0.8)',
                                    padding: '2px 5px',
                                    fontSize: '8pt',
                                    borderRadius: '2px'
                                }}>
                                    Localização
                                </div>
                            </div>
                        </div>

                        {/* Tree Data */}
                        <div>
                            <table style={{ width: '100%', fontSize: '9pt', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '6px 0', fontWeight: 600, color: '#555', width: '40%' }}>Espécie:</td>
                                        <td style={{ padding: '6px 0' }}>{tree.especie || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Código:</td>
                                        <td style={{ padding: '6px 0', fontFamily: 'monospace' }}>{tree.codigo || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>DAP:</td>
                                        <td style={{ padding: '6px 0' }}>{tree.dap ? `${tree.dap} cm` : 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Altura:</td>
                                        <td style={{ padding: '6px 0' }}>{tree.altura ? `${tree.altura} m` : 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Localização:</td>
                                        <td style={{ padding: '6px 0' }}>{tree.local || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Coordenadas:</td>
                                        <td style={{ padding: '6px 0', fontFamily: 'monospace', fontSize: '8pt' }}>
                                            {tree.latitude && tree.longitude
                                                ? `${tree.latitude.toFixed(6)}, ${tree.longitude.toFixed(6)}`
                                                : 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '6px 0', fontWeight: 600, color: '#555' }}>Nível de Risco:</td>
                                        <td style={{ padding: '6px 0' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '3px',
                                                fontSize: '8pt',
                                                fontWeight: 600,
                                                background: tree.risklevel === 'Alto' ? '#d32f2f' :
                                                    tree.risklevel === 'Médio' ? '#ff9800' : '#4caf50',
                                                color: 'white'
                                            }}>
                                                {tree.risklevel || 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </ReportSection>
            )}

            {/* Schedule & Gantt */}
            <ReportSection title="Cronograma" icon="📅">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '8pt', color: '#666', marginBottom: '4px' }}>Data de Início</div>
                        <div style={{ fontSize: '11pt', fontWeight: 600 }}>{formatDate(startDate)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '8pt', color: '#666', marginBottom: '4px' }}>Data de Término</div>
                        <div style={{ fontSize: '11pt', fontWeight: 600 }}>{formatDate(endDate)}</div>
                    </div>
                </div>
                <ReportGantt plan={plan} />
            </ReportSection>

            {/* Team Composition */}
            {plan.team_composition && (
                <ReportSection title="Composição da Equipe" icon="👥">
                    <div style={{
                        background: '#f5f5f5',
                        padding: '1rem',
                        borderRadius: '4px',
                        fontSize: '9pt'
                    }}>
                        {typeof plan.team_composition === 'object' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {Object.entries(plan.team_composition).map(([role, count]) => {
                                    const translatedRole = {
                                        'climber': 'Escalador',
                                        'climbers': 'Escaladores',
                                        'ground_worker': 'Auxiliar de Solo',
                                        'ground_workers': 'Auxiliares de Solo',
                                        'groundworker': 'Auxiliar de Solo',
                                        'groundworkers': 'Auxiliares de Solo',
                                        'operator': 'Operador de Máquinas',
                                        'operators': 'Operadores de Máquinas',
                                        'driver': 'Motorista',
                                        'drivers': 'Motoristas',
                                        'supervisor': 'Supervisor',
                                        'supervisors': 'Supervisores',
                                        'auxiliar': 'Auxiliar',
                                        'auxiliares': 'Auxiliares',
                                        'tecnico': 'Técnico',
                                        'eng': 'Engenheiro',
                                        'eng.': 'Engenheiro',
                                        'helpers': 'Auxiliares',
                                        'helper': 'Auxiliar',
                                        'chainsaw_operators': 'Operadores de Motosserra',
                                        'chainsaw_operator': 'Operador de Motosserra',
                                        'chainsaw operator': 'Operador de Motosserra',
                                        'chainsaw operators': 'Operadores de Motosserra'
                                    }[role.toLowerCase().trim()] || role;

                                    return (
                                        <div key={role} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{translatedRole}:</span>
                                            <span>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div>{plan.team_composition}</div>
                        )}
                    </div>
                </ReportSection>
            )}

            {/* Security Procedures (New Section) */}
            <ReportSection title="Procedimentos de Segurança" icon="🛡️">
                <div style={{
                    background: '#fff3e0',
                    padding: '1rem',
                    borderRadius: '4px',
                    border: '1px solid #ffe0b2'
                }}>
                    <div style={{ fontSize: '9pt', marginBottom: '0.5rem', fontWeight: 'bold' }}>Medidas Obrigatórias:</div>
                    <ul style={{
                        margin: 0,
                        paddingLeft: '1.5rem',
                        fontSize: '9pt',
                        lineHeight: 1.6
                    }}>
                        <li>Isolamento e sinalização da área de trabalho (cones, fitas).</li>
                        <li>Verificação prévia de condições climáticas e fitossanitárias.</li>
                        <li>Planejamento de rotas de fuga e zona de queda controlada.</li>
                        <li>Check-list de equipamentos e EPIs antes do início das atividades.</li>
                        <li>Comunicação constante entre escalador e equipe de solo.</li>
                        {(plan as any).security_procedures && (
                            <li style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>Específico: {(plan as any).security_procedures}</li>
                        )}
                    </ul>
                </div>
            </ReportSection>

            {/* EPIs */}
            {plan.epis && plan.epis.length > 0 && (
                <ReportSection title="Equipamentos de Proteção Individual (EPIs)" icon="🦺">
                    <div style={{
                        background: '#fff3e0',
                        padding: '1rem',
                        borderRadius: '4px',
                        border: '1px solid #ffe0b2'
                    }}>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.5rem',
                            fontSize: '9pt',
                            lineHeight: 1.8
                        }}>
                            {plan.epis.map((epi, idx) => (
                                <li key={idx}>{epi}</li>
                            ))}
                        </ul>
                    </div>
                </ReportSection>
            )}

            {/* Tools */}
            {plan.tools && plan.tools.length > 0 && (
                <ReportSection title="Ferramentas e Equipamentos" icon="🛠️">
                    <div style={{
                        background: '#f5f5f5',
                        padding: '1rem',
                        borderRadius: '4px'
                    }}>
                        <ul style={{
                            margin: 0,
                            paddingLeft: '1.5rem',
                            fontSize: '9pt',
                            lineHeight: 1.8,
                            columns: 2
                        }}>
                            {plan.tools.map((tool, idx) => (
                                <li key={idx}>{tool}</li>
                            ))}
                        </ul>
                    </div>
                </ReportSection>
            )}

            {/* Techniques */}
            {plan.techniques && plan.techniques.length > 0 && (
                <ReportSection title="Técnicas a Serem Aplicadas" icon="🔧">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {plan.techniques.map((technique, idx) => (
                            <span
                                key={idx}
                                style={{
                                    display: 'inline-block',
                                    padding: '0.5rem 1rem',
                                    background: color,
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '9pt',
                                    fontWeight: 600
                                }}
                            >
                                {technique}
                            </span>
                        ))}
                    </div>
                </ReportSection>
            )}

            {/* Responsible */}
            <ReportSection title="Responsabilidade" icon="✍️">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '8pt', color: '#666', marginBottom: '4px' }}>Responsável pela Execução</div>
                        <div style={{ fontSize: '10pt', fontWeight: 600 }}>{plan.responsible || 'Não definido'}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '8pt', color: '#666', marginBottom: '4px' }}>Cargo/Função</div>
                        <div style={{ fontSize: '10pt', fontWeight: 600 }}>{plan.responsible_title || 'Não definido'}</div>
                    </div>
                </div>
            </ReportSection>

            {/* Footer */}
            <div style={{
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: '1px solid #eee',
                fontSize: '8pt',
                color: '#999',
                textAlign: 'right'
            }}>
                ArborIA - Sistema de Gestão Arbórea
            </div>
        </div>
    );
}
