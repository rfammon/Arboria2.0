import { 
    BookOpen, 
    ClipboardCheck, 
    Scale, 
    HardHat, 
    Shield, 
    Recycle, 
    Library,
    Wrench,
    HeartPulse,
    AlertTriangle,
    Mountain,
    Zap
} from 'lucide-react';
import { 
    DefinitionsIllustration,
    PlanningIllustration,
    LegalIllustration,
    PreparationIllustration,
    PruningIllustration,
    SafetyIllustration,
    WasteIllustration,
    GlossaryIllustration,
    ChainsawIcon
} from '../components/illustrations/education-illustrations';

export interface EducationTopic {
    id: string;
    title: string;
    description: string;
    icon: any; // Lucide icon
    illustration: any; // SVG Component ComponentType<SVGProps<SVGSVGElement>>
    colorClass: string;
    iconColor: string;
    blobColor: string;
}

export const EDUCATION_TOPICS: EducationTopic[] = [
    {
        id: 'concepts',
        title: 'Definições',
        description: 'Conceitos fundamentais e terminologia técnica do setor.',
        icon: BookOpen,
        illustration: DefinitionsIllustration,
        colorClass: 'dark:bg-blue-900/20 bg-blue-50 border-blue-100 dark:border-white/5',
        iconColor: 'text-blue-600 dark:text-blue-400',
        blobColor: 'bg-blue-400/20'
    },
    {
        id: 'legal',
        title: 'Termos Legais',
        description: 'Documentação legal e autorizações necessárias (ASV).',
        icon: Scale,
        illustration: LegalIllustration,
        colorClass: 'dark:bg-amber-900/20 bg-amber-50 border-amber-100 dark:border-white/5',
        iconColor: 'text-amber-600 dark:text-amber-400',
        blobColor: 'bg-amber-400/20'
    },
    {
        id: 'risk-assessment',
        title: 'Avaliação de Riscos',
        description: 'Identificação e mitigação de riscos no ambiente de trabalho.',
        icon: AlertTriangle,
        illustration: PlanningIllustration,
        colorClass: 'dark:bg-orange-900/20 bg-orange-50 border-orange-100 dark:border-white/5',
        iconColor: 'text-orange-600 dark:text-orange-400',
        blobColor: 'bg-orange-400/20'
    },
    {
        id: 'planning',
        title: 'Planejamento',
        description: 'Técnicas de planejamento e avaliação de risco operacional.',
        icon: ClipboardCheck,
        illustration: PlanningIllustration,
        colorClass: 'dark:bg-emerald-900/20 bg-emerald-50 border-emerald-100 dark:border-white/5',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        blobColor: 'bg-emerald-400/20'
    },
    {
        id: 'ppe',
        title: 'EPIs e EPCs',
        description: 'Equipamentos de Proteção Individual e Coletiva.',
        icon: Shield,
        illustration: SafetyIllustration,
        colorClass: 'dark:bg-teal-900/20 bg-teal-50 border-teal-100 dark:border-white/5',
        iconColor: 'text-teal-600 dark:text-teal-400',
        blobColor: 'bg-teal-400/20'
    },
    {
        id: 'equipment',
        title: 'Manutenção de Equipamentos',
        description: 'Cuidados e manutenção preventiva de ferramentas e maquinário.',
        icon: Wrench,
        illustration: PreparationIllustration,
        colorClass: 'dark:bg-indigo-900/20 bg-indigo-50 border-indigo-100 dark:border-white/5',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        blobColor: 'bg-indigo-400/20'
    },
    {
        id: 'preparation',
        title: 'Preparação',
        description: 'Procedimentos de segurança e isolamento de área.',
        icon: HardHat,
        illustration: PreparationIllustration,
        colorClass: 'dark:bg-red-900/20 bg-red-50 border-red-100 dark:border-white/5',
        iconColor: 'text-red-600 dark:text-red-400',
        blobColor: 'bg-red-400/20'
    },
    {
        id: 'safety',
        title: 'Segurança no Trabalho',
        description: 'Normas de segurança e prevenção de acidentes.',
        icon: Shield,
        illustration: SafetyIllustration,
        colorClass: 'dark:bg-yellow-900/20 bg-yellow-50 border-yellow-100 dark:border-white/5',
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        blobColor: 'bg-yellow-400/20'
    },
    {
        id: 'climbing',
        title: 'Técnicas de Escalada',
        description: 'Métodos seguros de ascensão e trabalho em altura.',
        icon: Mountain,
        illustration: PreparationIllustration,
        colorClass: 'dark:bg-cyan-900/20 bg-cyan-50 border-cyan-100 dark:border-white/5',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        blobColor: 'bg-cyan-400/20'
    },
    {
        id: 'pruning',
        title: 'Técnicas de Poda',
        description: 'Técnicas avançadas de poda e supressão vegetal.',
        icon: ChainsawIcon,
        illustration: PruningIllustration,
        colorClass: 'dark:bg-violet-900/20 bg-violet-50 border-violet-100 dark:border-white/5',
        iconColor: 'text-violet-600 dark:text-violet-400',
        blobColor: 'bg-violet-400/20'
    },
    {
        id: 'chainsaw',
        title: 'Operação de Motosserra',
        description: 'Uso seguro e eficiente de motosserras.',
        icon: Zap,
        illustration: PruningIllustration,
        colorClass: 'dark:bg-zinc-900/20 bg-zinc-50 border-zinc-100 dark:border-white/5',
        iconColor: 'text-zinc-600 dark:text-zinc-400',
        blobColor: 'bg-zinc-400/20'
    },
    {
        id: 'waste',
        title: 'Resíduos',
        description: 'Gestão de resíduos (MTR) e impacto ambiental.',
        icon: Recycle,
        illustration: WasteIllustration,
        colorClass: 'dark:bg-green-900/20 bg-green-50 border-green-100 dark:border-white/5',
        iconColor: 'text-green-600 dark:text-green-400',
        blobColor: 'bg-green-400/20'
    },
    {
        id: 'first-aid',
        title: 'Primeiros Socorros',
        description: 'Procedimentos de emergência e primeiros atendimentos.',
        icon: HeartPulse,
        illustration: SafetyIllustration,
        colorClass: 'dark:bg-rose-900/20 bg-rose-50 border-rose-100 dark:border-white/5',
        iconColor: 'text-rose-600 dark:text-rose-400',
        blobColor: 'bg-rose-400/20'
    },
    {
        id: 'glossary',
        title: 'Glossário',
        description: 'Dicionário completo de termos e abreviações.',
        icon: Library,
        illustration: GlossaryIllustration,
        colorClass: 'dark:bg-slate-900/20 bg-slate-50 border-slate-100 dark:border-white/5',
        iconColor: 'text-slate-600 dark:text-slate-400',
        blobColor: 'bg-slate-400/20'
    }
];

export const TOPIC_MAP = EDUCATION_TOPICS.reduce((acc, topic) => {
    acc[topic.id] = topic.title;
    return acc;
}, {} as Record<string, string>);

export function getTopicTitle(id: string): string {
    return TOPIC_MAP[id] || 'Módulo de Aprendizado';
}
