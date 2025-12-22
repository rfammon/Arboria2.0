
import { ReportHeader } from '../shared/ReportHeader';
import { ReportSection } from '../shared/ReportSection';

interface TreeReportProps {
    tree: any;
    photos: any[];
    installationName?: string;
}

const RISK_MAP: Record<string, string> = {
    'alto': 'Alto',
    'high': 'Alto',
    'medio': 'Médio',
    'médio': 'Médio',
    'medium': 'Médio',
    'baixo': 'Baixo',
    'low': 'Baixo'
};

export function TreeReport({ tree, photos, installationName }: TreeReportProps) {
    const mainPhotoUrl = photos.find(p => p.is_cover)?.url || photos[0]?.url;

    return (
        <div className="tree-report" style={{
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
                title="Ficha Individual de Árvore"
                subtitle={`${tree.especie || 'Espécie Não Identificada'} (ID: ${tree.codigo || tree.id.slice(0, 8)})`}
                reportId={tree.codigo || tree.id}
                installationName={installationName}
            />

            {/* Tree Overview & Photo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{
                    background: '#f9f9f9',
                    padding: '1rem',
                    borderRadius: '4px',
                    border: '1px solid #eee'
                }}>
                    <div style={{
                        width: '100%',
                        height: '250px',
                        marginBottom: '10px',
                        background: '#e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {mainPhotoUrl ? (
                            <img src={mainPhotoUrl} alt="Foto Principal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ color: '#888' }}>Sem Foto</span>
                        )}
                    </div>
                </div>

                <div>
                    <h3 style={{ borderBottom: '2px solid #4caf50', paddingBottom: '5px', marginBottom: '10px', color: '#2e7d32' }}>Dados Dendrométricos</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>DAP:</td>
                                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{tree.dap ? `${tree.dap} cm` : 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Altura:</td>
                                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{tree.altura ? `${tree.altura} m` : 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Data de Cadastro:</td>
                                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{tree.created_at ? new Date(tree.created_at).toLocaleDateString('pt-BR') : 'N/A'}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Localização:</td>
                                <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{tree.local || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ marginTop: '1rem' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Risco Geral:</div>
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '10pt',
                            fontWeight: 600,
                            background: tree.risklevel === 'Alto' ? '#d32f2f' :
                                tree.risklevel === 'Médio' ? '#ff9800' : '#4caf50',
                            color: 'white'
                        }}>
                            {RISK_MAP[tree.risklevel?.toLowerCase()] || tree.risklevel || 'Baixo'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <ReportSection title="Localização Geográfica" icon="📍">
                <div style={{
                    width: '100%',
                    height: '250px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                    marginBottom: '1rem'
                }}>
                    <div id="report-minimap" style={{ width: '100%', height: '100%' }}></div>
                </div>
                <div style={{ fontSize: '9pt', color: '#666' }}>
                    <strong>Coordenadas:</strong> Lat {tree.latitude?.toFixed(6)}, Lng {tree.longitude?.toFixed(6)}
                </div>
            </ReportSection>

            {/* Photos Grid */}
            {photos.length > 1 && (
                <ReportSection title="Galeria de Fotos" icon="📷">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {photos.slice(1, 4).map((photo, idx) => (
                            <div key={idx} style={{ height: '150px', border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <img src={photo.url} alt={`Foto ${idx + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ))}
                    </div>
                </ReportSection>
            )}

            {/* Footer */}
            <div style={{
                marginTop: '3rem',
                borderTop: '1px solid #eee',
                paddingTop: '1rem',
                textAlign: 'center',
                fontSize: '8pt',
                color: '#999'
            }}>
                Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
            </div>
        </div>
    );
}
