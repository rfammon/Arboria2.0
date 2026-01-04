import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Book, ClipboardList, FileText, AlertTriangle, Scissors, HardHat, Recycle, BookOpen } from 'lucide-react';
import { EducationSearch } from '../components/education/EducationSearch';
import { cn } from '../lib/utils';


export default function Education() {
    const navigate = useNavigate();

    const topics = [
        {
            id: 'concepts',
            title: 'Definições e Termos',
            description: 'Conceitos fundamentais e terminologia técnica',
            icon: Book,
            bgColor: 'bg-blue-100',
            color: 'text-blue-600',
            accentColor: 'bg-blue-500'
        },
        {
            id: 'planning',
            title: 'Planejamento e Risco',
            description: 'Técnicas de planejamento e avaliação de risco',
            icon: ClipboardList,
            bgColor: 'bg-green-100',
            color: 'text-green-600',
            accentColor: 'bg-green-500'
        },
        {
            id: 'legal',
            title: 'Termos Legais (ASV)',
            description: 'Documentação legal e autorizações necessárias',
            icon: FileText,
            bgColor: 'bg-amber-100',
            color: 'text-amber-600',
            accentColor: 'bg-amber-500'
        },
        {
            id: 'preparation',
            title: 'Preparação (Isolamento)',
            description: 'Procedimentos de preparação e segurança',
            icon: AlertTriangle,
            bgColor: 'bg-red-100',
            color: 'text-red-600',
            accentColor: 'bg-red-500'
        },
        {
            id: 'pruning',
            title: 'Poda e Supressão',
            description: 'Técnicas de poda e supressão de árvores',
            icon: Scissors,
            bgColor: 'bg-indigo-100',
            color: 'text-indigo-600',
            accentColor: 'bg-indigo-500'
        },
        {
            id: 'safety',
            title: 'EPIs e Análise de Risco',
            description: 'Equipamentos de proteção e análise de risco',
            icon: HardHat,
            bgColor: 'bg-yellow-100',
            color: 'text-yellow-600',
            accentColor: 'bg-yellow-500'
        },
        {
            id: 'waste',
            title: 'Resíduos (MTR)',
            description: 'Gestão de resíduos e materiais',
            icon: Recycle,
            bgColor: 'bg-emerald-100',
            color: 'text-emerald-600',
            accentColor: 'bg-emerald-500'
        },
        {
            id: 'glossary',
            title: 'Glossário Geral',
            description: 'Definições e termos técnicos',
            icon: BookOpen,
            bgColor: 'bg-slate-100',
            color: 'text-slate-600',
            accentColor: 'bg-slate-500'
        },
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight font-display">Educação & <span className="text-primary italic">Treinamento</span></h1>
                    <p className="text-muted-foreground font-medium mt-1">Recursos e conteúdos para sua formação técnica em manejo florestal</p>
                </div>
                <div className="flex flex-col md:flex-row items-end gap-3 w-full md:w-auto">
                    <Button variant="outline" onClick={() => navigate('/')}>
                        Voltar ao Menu
                    </Button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-center py-2">
                <EducationSearch />
            </div>

            <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {topics.map((topic) => (
                        <Card
                            key={topic.id}
                            className="bg-card/70 backdrop-blur-md border-white/10 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-deep)] hover:-translate-y-1.5 transition-all cursor-pointer group overflow-hidden border-t-0"
                            onClick={() => navigate(`/education/${topic.id}`)}
                        >
                            <div className={cn("absolute top-0 left-0 w-full h-1.5", topic.accentColor)} />
                            <CardHeader className="space-y-1 pb-2">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-sm transition-transform group-hover:scale-110", topic.bgColor)}>
                                    <topic.icon className={cn("w-6 h-6", topic.color)} />
                                </div>
                                <CardTitle className="text-lg font-bold tracking-tight">{topic.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm font-medium opacity-80 leading-relaxed">
                                    {topic.description}
                                </CardDescription>
                                <div className="mt-6 flex items-center text-xs font-bold text-primary gap-1 group-hover:gap-2 transition-all">
                                    ACESSAR CONTEÚDO
                                    <BookOpen className="w-3 h-3" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
