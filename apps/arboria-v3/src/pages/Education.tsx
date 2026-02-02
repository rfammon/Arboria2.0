import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
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
    Flame
} from 'lucide-react';
import { EducationSearch } from '../components/education/EducationSearch';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { ModeSelector } from '../components/education/ModeSelector';
import type { LearningMode } from '../components/education/ModeSelector';
import { SpecializationNavigator } from '../components/education/specialization/SpecializationNavigator';
import { useEducationStore } from '../stores/useEducationStore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Gamification Header Component (Inline or Separate) ---
const GamificationHeader = ({ streak, score, certificationStatus }: any) => (
    <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
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
    const { modules, streak, certificationStatus, score } = useEducationStore((state) => ({
        modules: state.modules,
        streak: state.streak,
        certificationStatus: state.certificationStatus,
        score: Object.values(state.modules).reduce((acc, m) => acc + m.score, 0)
    }));

    const topics = [
        {
            id: 'concepts',
            title: 'Definições',
            description: 'Conceitos fundamentais e terminologia técnica do setor.',
            icon: BookOpen,
            colorClass: 'dark:bg-blue-900/20 bg-blue-50 border-blue-100 dark:border-white/5',
            iconColor: 'text-blue-600 dark:text-blue-400',
            blobColor: 'bg-blue-400/20'
        },
        {
            id: 'planning',
            title: 'Planejamento',
            description: 'Técnicas de planejamento e avaliação de risco operacional.',
            icon: ClipboardCheck,
            colorClass: 'dark:bg-emerald-900/20 bg-emerald-50 border-emerald-100 dark:border-white/5',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            blobColor: 'bg-emerald-400/20'
        },
        {
            id: 'legal',
            title: 'Termos Legais',
            description: 'Documentação legal e autorizações necessárias (ASV).',
            icon: Scale,
            colorClass: 'dark:bg-amber-900/20 bg-amber-50 border-amber-100 dark:border-white/5',
            iconColor: 'text-amber-600 dark:text-amber-400',
            blobColor: 'bg-amber-400/20'
        },
        {
            id: 'preparation',
            title: 'Preparação',
            description: 'Procedimentos de segurança e isolamento de área.',
            icon: HardHat,
            colorClass: 'dark:bg-red-900/20 bg-red-50 border-red-100 dark:border-white/5',
            iconColor: 'text-red-600 dark:text-red-400',
            blobColor: 'bg-red-400/20'
        },
        {
            id: 'pruning',
            title: 'Poda',
            description: 'Técnicas avançadas de poda e supressão vegetal.',
            icon: Scissors,
            colorClass: 'dark:bg-violet-900/20 bg-violet-50 border-violet-100 dark:border-white/5',
            iconColor: 'text-violet-600 dark:text-violet-400',
            blobColor: 'bg-violet-400/20'
        },
        {
            id: 'safety',
            title: 'EPIs',
            description: 'Equipamentos de proteção individual e coletiva.',
            icon: Shield,
            colorClass: 'dark:bg-yellow-900/20 bg-yellow-50 border-yellow-100 dark:border-white/5',
            iconColor: 'text-yellow-600 dark:text-yellow-400',
            blobColor: 'bg-yellow-400/20'
        },
        {
            id: 'waste',
            title: 'Resíduos',
            description: 'Gestão de resíduos (MTR) e impacto ambiental.',
            icon: Recycle,
            colorClass: 'dark:bg-green-900/20 bg-green-50 border-green-100 dark:border-white/5',
            iconColor: 'text-green-600 dark:text-green-400',
            blobColor: 'bg-green-400/20'
        },
        {
            id: 'glossary',
            title: 'Glossário',
            description: 'Dicionário completo de termos e abreviações.',
            icon: Library,
            colorClass: 'dark:bg-slate-900/20 bg-slate-50 border-slate-100 dark:border-white/5',
            iconColor: 'text-slate-600 dark:text-slate-400',
            blobColor: 'bg-slate-400/20'
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 text-muted-foreground hover:text-primary"
                            onClick={() => setMode(null)}
                        >
                            <ArrowRight className="w-4 h-4 rotate-180 mr-1" />
                            Trocar Modo
                        </Button>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500">
                            {isTraining ? 'Training Mode' : 'Reference Mode'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display">
                        Educação & <span className="text-primary italic">Treinamento</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {isTraining
                            ? 'Sua jornada para a certificação profissional.'
                            : 'Biblioteca completa de consulta técnica.'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Gamification Stats (Only in Training) */}
                    {isTraining && (
                        <GamificationHeader
                            streak={streak}
                            score={score}
                            certificationStatus={certificationStatus}
                        />
                    )}

                    <Button variant="outline" size="lg" className="rounded-2xl" onClick={() => navigate('/')}>
                        Voltar ao Menu
                    </Button>
                </div>
            </div>

            {/* Specialization Track (Training Mode Only) */}
            {isTraining && (
                <div className="mb-12">
                    <SpecializationNavigator
                        modules={modules}
                        isCertified={certificationStatus === 'certified'}
                    />
                </div>
            )}

            {/* Reference/Search (Only Reference Mode) */}
            {!isTraining && (
                <div className="max-w-2xl mx-auto mb-12">
                    <EducationSearch />
                </div>
            )}

            {/* Topics Grid */}
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Library className="w-6 h-6 text-primary" />
                {isTraining ? 'Módulos de Aprendizado' : 'Tópicos de Referência'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topics.map((topic) => {
                    const status = modules[topic.id]?.status || 'locked';
                    // In reference mode, everything is available. In training, respect lock.
                    const isLocked = isTraining && status === 'locked' && topic.id !== 'safety' && topic.id !== 'concepts';

                    return (
                        <div
                            key={topic.id}
                            onClick={() => !isLocked && navigate(`/education/${topic.id}`)}
                            className={cn(
                                "relative group overflow-hidden rounded-[2rem] p-6 h-full flex flex-col justify-between transition-all duration-300 border shadow-lg",
                                topic.colorClass,
                                !isLocked && "hover:scale-[1.02] cursor-pointer",
                                isLocked && "opacity-70 grayscale cursor-not-allowed"
                            )}
                        >
                            {/* Background Blob */}
                            <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-50 transition-all group-hover:scale-150 group-hover:opacity-70", topic.blobColor)} />

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <topic.icon className={cn("w-6 h-6", topic.iconColor)} />
                                </div>
                                <h3 className="text-xl font-bold tracking-tight mb-2">{topic.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
                            </div>

                            {/* Status Footer (Training Mode) */}
                            {isTraining && (
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center relative z-10">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        {status === 'completed' ? 'Concluído' : status === 'available' ? 'Disponível' : 'Bloqueado'}
                                    </span>
                                    {status === 'completed' && <Trophy className="w-4 h-4 text-yellow-500" />}
                                    {status === 'locked' && topic.id !== 'safety' && <div className="w-4 h-4 bg-slate-500/20 rounded-full" />}
                                </div>
                            )}

                            {/* Hover Arrow (Reference Mode or Unlocked) */}
                            {!isLocked && (
                                <div className="mt-8 flex items-center justify-end relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
