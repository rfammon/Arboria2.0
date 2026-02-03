import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { MicroLearningCard } from './MicroLearningCard';
import { RiskAuditMap } from '../certification/RiskAuditMap';
import { useEducationStore } from '../../../stores/useEducationStore';
import { toast } from 'sonner';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface SpecializationMissionProps {
    moduleId: string;
    title: string;
}

// Mock Content for Pruning Mission
const MISSION_CONTENT = [
    {
        id: 'step1',
        title: 'Anatomia do Corte',
        description: 'Faça o corte sempre fora do colar do galho (Branch Collar) para garantir a cicatrização correta.',
        mediaType: 'image' as const,
        mediaSrc: 'https://placehold.co/600x400/22c55e/ffffff?text=Corte+Correto' // Fallback
    },
    {
        id: 'step2',
        title: 'Equipamento de Proteção',
        description: 'Nunca opere a motosserra acima da linha dos ombros. Use sempre calça de proteção e capacete.',
        mediaType: 'video' as const,
        mediaSrc: 'https://media.w3.org/2010/05/sintel/trailer_400p.mp4' // Public sample
    }
];



export function SpecializationMission({ moduleId, title }: SpecializationMissionProps) {
    // Mock Audit Data
    const AUDIT_SCENARIO = {
        imageSrc: 'https://images.unsplash.com/photo-1542601906990-24bd0827f8d1?auto=format&fit=crop&q=80&w=1000',
        zones: [
            { id: 'h1', x: 30, y: 40, radius: 10, description: 'Galho quebrado pendurado (Widowmaker)' },
            { id: 'h2', x: 65, y: 70, radius: 12, description: 'Raízes expostas em área de tráfego' },
            { id: 'h3', x: 50, y: 20, radius: 8, description: 'Interferência com rede elétrica' }
        ]
    };

    const navigate = useNavigate();
    const { completeModule } = useEducationStore();
    const [step, setStep] = useState<'intro' | 'learning' | 'audit' | 'success'>('intro');
    const [cardIndex, setCardIndex] = useState(0);

    const handleStart = () => setStep('learning');

    const handleCardComplete = () => {
        if (cardIndex < MISSION_CONTENT.length - 1) {
            setCardIndex(cardIndex + 1);
        } else {
            setStep('audit');
        }
    };

    const handleAuditComplete = (score: number) => {
        // Must find at least 1 hazard to pass practice
        if (score > 0) {
            completeModule(moduleId, 100);
            setStep('success');
            toast.success('Missão Concluída!', { description: 'Certificação de Pruning atualizada.' });
        } else {
            toast.error('Tente novamente encontrar os riscos.');
        }
    };

    if (step === 'intro') {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tight lg:text-5xl text-slate-900 dark:text-white">{title}</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                        Bem-vindo à sua Missão de Especialização. Você aprenderá técnicas avançadas através de cards visuais e realizará uma auditoria prática.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left my-12">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardContent className="pt-6">
                            <span className="text-4xl mb-4 block">👀</span>
                            <h3 className="font-bold text-slate-900 dark:text-white">Visual First</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Aprenda observando imagens e vídeos curtos.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardContent className="pt-6">
                            <span className="text-4xl mb-4 block">⚡</span>
                            <h3 className="font-bold text-slate-900 dark:text-white">Rápido</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Conteúdo otimizado para consumo em 30 segundos.</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <CardContent className="pt-6">
                            <span className="text-4xl mb-4 block">🎯</span>
                            <h3 className="font-bold text-slate-900 dark:text-white">Prático</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Aplique o conhecimento em um cenário real.</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={() => navigate('/education')} className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <Button size="lg" onClick={handleStart} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 font-bold">
                        Iniciar Missão
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 'learning') {
        const content = MISSION_CONTENT[cardIndex];
        return (
            <div className="max-w-md mx-auto py-12 px-4 animate-in slide-in-from-right-8 duration-500">
                <div className="mb-4 text-center text-sm text-slate-500 font-bold uppercase tracking-wider">
                    Card {cardIndex + 1} de {MISSION_CONTENT.length}
                </div>
                <MicroLearningCard
                    key={content.id} // Re-mount for animation
                    {...content}
                    onComplete={handleCardComplete}
                />
            </div>
        );
    }

    if (step === 'audit') {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-700">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Desafio Prático: Identifique os Riscos</h2>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Aplique o que você aprendeu. Encontre os erros de procedimento na imagem abaixo.
                    </p>
                </div>
                {/* Reusing RiskAuditMap but in "Practice Mode" (implied logic: passing updates module) */}
                <RiskAuditMap
                    imageSrc={AUDIT_SCENARIO.imageSrc}
                    zones={AUDIT_SCENARIO.zones}
                    onComplete={(passed) => handleAuditComplete(passed ? 100 : 0)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">Missão Cumprida!</h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-md font-medium">
                Você completou o módulo <strong>{title}</strong> com sucesso e ganhou novos pontos de experiência.
            </p>
            <Button onClick={() => navigate('/education')} size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold">
                Voltar para o Hub
            </Button>
        </div>
    );
}
