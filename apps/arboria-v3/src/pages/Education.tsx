import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    ClipboardCheck,
    Scale,
    HardHat,
    Scissors,
    Shield,
    Recycle,
    Library,
    ArrowRight,
    Trophy,
    Flame,
    Lock
} from 'lucide-react';
import { ReferenceDashboard } from '../components/education/ReferenceDashboard';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { ModeSelector } from '../components/education/ModeSelector';
import type { LearningMode } from '../components/education/ModeSelector';
import { useEducationStore } from '../stores/useEducationStore';
import { 
    DefinitionsIllustration, 
    PlanningIllustration, 
    LegalIllustration, 
    PreparationIllustration, 
    PruningIllustration, 
    SafetyIllustration,
    WasteIllustration,
    GlossaryIllustration
} from '../components/illustrations/education-illustrations';

// Map topics to illustrations
const ILLUSTRATION_MAP: Record<string, React.ComponentType<any>> = {
    concepts: DefinitionsIllustration,
    planning: PlanningIllustration,
    legal: LegalIllustration,
    preparation: PreparationIllustration,
    pruning: PruningIllustration,
    safety: SafetyIllustration,
    waste: WasteIllustration,
    glossary: GlossaryIllustration,
};

// --- Gamification Header Component ---
const GamificationHeader = ({ streak, score, certificationStatus }: any) => (
    <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
            <span className="font-bold text-orange-700 dark:text-orange-400">{streak.current} dias</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
            <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-yellow-700 dark:text-yellow-400">{score} XP</span>
        </div>
        {certificationStatus === 'certified' && (
            <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">CERTIFICADO</span>
            </div>
        )}
    </div>
);

