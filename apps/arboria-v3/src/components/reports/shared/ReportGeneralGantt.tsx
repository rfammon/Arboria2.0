import { useMemo } from 'react';
import type { InterventionPlan } from '../../../types/plan';

interface ReportGeneralGanttProps {
    plans: InterventionPlan[];
}

export function ReportGeneralGantt({ plans }: ReportGeneralGanttProps) {
    const { startDate, endDate, totalDays } = useMemo(() => {
        if (plans.length === 0) return { startDate: new Date(), endDate: new Date(), totalDays: 0, timeline: [] };

        const dates = plans.flatMap(p => [
            p.schedule?.start || p.schedule?.startDate,
            p.schedule?.end || p.schedule?.endDate
        ]).filter(Boolean).map(d => new Date(d as string).getTime());

        if (dates.length === 0) {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - 2);
            const end = new Date(now);
            end.setDate(now.getDate() + 2);
            return { startDate: start, endDate: end, totalDays: 4, timeline: Array.from({ length: 4 }) };
        }

        const minTime = Math.min(...dates);
        const maxTime = Math.max(...dates);

        // Add buffer (5 pre, 5 post)
        const start = new Date(minTime);
        start.setDate(start.getDate() - 2);

        const end = new Date(maxTime);
        end.setDate(end.getDate() + 2);

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const timelineArr = Array.from({ length: days || 1 });

        return { startDate: start, endDate: end, totalDays: days || 1, timeline: timelineArr };
    }, [plans]);

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
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            marginBottom: '20px',
            overflow: 'hidden'
        }}>
            {/* Timeline Header */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #eee',
                background: '#f9f9f9',
                fontSize: '8pt',
                color: '#666'
            }}>
                <div style={{ width: '150px', padding: '10px', flexShrink: 0, borderRight: '1px solid #eee' }}>
                    Intervenção / ID
                </div>
                <div style={{ flex: 1, position: 'relative', height: '30px' }}>
                    {/* Render Month/Day markers roughly */}
                    <div style={{ position: 'absolute', left: 0, top: '8px' }}>
                        {startDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ position: 'absolute', right: 0, top: '8px' }}>
                        {endDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Gantt Body */}
            <div style={{ position: 'relative' }}>
                {/* Grid Lines */}
                <div style={{
                    position: 'absolute',
                    top: 0, bottom: 0, left: '150px', right: 0,
                    display: 'flex',
                    zIndex: 0
                }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} style={{ flex: 1, borderRight: '1px dashed #f0f0f0' }}></div>
                    ))}
                </div>

                {/* Bars */}
                {plans.map((plan, index) => {
                    const startP = getPosition(plan.schedule?.start || plan.schedule?.startDate);
                    const widthP = getDurationWidth(
                        plan.schedule?.start || plan.schedule?.startDate,
                        plan.schedule?.end || plan.schedule?.endDate
                    );

                    const colors: Record<string, string> = {
                        'poda': '#4caf50',
                        'supressao': '#d32f2f',
                        'transplante': '#ff9800',
                        'tratamento': '#2196f3',
                        'monitoramento': '#9c27b0'
                    };
                    const color = colors[plan.intervention_type] || '#666';

                    return (
                        <div key={plan.id} style={{
                            display: 'flex',
                            height: '36px',
                            borderBottom: '1px solid #f5f5f5',
                            position: 'relative',
                            zIndex: 1,
                            alignItems: 'center'
                        }}>
                            <div style={{
                                width: '150px',
                                padding: '0 10px',
                                flexShrink: 0,
                                fontSize: '8pt',
                                borderRight: '1px solid #eee',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                background: 'white' // Cover grid lines
                            }}>
                                <strong>#{index + 1}</strong> {plan.intervention_type}
                            </div>
                            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: `${startP}%`,
                                    width: `${Math.max(widthP, 1)}%`,
                                    top: '8px',
                                    height: '20px',
                                    background: color,
                                    borderRadius: '3px',
                                    opacity: 0.9,
                                    fontSize: '7pt',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    padding: '0 4px'
                                }}>
                                    ID {plan.plan_id || plan.id.substring(0, 6)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
