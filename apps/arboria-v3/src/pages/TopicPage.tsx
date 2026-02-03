import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { InteractiveLearningExperience } from '../components/education/InteractiveLearningExperience';
import { EducationSidebar } from '../components/education/EducationSidebar';
import { TopicHeader } from '../components/education/TopicHeader';
import { EDUCATION_TOPICS } from '../data/educationTopics';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export function TopicPage() {
    const { topicId } = useParams<{ topicId: string }>();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') === 'training' ? 'training' : 'reference';
    
    const navigate = useNavigate();
    const [content, setContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get topic metadata from centralized data
    const currentTopic = EDUCATION_TOPICS.find(t => t.id === topicId);

    useEffect(() => {
        const loadContent = async () => {
            if (!topicId) return;

            try {
                setLoading(true);
                setError(null);
                
                // Construct path dynamically based on convention
                // content/topicId/index.md
                const response = await fetch(`/docs/education/content/${topicId}/index.md`);
                
                if (!response.ok) {
                    throw new Error(`Failed to load content for topic: ${topicId}`);
                }
                
                const text = await response.text();
                setContent(text);
            } catch (err) {
                console.error('Error loading topic content:', err);
                setError('Não foi possível carregar o conteúdo deste tópico. Por favor, tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [topicId]);

    if (!currentTopic && !loading) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Tópico não encontrado</AlertTitle>
                    <AlertDescription>
                        O tópico solicitado não existe ou foi movido.
                        <div className="mt-4">
                            <Button variant="outline" onClick={() => navigate('/education')}>
                                Voltar para Biblioteca
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Training Mode Layout
    if (mode === 'training') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
                <div className="container mx-auto px-4 py-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/education')} 
                        className="mb-6 gap-2 text-slate-500 hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Sair do Treinamento
                    </Button>

                    {loading ? (
                        <div className="flex h-64 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <InteractiveLearningExperience
                            content={content}
                            topicId={topicId || ''}
                            title={currentTopic?.title || 'Módulo'}
                            onComplete={() => navigate('/education')}
                            mode="training"
                        />
                    )}
                </div>
            </div>
        );
    }

    // Reference Mode Layout (with Sidebar)
    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 h-[calc(100vh-100px)]">
            {/* Sidebar Navigation - Only in Reference Mode */}
            <EducationSidebar />
            
            <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-1 h-full">
                {/* Back button for mobile */}
                <div className="lg:hidden mb-4 px-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/education')} 
                        className="gap-2 pl-0 hover:pl-2 transition-all text-slate-500 hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Button>
                </div>

                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="max-w-4xl mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-8 pb-12 px-4 lg:px-0">
                        {currentTopic && (
                            <TopicHeader 
                                topicId={topicId || ''} 
                                title={currentTopic.title} 
                                description={currentTopic.description} 
                            />
                        )}
                        
                        <InteractiveLearningExperience
                            content={content}
                            topicId={topicId || ''}
                            title={currentTopic?.title || 'Módulo'}
                            onComplete={() => navigate('/education')}
                            mode="reference"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}