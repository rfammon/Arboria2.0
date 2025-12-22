import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEducationStore } from '../stores/useEducationStore';
import { ScenarioEngine, type Scenario } from '../components/education/certification/ScenarioEngine';
import { RiskAuditMap, type HazardZone } from '../components/education/certification/RiskAuditMap';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { ShieldAlert, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

// Certification Content Data
const CERTIFICATION_SCENARIOS: Scenario[] = [
    {
        id: 's1',
        title: 'Cenário 1: Linha de Vida',
        description: 'Você identifica que sua corda principal tem um pequeno desgaste na capa, mas o núcleo parece intacto. O cliente está pressionando pelo fim do serviço.',
        options: [
            { id: 'a', text: 'Continuar usando, pois o núcleo está bom', isCorrect: false, isCritical: true, feedback: 'CRÍTICO: Nunca use cordas com capa danificada em operações de risco de vida.' },
            { id: 'b', text: 'Substituir a corda imediatamente', isCorrect: true, isCritical: false, feedback: 'Correto. A segurança do equipamento é inegociável.' },
            { id: 'c', text: 'Isolar a parte danificada com fita e usar', isCorrect: false, isCritical: true, feedback: 'CRÍTICO: Fita não restaura a integridade estrutural da corda.' }
        ]
    },
    {
        id: 's2',
        title: 'Cenário 2: Zona de Exclusão',
        description: 'Um pedestre ignora os cones e entra na zona de queda enquanto você está serrando um galho.',
        options: [
            { id: 'a', text: 'Gritar e continuar serrando rápido', isCorrect: false, isCritical: true, feedback: 'CRÍTICO: Nunca opere com pessoas na zona de risco.' },
            { id: 'b', text: 'Parar a operação imediatamente e aguardar a saída', isCorrect: true, isCritical: false, feedback: 'Correto. Pare tudo até que a área esteja segura.' }
        ]
    }
];

const CERTIFICATION_ZONES: HazardZone[] = [
    { id: 'z1', x: 20, y: 75, radius: 5, description: 'Sem EPI (Luvas)' },
    { id: 'z2', x: 55, y: 30, radius: 4, description: 'Escada mal posicionada' },
    { id: 'z3', x: 80, y: 15, radius: 6, description: 'Galho suspenso (Risco de queda)' }
];

export default function Certification() {
    const navigate = useNavigate();
    const { startCertification, failCertification, grantCertification, certificationStatus } = useEducationStore();
    const [step, setStep] = useState<'intro' | 'scenarios' | 'audit' | 'result'>('intro');
    const [auditPassed, setAuditPassed] = useState(false);
    const [scenarioPassed, setScenarioPassed] = useState(false);

    // Initial check
    if (certificationStatus === 'certified') {
        return (
            <div className="container mx-auto p-6 max-w-4xl text-center">
                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-green-800">Você já possui Certificação de Campo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-6 text-gray-700">Seu acesso às missões especializadas está liberado.</p>
                        <Button onClick={() => navigate('/education')} className="bg-green-700 text-white">
                            Voltar ao Menu
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleStart = () => {
        startCertification();
        setStep('scenarios');
    };

    const handleScenarioComplete = (passed: boolean) => {
        setScenarioPassed(passed);
        if (passed) {
            setStep('audit');
        } else {
            failCertification();
            setStep('result');
        }
    };

    const handleAuditComplete = (passed: boolean) => {
        setAuditPassed(passed);
        if (passed) {
            grantCertification();
        } else {
            failCertification();
        }
        setStep('result');
    };

    if (step === 'intro') {
        return (
            <div className="container mx-auto p-6 max-w-4xl educational-content">
                <Card className="bg-white dark:bg-white">
                    <CardHeader>
                        <ShieldAlert className="w-12 h-12 text-blue-600 mb-2" />
                        <CardTitle className="text-2xl text-gray-900 dark:text-gray-900">Certificação Prática Virtual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-gray-800 dark:text-gray-800">
                            Esta avaliação decidirá se você está apto para missões especializadas.
                            Ela consiste em duas etapas:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-800 dark:text-gray-800">
                            <li><strong className="text-gray-900 dark:text-gray-900">Etapa 1: Tomada de Decisão</strong> (Cenários Críticos) - Erros graves reprovam imediatamente.</li>
                            <li><strong className="text-gray-900 dark:text-gray-900">Etapa 2: Auditoria Visual</strong> (Identificação de Riscos) - Você deve encontrar todos os riscos na imagem.</li>
                        </ul>
                        <div className="pt-6">
                            <Button onClick={handleStart} size="lg" className="w-full md:w-auto">
                                Iniciar Certificação <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (step === 'scenarios') {
        return (
            <div className="container mx-auto p-6">
                <ScenarioEngine
                    scenarios={CERTIFICATION_SCENARIOS}
                    onComplete={handleScenarioComplete}
                />
            </div>
        );
    }

    if (step === 'audit') {
        return (
            <div className="container mx-auto p-6">
                <RiskAuditMap
                    // Use a placeholder image or a real one if available. 
                    imageSrc="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop"
                    zones={CERTIFICATION_ZONES}
                    onComplete={handleAuditComplete}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl text-center educational-content">
            <Card className="bg-white dark:bg-white">
                <CardHeader>
                    {scenarioPassed && auditPassed ? (
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-in zoom-in" />
                    ) : (
                        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4 animate-in zoom-in" />
                    )}
                    <CardTitle className="text-3xl text-gray-900 dark:text-gray-900">
                        {scenarioPassed && auditPassed ? "Certificação Aprovada!" : "Reprovado"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {scenarioPassed && auditPassed ? (
                        <>
                            <p className="text-lg text-gray-800 dark:text-gray-800">
                                Parabéns! Você demonstrou competência técnica e consciência de segurança.
                                As missões de especialização foram desbloqueadas.
                            </p>
                            <Button size="lg" onClick={() => navigate('/education')} className="bg-green-600 hover:bg-green-700">
                                Acessar Menu Principal
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-lg text-gray-800 dark:text-gray-800">
                                Infelizmente você não atingiu os critérios de segurança necessários.
                                {!scenarioPassed && " Você cometeu erros críticos na tomada de decisão."}
                                {scenarioPassed && !auditPassed && " Você falhou na identificação visual de riscos."}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-700">Revise o módulo de Segurança Core e tente novamente.</p>
                            <div className="flex justify-center gap-4">
                                <Button variant="outline" onClick={() => navigate('/education')}>
                                    Voltar aos Estudos
                                </Button>
                                <Button onClick={() => setStep('intro')}>
                                    Tentar Novamente
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
