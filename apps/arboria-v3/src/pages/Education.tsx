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
    ArrowRight 
} from 'lucide-react';
import { EducationSearch } from '../components/education/EducationSearch';
import { cn } from '../lib/utils';


export default function Education() {
    const navigate = useNavigate();

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

    return (
        <div className="min-h-full max-w-full mx-auto p-4 md:p-8 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display mb-2">
                        Educação & <span className="text-primary italic">Treinamento</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Recursos e conteúdos para sua formação técnica em manejo florestal
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="lg" className="rounded-2xl" onClick={() => navigate('/')}>
                        Voltar ao Menu
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
                <EducationSearch />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topics.map((topic) => (
                    <div 
                        key={topic.id} 
                        onClick={() => navigate(`/education/${topic.id}`)} 
                        className={cn(
                            "relative group overflow-hidden rounded-[2rem] p-6 h-full flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer border shadow-lg", 
                            topic.colorClass
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

                        {/* Hover Arrow */}
                        <div className="mt-8 flex items-center justify-end relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
