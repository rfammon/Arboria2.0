import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight, Printer, Home } from 'lucide-react';
import { ContentViewer } from '../components/education/ContentViewer';

const TOPICS = [
    { id: 'concepts', title: 'Definições e Termos', file: '/docs/education/content/concepts/index.md' },
    { id: 'planning', title: 'Planejamento e Risco', file: '/docs/education/content/planning/index.md' },
    { id: 'legal', title: 'Termos Legais (ASV)', file: '/docs/education/content/legal/index.md' },
    { id: 'preparation', title: 'Preparação (Isolamento)', file: '/docs/education/content/preparation/index.md' },
    { id: 'pruning', title: 'Poda e Supressão', file: '/docs/education/content/pruning/index.md' },
    { id: 'safety', title: 'EPIs e Análise de Risco', file: '/docs/education/content/safety/index.md' },
    { id: 'waste', title: 'Resíduos (MTR)', file: '/docs/education/content/waste/index.md' },
    { id: 'glossary', title: 'Glossário Geral', file: '/docs/education/content/glossary/index.md' },
];

export default function TopicPage() {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const currentTopic = TOPICS.find(t => t.id === topicId);

    // ... (Existing logic for Generic Topics)
    const currentIndex = TOPICS.findIndex(t => t.id === topicId);
    const previousTopic = currentIndex > 0 ? TOPICS[currentIndex - 1] : null;
    const nextTopic = currentIndex < TOPICS.length - 1 ? TOPICS[currentIndex + 1] : null;

    useEffect(() => {
        if (!currentTopic) {
            setError('Tópico não encontrado');
            setLoading(false);
            return;
        }

        // Load markdown content
        setLoading(true); // Reset loading state on topic change
        fetch(currentTopic.file)
            .then(res => {
                if (!res.ok) throw new Error('Conteúdo não encontrado');
                return res.text();
            })
            .then(text => {
                setContent(text);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error loading education content:', err);
                setError('Erro ao carregar conteúdo');
                setLoading(false);
            });
    }, [topicId, currentTopic]);

    // ... (rest of the component)
    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando conteúdo...</p>
                </div>
            </div>
        );
    }

    if (error || !currentTopic) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Tópico não encontrado'}</p>
                    <Button onClick={() => navigate('/education')}>
                        Voltar aos Tópicos
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header with breadcrumbs and actions */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 print:hidden">
                <div className="max-w-3xl mx-auto px-4 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/education')}
                                className="flex-shrink-0"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                <span className="hidden xs:inline">Tópicos</span>
                            </Button>

                            <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden mr-auto">
                                <span className="hidden sm:inline">Educação</span>
                                <span className="hidden sm:inline">/</span>
                                <span className="text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">
                                    {currentTopic.title}
                                </span>
                            </nav>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto sm:ml-0">
                            <Button variant="outline" size="sm" onClick={handlePrint} className="flex-shrink-0">
                                <Printer className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Imprimir</span>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="flex-shrink-0">
                                <Home className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 pt-4 pb-8 bg-white dark:bg-white min-h-screen">
                <ContentViewer content={content} />
            </div>

            {/* Navigation Footer */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 print:hidden">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                        <div className="w-full sm:w-auto">
                            {previousTopic && (
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/education/${previousTopic.id}`)}
                                    className="w-full sm:w-auto justify-center"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    {previousTopic.title}
                                </Button>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            onClick={() => navigate('/education')}
                            className="w-full sm:w-auto"
                        >
                            Ver Todos os Tópicos
                        </Button>

                        <div className="w-full sm:w-auto">
                            {nextTopic && (
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(`/education/${nextTopic.id}`)}
                                    className="w-full sm:w-auto justify-center bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    {nextTopic.title}
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