export default function Education() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<LearningMode | null>(null);
    const modules = useEducationStore((state) => state.modules);
    const streak = useEducationStore((state) => state.streak);
    const certificationStatus = useEducationStore((state) => state.certificationStatus);
    const score = useEducationStore((state) =>
        Object.values(state.modules).reduce((acc, m) => acc + m.score, 0)
    );

    const topics = [
        {
            id: 'concepts',
            title: 'Definições',
            description: 'Conceitos fundamentais e terminologia técnica do setor.',
            icon: BookOpen,
            colorClass: 'text-blue-600 dark:text-blue-400',
            status: modules['concepts']?.status || 'available'
        },
        {
            id: 'planning',
            title: 'Planejamento',
            description: 'Técnicas de planejamento e avaliação de risco operacional.',
            icon: ClipboardCheck,
            colorClass: 'text-emerald-600 dark:text-emerald-400',
            status: modules['planning']?.status || 'locked'
        },
        {
            id: 'legal',
            title: 'Termos Legais',
            description: 'Documentação legal e autorizações necessárias (ASV).',
            icon: Scale,
            colorClass: 'text-amber-600 dark:text-amber-400',
            status: modules['legal']?.status || 'locked'
        },
        {
            id: 'preparation',
            title: 'Preparação',
            description: 'Procedimentos de segurança e isolamento de área.',
            icon: HardHat,
            colorClass: 'text-red-600 dark:text-red-400',
            status: modules['preparation']?.status || 'locked'
        },
        {
            id: 'pruning',
            title: 'Poda',
            description: 'Técnicas avançadas de poda e supressão vegetal.',
            icon: Scissors,
            colorClass: 'text-violet-600 dark:text-violet-400',
            status: modules['pruning']?.status || 'locked'
        },
        {
            id: 'safety',
            title: 'EPIs',
            description: 'Equipamentos de proteção individual e coletiva.',
            icon: Shield,
            colorClass: 'text-yellow-600 dark:text-yellow-400',
            status: modules['safety']?.status || 'available'
        },
        {
            id: 'waste',
            title: 'Resíduos',
            description: 'Gestão de resíduos (MTR) e impacto ambiental.',
            icon: Recycle,
            colorClass: 'text-green-600 dark:text-green-400',
            status: modules['waste']?.status || 'locked'
        },
        {
            id: 'glossary',
            title: 'Glossário',
            description: 'Dicionário completo de termos e abreviações.',
            icon: Library,
            colorClass: 'text-slate-600 dark:text-slate-400',
            status: modules['glossary']?.status || 'locked'
        }
    ];

    // If no mode selected, show ModeSelector
    if (!mode) {
        return <ModeSelector onSelect={setMode} topicTitle="Arboricultura" />;
    }

    // Determine content based on mode
    const isTraining = mode === 'training';

    return (
        <div className="min-h-full max-w-full mx-auto p-4 md:p-8 animate-in fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <button 
                        onClick={() => setMode(null)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 mb-2 flex items-center gap-1 transition-colors"
                    >
                        <ArrowRight className="w-3 h-3 rotate-180" />
                        Trocar Modo
                    </button>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            Educação <span className="text-slate-400 dark:text-slate-600">&</span> <span className={cn(
                                "bg-clip-text text-transparent bg-gradient-to-r",
                                isTraining ? "from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500" : "from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500"
                            )}>
                                {isTraining ? 'Treinamento' : 'Consulta'}
                            </span>
                        </h1>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                            {isTraining ? 'Training Mode' : 'Reference Mode'}
                        </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {isTraining 
                            ? 'Sua jornada para a certificação profissional.' 
                            : 'Biblioteca completa de normas e procedimentos.'}
                    </p>
                </div>

                {isTraining && (
                    <GamificationHeader
                        streak={streak}
                        score={score}
                        certificationStatus={certificationStatus}
                    />
                )}
            </div>

            {/* Reference/Search (Only Reference Mode) */}
            {!isTraining && (
                <div className="mb-12">
                    <ReferenceDashboard />
                </div>
            )}

            {/* Topics Grid (Only Training Mode) */}
            {isTraining && (
                <>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
                        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                            <Library className="w-6 h-6 text-primary" />
                        </div>
                        Módulos de Aprendizado
                    </h2>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {topics.length} Módulos Disponíveis
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {topics.map((topic) => {
                        const colorName = topic.colorClass.split(' ')[0].split('-')[1];
                        const Illustration = ILLUSTRATION_MAP[topic.id] || DefinitionsIllustration;
                        // Mock lock logic for demo purposes - unlock first 3
                        const isLocked = ['waste', 'glossary'].includes(topic.id);
                        
                        return (
                        <div
                            key={topic.id}
                            onClick={() => !isLocked && navigate(`/education/${topic.id}?mode=training`)}
                            className={cn(
                                "group relative flex flex-col justify-between h-[320px] rounded-[2rem] p-6 transition-all duration-500 overflow-hidden cursor-pointer",
                                isLocked 
                                    ? "bg-slate-100/50 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/5 opacity-75 grayscale hover:grayscale-0 hover:opacity-100" 
                                    : cn(
                                        "bg-white dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm hover:border-primary/50 dark:hover:border-white/20 hover:-translate-y-2",
                                        `hover:shadow-2xl dark:hover:shadow-${colorName}-500/30`
                                    )
                            )}
                        >
                            {/* Animated Background Blob */}
                            <div className={cn(
                                "absolute -right-10 -top-10 w-48 h-48 rounded-full blur-[80px] opacity-10 dark:opacity-15 mix-blend-plus-lighter transition-all duration-700 group-hover:scale-150 group-hover:opacity-30",
                                topic.colorClass.replaceAll('text-', 'bg-')
                            )} />

                            {/* Content */}
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border border-slate-200 dark:border-white/10 transition-transform duration-500 group-hover:rotate-12",
                                        topic.colorClass.replace('text-', 'bg-').replace('500', '500/20').replace('600', '600/10')
                                    )}>
                                        <topic.icon className={cn("w-6 h-6", topic.colorClass)} />
                                    </div>
                                    {isLocked ? (
                                        <Lock className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                                    ) : (
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-slate-100 dark:border-white/5",
                                            topic.status === 'completed' ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                                        )}>
                                            {topic.status === 'completed' ? 'Concluído' : 'Disponível'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                                        {topic.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                        {topic.description}
                                    </p>
                                </div>

                                {/* Vector Illustration Area */}
                                <div className="relative h-24 mt-4 w-full flex items-end justify-end">
                                    <Illustration className="w-32 h-32 absolute -right-4 -bottom-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" />
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
                </>
            )}
        </div>
    );
}