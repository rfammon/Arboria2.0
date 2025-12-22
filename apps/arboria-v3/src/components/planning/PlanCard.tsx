// Plan Card Component - Individual Intervention Plan Display

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Eye, Edit, Calendar, User } from 'lucide-react';
import type { InterventionPlan } from '../../types/plan';
import {
    formatDate,
    getDaysUntilExecution,
    getUrgencyBadgeConfig,
    extractScheduleDate,
    INTERVENTION_ICONS,
    INTERVENTION_COLORS,
    INTERVENTION_LABELS
} from '../../lib/planUtils';
import { cn } from '../../lib/utils';

interface PlanCardProps {
    plan: InterventionPlan;
    onViewDetails: (plan: InterventionPlan) => void;
    onEdit: (plan: InterventionPlan) => void;
}

export function PlanCard({ plan, onViewDetails, onEdit }: PlanCardProps) {
    const icon = INTERVENTION_ICONS[plan.intervention_type] || '📌';
    const color = INTERVENTION_COLORS[plan.intervention_type] || '#666';
    const daysUntil = getDaysUntilExecution(plan.schedule);
    const urgencyConfig = getUrgencyBadgeConfig(daysUntil);

    return (
        <Card
            className="hover:shadow-lg transition-all duration-300 border-l-4"
            style={{ borderLeftColor: color }}
        >
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{icon}</span>
                        <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold">
                                {INTERVENTION_LABELS[plan.intervention_type]}
                            </CardTitle>

                            {/* Status Badge */}
                            <Badge variant="outline" className={`mt-1 text-xs font-normal
                                ${plan.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                    plan.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        'bg-slate-50 text-slate-600'}`}>
                                {plan.status === 'COMPLETED' ? 'Concluído' :
                                    plan.status === 'IN_PROGRESS' ? 'Em Andamento' :
                                        plan.status === 'DRAFT' ? 'Rascunho' :
                                            plan.status === 'CANCELLED' ? 'Cancelado' : 'Aprovado'}
                            </Badge>

                            {/* Tree Info - Compact */}
                            {plan.tree ? (
                                <div className="flex items-center gap-1.5 mt-1 text-sm text-foreground/80">
                                    <span className="font-medium truncate">{plan.tree.especie || 'Espécie não ident.'}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-1 rounded">
                                        ID: {plan.tree.id.slice(0, 6)}
                                    </span>
                                </div>
                            ) : (
                                <div className="text-sm text-yellow-600 dark:text-yellow-500 mt-1 flex items-center gap-1">
                                    <span className="text-xs">⚠️ Sem árvore vinculada</span>
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground mt-0.5 truncate font-mono opacity-70">
                                {plan.plan_id}
                            </p>
                        </div>
                    </div>

                    {daysUntil !== null && (
                        <span
                            className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors",
                                urgencyConfig.cssClass
                            )}
                            style={{
                                backgroundColor: urgencyConfig.color,
                                color: 'white'
                            }}
                        >
                            {urgencyConfig.label}
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pb-3 space-y-3">
                {/* Justification */}
                {plan.justification && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {plan.justification}
                    </p>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs font-medium">Programado:</span>
                        </div>
                        <div className="font-medium">
                            {formatDate(extractScheduleDate(plan.schedule))}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <User className="w-3 h-3" />
                            <span className="text-xs font-medium">Responsável:</span>
                        </div>
                        <div className="font-medium truncate">
                            {plan.responsible || 'Não definido'}
                        </div>
                    </div>
                </div>

                {/* Techniques */}
                {plan.techniques && plan.techniques.length > 0 && (
                    <div>
                        <div className="text-xs text-muted-foreground mb-1">Técnicas:</div>
                        <div className="flex flex-wrap gap-1">
                            {plan.techniques.slice(0, 3).map((technique, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                                >
                                    {technique}
                                </span>
                            ))}
                            {plan.techniques.length > 3 && (
                                <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                                    +{plan.techniques.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex gap-2 pt-3 border-t">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onViewDetails(plan)}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    Detalhes
                </Button>
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(plan)}
                >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                </Button>
            </CardFooter>

            {/* Created Date Footer */}
            <div className="px-6 pb-3 pt-2 border-t text-xs text-muted-foreground">
                Criado em {formatDate(plan.created_at.split('T')[0])}
            </div>
        </Card>
    );
}
