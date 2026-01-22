import {
    Calendar,
    User,
    Wrench,
    ShieldCheck,
    Clock,
    FileText,
    HardHat,
    Construction,
    Scissors,
    Truck,
    Ruler,
    ClipboardList
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
    formatDate,
    extractScheduleDate,
    getPlanDuration
} from '../../../lib/planUtils';
import type { InterventionPlan } from '../../../types/plan';

interface PlanRequirementsProps {
    plan: InterventionPlan;
    color: string;
}

/**
 * Mapping of common tools and EPIs to visual icons
 * for Arboria's Visual-First UI principle.
 */
const ICON_MAPPING: Record<string, React.ReactNode> = {
    // Tools
    'Motosserra': <Wrench className="w-4 h-4" />,
    'Tesoura': <Scissors className="w-4 h-4" />,
    'Caminhão': <Truck className="w-4 h-4" />,
    'Escada': <Construction className="w-4 h-4" />,
    'Fita Métrica': <Ruler className="w-4 h-4" />,
    // EPIs
    'Capacete': <HardHat className="w-4 h-4" />,
    'Luvas': <ShieldCheck className="w-4 h-4" />,
    'Óculos': <ShieldCheck className="w-4 h-4" />,
    'Botas': <Construction className="w-4 h-4" />,
    'Cinto de Segurança': <Construction className="w-4 h-4" />,
    'Protetor Auricular': <ShieldCheck className="w-4 h-4" />,
    // Fallback
    'default': <ClipboardList className="w-4 h-4" />
};

function RequirementBadge({ label }: { label: string }) {
    // Basic fuzzy match for icons
    const iconKey = Object.keys(ICON_MAPPING).find(key => 
        label.toLowerCase().includes(key.toLowerCase())
    );
    const icon = iconKey ? ICON_MAPPING[iconKey] : ICON_MAPPING['default'];

    return (
        <Badge variant="secondary" className="flex items-center gap-1.5 py-1 px-3 text-sm font-normal">
            <span className="text-muted-foreground">{icon}</span>
            {label}
        </Badge>
    );
}

export function PlanRequirements({ plan, color }: PlanRequirementsProps) {
    const totalDuration = getPlanDuration(plan.durations);
    const startDate = extractScheduleDate(plan.schedule);

    return (
        <div className="space-y-6">
            {/* 1. Core Timeline & Responsibility - Focused Data */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-muted/30">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Início</p>
                            <p className="font-semibold">{formatDate(startDate)}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/30">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-2 bg-blue-500/10 rounded-full">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Duração</p>
                            <p className="font-semibold">{totalDuration} dia(s)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-muted/30">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="p-2 bg-emerald-500/10 rounded-full">
                            <User className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Responsável</p>
                            <p className="font-semibold truncate">{plan.responsible || 'Não definido'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Visual Requirements Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tools & Techniques Combined for Visual Flow */}
                {( (plan.tools && plan.tools.length > 0) || (plan.techniques && plan.techniques.length > 0) ) && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-muted-foreground" />
                                Ferramentas e Técnicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {plan.techniques?.map((t, i) => (
                                    <Badge key={`tech-${i}`} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none">
                                        {t}
                                    </Badge>
                                ))}
                                {plan.tools?.map((tool, i) => (
                                    <RequirementBadge key={`tool-${i}`} label={tool} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Safety / EPIs - Critical Visibility */}
                {plan.epis && plan.epis.length > 0 && (
                    <Card className="border-orange-100 bg-orange-50/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-orange-600" />
                                Segurança e EPIs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {plan.epis.map((epi, i) => (
                                    <RequirementBadge key={`epi-${i}`} label={epi} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* 3. Justification - Text with expansion logic potential */}
            {plan.justification && (
                <Card className="border-l-4" style={{ borderLeftColor: color }}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            JUSTIFICATIVA TÉCNICA
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {plan.justification}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
