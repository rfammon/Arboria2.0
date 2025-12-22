// import React from 'react';

interface ReportHeaderProps {
    title: string;
    subtitle?: string;
    date?: string;
    reportId?: string;
    installationName?: string;
}

export function ReportHeader({ title, subtitle, date, reportId, installationName }: ReportHeaderProps) {
    const currentDate = date || new Date().toLocaleDateString('pt-BR');

    return (
        <div className="report-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
            borderBottom: '2px solid #000',
            paddingBottom: '8px',
            marginBottom: '15px'
        }}>
            <div className="header-logo">
                <h2 style={{
                    margin: 0,
                    fontSize: '24pt',
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    lineHeight: 1,
                    color: '#000'
                }}>
                    Arbor<span style={{ color: '#2e7d32' }}>IA</span>
                </h2>
                <div style={{
                    fontSize: '10pt',
                    fontWeight: 500,
                    color: '#333',
                    marginTop: '5px'
                }}>
                    {title}
                </div>
                {subtitle && (
                    <div style={{
                        fontSize: '8pt',
                        color: '#666',
                        marginTop: '2px'
                    }}>
                        {subtitle}
                    </div>
                )}
            </div>
            <div className="header-info" style={{ textAlign: 'right' }}>
                {installationName && (
                    <p style={{ margin: '2px 0', fontSize: '9pt', color: '#555' }}>
                        <strong>Instalação:</strong> {installationName}
                    </p>
                )}
                {reportId && (
                    <p style={{ margin: '2px 0', fontSize: '9pt', color: '#555' }}>
                        <strong>ID:</strong> {reportId}
                    </p>
                )}
                <p style={{ margin: '2px 0', fontSize: '9pt', color: '#555' }}>
                    <strong>Data de Emissão:</strong> {currentDate}
                </p>
            </div>
        </div>
    );
}
