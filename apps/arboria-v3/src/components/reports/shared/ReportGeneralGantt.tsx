import { useMemo } from 'react';
import type { InterventionPlan } from '../../../types/plan';

interface ReportGeneralGanttProps {
    plans: InterventionPlan[];
    bufferDays?: number;
    variant?: 'default' | 'tauri';
}

export function ReportGeneralGantt({ plans, bufferDays = 2, variant = 'default' }: ReportGeneralGanttProps) {
    const { startDate, endDate, totalDays } = useMemo(() => {
        if (plans.length === 0) return { startDate: new Date(), endDate: new Date(), totalDays: 0, timeline: [] };

        const dates = plans.flatMap(p => [
            p.schedule?.start || p.schedule?.startDate,
            p.schedule?.end || p.schedule?.endDate
        ]).filter(Boolean).map(d => new Date(d as string).getTime());

        if (dates.length === 0) {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - bufferDays);
            const end = new Date(now);
            end.setDate(now.getDate() + bufferDays);
            return { startDate: start, endDate: end, totalDays: bufferDays * 2, timeline: Array.from({ length: bufferDays * 2 }) };
        }

        const minTime = Math.min(...dates);
        const maxTime = Math.max(...dates);

        // Add buffer
        const start = new Date(minTime);
        start.setDate(start.getDate() - bufferDays);

        const end = new Date(maxTime);
        end.setDate(end.getDate() + bufferDays);

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const timelineArr = Array.from({ length: days || 1 });

        return { startDate: start, endDate: end, totalDays: days || 1, timeline: timelineArr };
    }, [plans, bufferDays]);

    const getPosition = (dateStr?: string) => {
        if (!dateStr) return 0;
        const date = new Date(dateStr);
        const diff = date.getTime() - startDate.getTime();
        return (diff / (1000 * 60 * 60 * 24)) / totalDays * 100;
    };

    const getDurationWidth = (startStr?: string, endStr?: string) => {
        if (!startStr || !endStr) return 0;
        const start = new Date(startStr).getTime();
        const end = new Date(endStr).getTime();
        const duration = (end - start) / (1000 * 60 * 60 * 24);
        return (duration / totalDays) * 100;
    };

    return (
        <div style={{
            width: '100%',
            border: '1px solid #eee',
            borderRadius: '8px',
            background: 'white',
            marginBottom: '20px',
            overflow: 'hidden',
            boxShadow: variant === 'tauri' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
        }}>
            {/* Timeline Header */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #eee',
                background: variant === 'tauri' ? '#fcfcfc' : '#f9f9f9',
                fontSize: '8pt',
                color: '#666',
                fontWeight: 600
            }}>
                <div style={{ width: '180px', padding: '12px', flexShrink: 0, borderRight: '1px solid #eee' }}>
                    Intervenção / ID
                </div>
                <div style={{ flex: 1, position: 'relative', height: '35px' }}>
                    {/* Render Month/Day markers roughly */}
                    <div style={{ position: 'absolute', left: '10px', top: '10px' }}>
                        {startDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ position: 'absolute', left: '50%', top: '10px', transform: 'translateX(-50%)', opacity: 0.5 }}>
                        MEIO
                    </div>
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        {endDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Gantt Body */}
            <div style={{ position: 'relative' }}>
                {/* Grid Lines */}
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: '180px', right: 0,
                    display: 'flex',
                    zIndex: 0
                }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} style={{ flex: 1, borderRight: '1px solid #f8f8f8' }}></div>
                    ))}
                </div>

                {/* Bars */}
                {plans.map((plan, index) => {
                    const startP = getPosition(plan.schedule?.start || plan.schedule?.startDate);
                    const widthP = getDurationWidth(
                        plan.schedule?.start || plan.schedule?.startDate,
                        plan.schedule?.end || plan.schedule?.endDate
                    );

                    let color = '#4caf50'; // Default green
                    if (variant === 'tauri') {
                        const status = plan.status?.toLowerCase();
                        if (['concluido', 'completed', 'approved'].includes(status)) {
                            color = '#22c55e'; // Vibrant Green
                        } else if (status === 'atrasado' || status === 'late') {
                            color = '#ef4444'; // Red
                        } else if (status === 'in_progress' || status === 'em_andamento') {
                            color = '#f59e0b'; // Amber/Orange
                        } else {
                            color = '#10b981'; // Primary Green fallback
                        }
                    } else {
                        const colors: Record<string, string> = {
                            'poda': '#4caf50',
                            'supressao': '#d32f2f',
                            'transplante': '#ff9800',
                            'tratamento': '#2196f3',
                            'monitoramento': '#9c27b0'
                        };
                        color = colors[plan.intervention_type] || '#666';
                    }

                    return (
                        <div key={plan.id} style={{
                            display: 'flex',
                            height: '42px',
                            borderBottom: '1px solid #f9f9f9',
                            position: 'relative',
                            zIndex: 1,
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '180px',
                                padding: '0 12px',
                                flexShrink: 0,
                                fontSize: '8.5pt',
                                borderRight: '1px solid #eee',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                background: 'white',
                                color: variant === 'tauri' ? '#334155' : '#111'
                            }}>
                                <span style={{ color: color, marginRight: '4px' }}>●</span>
                                <strong>#{index + 1}</strong> {plan.intervention_type}
                                <div style={{ fontSize: '7pt', color: '#94a3b8', marginTop: '-2px' }}>
                                    ID {plan.plan_id || plan.id.substring(0, 8)}
                                </div>
                            </div>
                            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: `${startP}%`,
                                    width: `${Math.max(widthP, 12)}%`, // Minimum width for visibility
                                    top: '10px',
                                    height: '22px',
                                    background: color,
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    fontSize: '7pt',
                                    fontWeight: 700,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    padding: '0 8px'
                                }}>
                                    ID {plan.plan_id || plan.id.substring(0, 8)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
