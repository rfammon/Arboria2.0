import React from 'react';

interface ReportSectionProps {
    title: string;
    icon?: string;
    children: React.ReactNode;
    pageBreakBefore?: boolean;
    pageBreakAfter?: boolean;
}

export function ReportSection({
    title,
    icon,
    children,
    pageBreakBefore = false,
    pageBreakAfter = false
}: ReportSectionProps) {
    return (
        <div
            className="report-section"
            style={{
                width: '100%',
                marginTop: '15px',
                marginBottom: '15px',
                pageBreakBefore: pageBreakBefore ? 'always' : 'auto',
                pageBreakAfter: pageBreakAfter ? 'always' : 'auto',
                pageBreakInside: 'avoid'
            }}
        >
            <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '11pt',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#000',
                borderBottom: '1px solid #000',
                paddingBottom: '3px'
            }}>
                {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
                {title}
            </h3>
            <div className="section-content">
                {children}
            </div>
        </div>
    );
}
