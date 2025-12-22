import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Lock, Scissors, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import type { ModuleStatus } from '../../../stores/useEducationStore';

interface SpecializationNavigatorProps {
    modules: Record<string, { id: string; status: ModuleStatus; score: number }>;
    isCertified: boolean;
    onSelectTrack?: (trackId: string) => void; // Optional for testing/internal nav
}

const SPECIALIZATIONS = [
    {
        id: 'pruning',
        title: 'Poda Especializada',
        description: 'Técnicas avançadas de corte e saúde arbórea.',
        icon: Scissors,
        color: 'text-green-600',
        bg: 'bg-green-100'
    },
    {
        id: 'ops',
        title: 'Operações de Risco',
        description: 'Gerenciamento de zonas de queda e maquinário pesado.',
        icon: Zap, // Using Zap for "Power/Risk" metaphor or AlertTriangle
        color: 'text-orange-600',
        bg: 'bg-orange-100'
    },
    {
        id: 'risk',
        title: 'Análise de Risco Avançada',
        description: 'Auditoria técnica e relatórios de segurança.',
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-100'
    }
];

export function SpecializationNavigator({ modules, isCertified, onSelectTrack }: SpecializationNavigatorProps) {
    const navigate = useNavigate();

    const handleSelect = (id: string) => {
        if (onSelectTrack) {
            onSelectTrack(id);
        } else {
            // Default navigation behavior
            // navigate(`/education/specialization/${id}`); // Future route
            console.log('Navigating to track:', id);
        }
    };

    return (
        <Card className="relative overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-white">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-900">
                    <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    Missões Especializadas
                </CardTitle>
                <CardDescription className="text-gray-800 dark:text-gray-800">
                    Trilhas avançadas desbloqueadas após a certificação.
                </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-3">
                {SPECIALIZATIONS.map((spec) => {
                    const moduleState = modules[spec.id];
                    const isUnlocked = isCertified && moduleState?.status !== 'locked';

                    return (
                        <div
                            key={spec.id}
                            onClick={() => isUnlocked && handleSelect(spec.id)}
                            className={`
                                group relative p-4 rounded-xl border-2 transition-all cursor-pointer
                                ${isUnlocked
                                    ? 'border-slate-100 hover:border-blue-300 hover:shadow-md bg-white dark:bg-slate-900'
                                    : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed grayscale'}
                            `}
                        >
                            <div className={`w-12 h-12 rounded-full ${spec.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                <spec.icon className={`w-6 h-6 ${spec.color}`} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-900 mb-1">{spec.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-500 leading-tight">
                                {spec.description}
                            </p>

                            {isUnlocked && (
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-5 h-5 text-blue-500" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </CardContent>

            {/* Locked Overlay */}
            {!isCertified && (
                <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-full shadow-2xl mb-4 animate-in zoom-in duration-300">
                        <Lock className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-800 mb-2">
                        Especializações Bloqueadas
                    </h3>
                    <p className="text-slate-600 dark:text-slate-600 max-w-md mb-6">
                        Você precisa completar a <strong className="text-gray-900 dark:text-gray-900">Certificação de Campo</strong> (Epic 3) para acessar estas missões avançadas.
                    </p>
                    <Button onClick={() => navigate('/education/certification')} size="lg" className="shadow-lg">
                        Ir para Certificação
                    </Button>
                </div>
            )}
        </Card>
    );
}
