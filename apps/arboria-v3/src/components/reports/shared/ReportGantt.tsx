// import React from 'react';
import type { InterventionPlan } from '../../../types/plan';

interface ReportGanttProps {
    plan: InterventionPlan;
    compact?: boolean;
    bufferDays?: number;
}

export function ReportGantt({ plan, compact = false, bufferDays = 2 }: ReportGanttProps) {
    // Extract dates
    const startStr = plan.schedule?.start || plan.schedule?.startDate;
    const endStr = plan.schedule?.end || plan.schedule?.endDate;

    if (!startStr) {
        return <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>Cronograma não definido</div>;
    }

    const baseStart = new Date(startStr);
    const startDate = new Date(baseStart);
    startDate.setDate(baseStart.getDate() - bufferDays);

    let baseEnd = new Date(baseStart);

    // Calculate duration
    if (plan.durations) {
        const totalDurationDays = (plan.durations.mobilization || 0) +
            (plan.durations.execution || 0) +
            (plan.durations.demobilization || 0);
        baseEnd.setDate(baseStart.getDate() + Math.max(1, totalDurationDays));
    } else if (endStr) {
        baseEnd = new Date(endStr);
    } else {
        baseEnd.setDate(baseStart.getDate() + 1);
    }

    const endDate = new Date(baseEnd);
    endDate.setDate(baseEnd.getDate() + bufferDays);

    // Calculate phase dates if durations exist
    let mobilizationEnd: Date | null = null;
    let executionEnd: Date | null = null;

    if (plan.durations) {
        if (plan.durations.mobilization) {
            mobilizationEnd = new Date(startDate);
            mobilizationEnd.setDate(startDate.getDate() + plan.durations.mobilization);
        }
        if (plan.durations.execution) {
            const execStart = mobilizationEnd || startDate;
            executionEnd = new Date(execStart);
            executionEnd.setDate(execStart.getDate() + plan.durations.execution);
        }
    }

    const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="report-gantt" style={{
            background: '#fafafa',
            padding: compact ? '0.75rem' : '1rem',
            borderRadius: '4px',
            border: '1px solid #ddd'
        }}>
            {/* Timeline Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
                fontSize: '9pt',
                color: '#666'
            }}>
                <div><strong>Início:</strong> {formatDate(startDate)}</div>
                <div><strong>Término:</strong> {formatDate(endDate)}</div>
                <div><strong>Duração:</strong> {totalDays} dias</div>
            </div>

            {/* Visual Timeline */}
            <div style={{
                position: 'relative',
                height: compact ? '30px' : '40px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                {plan.durations ? (
                    <>
                        {/* Mobilization Phase */}
                        {plan.durations.mobilization && mobilizationEnd && (
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: `${(plan.durations.mobilization / totalDays) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '8pt',
                                fontWeight: 600,
                                borderRight: '1px solid white'
                            }}>
                                Mobilização ({plan.durations.mobilization}d)
                            </div>
                        )}
                        {/* Execution Phase */}
                        {plan.durations.execution && executionEnd && (
                            <div style={{
                                position: 'absolute',
                                left: `${((plan.durations.mobilization || 0) / totalDays) * 100}%`,
                                top: 0,
                                width: `${(plan.durations.execution / totalDays) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '8pt',
                                fontWeight: 600,
                                borderRight: '1px solid white'
                            }}>
                                Execução ({plan.durations.execution}d)
                            </div>
                        )}
                        {/* Demobilization Phase */}
                        {plan.durations.demobilization && (
                            <div style={{
                                position: 'absolute',
                                left: `${(((plan.durations.mobilization || 0) + (plan.durations.execution || 0)) / totalDays) * 100}%`,
                                top: 0,
                                width: `${(plan.durations.demobilization / totalDays) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '8pt',
                                fontWeight: 600
                            }}>
                                Desmobilização ({plan.durations.demobilization}d)
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '8pt',
                        fontWeight: 600
                    }}>
                        Execução ({totalDays} dias)
                    </div>
                )}
            </div>

            {/* Legend */}
            {plan.durations && (
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '0.5rem',
                    fontSize: '7pt',
                    color: '#666'
                }}>
                    {plan.durations.mobilization && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#42a5f5', borderRadius: '2px' }}></div>
                            Mobilização
                        </div>
                    )}
                    {plan.durations.execution && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#43a047', borderRadius: '2px' }}></div>
                            Execução
                        </div>
                    )}
                    {plan.durations.demobilization && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#fb8c00', borderRadius: '2px' }}></div>
                            Desmobilização
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
