import { ReportHeader } from '../shared/ReportHeader';

const RISK_LABELS = [
    "1. Galhos Mortos > 5cm", "2. Rachaduras/Fendas", "3. Sinais de Apodrecimento",
    "4. Casca Inclusa (União em V)", "5. Galhos Cruzados", "6. Copa Assimétrica",
    "7. Inclinação Anormal", "8. Próxima a Vias Públicas", "9. Risco de Queda sobre Alvos",
    "10. Interferência em Redes", "11. Espécie com Histórico de Falhas", "12. Poda Drástica/Brotação",
    "13. Calçadas Rachadas", "14. Perda de Raízes", "15. Compactação/Asfixia", "16. Apodrecimento Raízes"
];

// type Tree import removed as it might be in a different path, using any for now to unblock
// import type { Tree } from '../../../../types/tree';

interface Stats {
    totalTrees: number;
    highRiskCount: number;
    totalSpecies: number;
    avgDap: number;
    avgHeight: number;
}

interface RiskInventoryReportProps {
    installationName: string;
    trees: any[]; // Using any to be safe with varied tree shapes, but ideally Tree[]
    stats: Stats;
    mapImage?: string;
}

export function RiskInventoryReport({ installationName, trees, stats, mapImage }: RiskInventoryReportProps) {
    return (
        <div className="risk-inventory-report" style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: '10pt',
            lineHeight: 1.3,
            color: '#111'
        }}>
            <style>{`
                @page { size: A4; margin: 10mm; }
                @media print {
                    body { background: white; }
                    .page-break { page-break-before: always; }
                    .avoid-break { break-inside: avoid; }
                }
            `}</style>

            <ReportHeader
                title="Inventário de Risco"
                subtitle={`Levantamento Geral - ${new Date().toLocaleDateString('pt-BR')}`}
                installationName={installationName}
            />

            {/* Executive Summary */}
            <div className="mb-8">
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', borderLeft: '4px solid #4caf50', paddingLeft: '10px', marginBottom: '15px' }}>
                    Resumo Executivo
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {[
                        { label: 'Total Árvores', value: stats.totalTrees, color: '#e8f5e9', text: '#2e7d32' },
                        { label: 'Alto Risco', value: stats.highRiskCount, color: '#ffebee', text: '#c62828' },
                        { label: 'Espécies', value: stats.totalSpecies, color: '#e3f2fd', text: '#1565c0' },
                        { label: 'DAP Médio', value: `${stats.avgDap.toFixed(1)} cm`, color: '#f5f5f5', text: '#616161' },
                        { label: 'Altura Média', value: `${stats.avgHeight.toFixed(1)} m`, color: '#f5f5f5', text: '#616161' }
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: item.color,
                            padding: '10px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: `1px solid ${item.color.replace('e', 'd')}` // slightly darker border check
                        }}>
                            <div style={{ fontSize: '14pt', fontWeight: 'bold', color: item.text }}>{item.value}</div>
                            <div style={{ fontSize: '8pt', textTransform: 'uppercase', color: item.text, marginTop: '4px' }}>{item.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map Placeholder - The map is injected by the PDF server script via mapData */}
            <div style={{ marginBottom: '20px', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', borderLeft: '4px solid #4caf50', paddingLeft: '10px', marginBottom: '15px' }}>
                    Mapa de Localização
                </h3>
                <div id="report-map-container" style={{
                    width: '100%',
                    height: '400px',
                    background: '#f0f0f0',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {mapImage ? (
                        <img
                            src={mapImage}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            alt="Mapa de Localização"
                        />
                    ) : (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#999',
                            fontSize: '10pt'
                        }}>
                            Renderizando mapa...
                        </div>
                    )}
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '15px',
                    marginTop: '5px',
                    fontSize: '8pt'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></span> Alto
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308' }}></span> Médio
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }}></span> Baixo
                    </div>
                </div>
            </div>

            <div className="page-break"></div>

            {/* Detailed Table */}
            <div>
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', borderLeft: '4px solid #4caf50', paddingLeft: '10px', marginBottom: '15px', paddingTop: '20px' }}>
                    Detalhamento do Inventário
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '8px', textAlign: 'left', width: '60px' }}>Foto</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>ID / Espécie</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Métricas</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Risco</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Fatores</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trees.map((tree, index) => (
                            <tr key={tree.id} style={{
                                borderBottom: '1px solid #eee',
                                background: index % 2 === 0 ? 'white' : '#fafafa',
                                breakInside: 'avoid'
                            }}>
                                <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                    {tree.foto_url || tree.photoUrl ? (
                                        <img
                                            src={tree.foto_url || tree.photoUrl}
                                            alt=""
                                            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                    ) : (
                                        <div style={{ width: '48px', height: '48px', background: '#eee', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#999' }}>S/ Foto</div>
                                    )}
                                </td>
                                <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                    <div style={{ fontWeight: 'bold' }}>#{tree.codigo || tree.id.slice(0, 8)}</div>
                                    <div style={{ fontStyle: 'italic', color: '#666' }}>{tree.especie || 'N/I'}</div>
                                </td>
                                <td style={{ padding: '8px', verticalAlign: 'top', fontSize: '8pt', color: '#666' }}>
                                    <div><strong>DAP:</strong> {tree.dap} cm</div>
                                    <div><strong>Alt:</strong> {tree.altura} m</div>
                                </td>
                                <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                    <span style={{
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        fontSize: '8pt',
                                        fontWeight: 'bold',
                                        background: tree.risco === 'Alto' ? '#ffebee' : tree.risco === 'Médio' ? '#fffde7' : '#e8f5e9',
                                        color: tree.risco === 'Alto' ? '#c62828' : tree.risco === 'Médio' ? '#fbc02d' : '#2e7d32'
                                    }}>
                                        {tree.risco || 'N/A'}
                                    </span>
                                </td>
                                <td style={{ padding: '8px', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {(tree.risk_factors && Array.isArray(tree.risk_factors)) ? tree.risk_factors.map((f: string | number, i: number) => {
                                            const isRiskPresent = String(f) === '1';
                                            if (!isRiskPresent) return null;
                                            const label = RISK_LABELS[i] || `Risco ${i + 1}`;
                                            return (
                                                <span key={i} style={{ padding: '1px 4px', background: '#eee', borderRadius: '2px', fontSize: '7pt' }}>{label}</span>
                                            );
                                        }) : <span style={{ color: '#ccc', fontStyle: 'italic' }}>-</span>}
                                    </div>
                                </td>
                            </tr>
                        ))}
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
                ArborIA - Inventário de Risco - Gerado em {new Date().toLocaleDateString('pt-BR')}
            </div>
        </div>
    );
}
