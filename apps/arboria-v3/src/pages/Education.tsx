import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Book, ClipboardList, FileText, AlertTriangle, Scissors, HardHat, Recycle, BookOpen } from 'lucide-react';
import { EducationSearch } from '../components/education/EducationSearch';

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
        },
        {
            id: 'planning',
            title: 'Planejamento e Risco',
            description: 'Técnicas de planejamento e avaliação de risco',
            icon: ClipboardList,
            bgColor: 'bg-green-100',
            color: 'text-green-600',
        },
        {
            id: 'legal',
            title: 'Termos Legais (ASV)',
            description: 'Documentação legal e autorizações necessárias',
            icon: FileText,
            bgColor: 'bg-amber-100',
            color: 'text-amber-600',
        },
        {
            id: 'preparation',
            title: 'Preparação (Isolamento)',
            description: 'Procedimentos de preparação e segurança',
            icon: AlertTriangle,
            bgColor: 'bg-red-100',
            color: 'text-red-600',
        },
        {
            id: 'pruning',
            title: 'Poda e Supressão',
            description: 'Técnicas de poda e supressão de árvores',
            icon: Scissors,
            bgColor: 'bg-indigo-100',
            color: 'text-indigo-600',
        },
        {
            id: 'safety',
            title: 'EPIs e Análise de Risco',
            description: 'Equipamentos de proteção e análise de risco',
            icon: HardHat,
            bgColor: 'bg-yellow-100', // Legacy uses Yellow/Orange for safety
            color: 'text-yellow-600',
        },
        {
            id: 'waste',
            title: 'Resíduos (MTR)',
            description: 'Gestão de resíduos e materiais',
            icon: Recycle,
            bgColor: 'bg-emerald-100',
            color: 'text-emerald-600',
        },
        {
            id: 'glossary',
            title: 'Glossário Geral',
            description: 'Definições e termos técnicos',
            icon: BookOpen,
            bgColor: 'bg-slate-100',
            color: 'text-slate-600',
        },
    ];

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Educação e Treinamento</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm sm:text-base">Recursos e conteúdos para sua formação técnica em manejo florestal</p>
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
                            className="hover:shadow-md transition-shadow cursor-pointer border-t-4"
                            style={{ borderTopColor: 'currentColor' }}
                            onClick={() => navigate(`/education/${topic.id}`)}
                        >
                            <CardHeader className="space-y-1 pb-2">
                                <div className={`w-10 h-10 rounded-lg ${topic.bgColor} flex items-center justify-center mb-2`}>
                                    <topic.icon className={`w-5 h-5 ${topic.color}`} />
                                </div>
                                <CardTitle className="text-lg font-semibold">{topic.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm">
                                    {topic.description}
                                </CardDescription>
                                <Button
                                    variant="ghost"
                                    className="w-full mt-4 text-xs font-medium border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Acessar
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}
