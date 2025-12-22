import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export interface ScenarioOption {
    id: string;
    text: string;
    isCorrect: boolean;
    isCritical: boolean;
    feedback?: string;
}

export interface Scenario {
    id: string;
    title: string;
    description: string;
    image?: string;
    options: ScenarioOption[];
}

interface ScenarioEngineProps {
    scenarios: Scenario[];
    onComplete: (passed: boolean) => void;
}

export function ScenarioEngine({ scenarios, onComplete }: ScenarioEngineProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<ScenarioOption | null>(null);
    const [isExplained, setIsExplained] = useState(false);
    const [failedCount, setFailedCount] = useState(0);
    const [criticalFail, setCriticalFail] = useState(false);

    const currentScenario = scenarios[currentIndex];
    const isLast = currentIndex === scenarios.length - 1;

    const handleSelect = (option: ScenarioOption) => {
        if (isExplained) return;
        setSelectedOption(option);
        setIsExplained(true);

        if (!option.isCorrect) {
            setFailedCount(prev => prev + 1);
            if (option.isCritical) {
                setCriticalFail(true);
            }
        }
    };

    const handleNext = () => {
        if (criticalFail) {
            onComplete(false);
            return;
        }

        if (isLast) {
            // Logic: Pass if no critical fails and failure count < 2 (example threshold)
            // For rigorous certification, maybe 100% correct? Let's say max 1 non-critical fail allowed.
            const passed = failedCount <= 1;
            onComplete(passed);
        } else {
            setSelectedOption(null);
            setIsExplained(false);
            setCurrentIndex(prev => prev + 1);
        }
    };

    if (!currentScenario) return null;

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-lg border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-white">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-500 educational-text">
                        Cenário {currentIndex + 1} de {scenarios.length}
                    </span>
                    {criticalFail && (
                        <span className="flex items-center text-red-600 font-bold text-sm">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Falha Crítica Detectada
                        </span>
                    )}
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-gray-900">{currentScenario.title}</CardTitle>
                <CardDescription className="text-base text-gray-800 dark:text-gray-800 mt-2">
                    {currentScenario.description}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {currentScenario.image && (
                    <div className="w-full h-48 bg-gray-200 rounded-md mb-4 overflow-hidden">
                        <img src={currentScenario.image} alt="Scenario Context" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="grid gap-3">
                    {currentScenario.options.map((option) => {
                        let btnClass = "justify-start text-left h-auto py-3 px-4 border-2";
                        // Visual feedback logic
                        if (isExplained) {
                            if (option.id === selectedOption?.id) {
                                btnClass += option.isCorrect
                                    ? " border-green-500 bg-green-50 text-green-700 hover:bg-green-50"
                                    : " border-red-500 bg-red-50 text-red-700 hover:bg-red-50";
                            } else if (option.isCorrect && selectedOption && !selectedOption.isCorrect) {
                                // Show correct answer if wrong was picked
                                btnClass += " border-green-500 border-dashed opacity-70";
                            } else {
                                btnClass += " opacity-50";
                            }
                        } else {
                            btnClass += " hover:border-blue-300 hover:bg-blue-50";
                        }

                        return (
                            <Button
                                key={option.id}
                                variant="outline"
                                className={btnClass}
                                onClick={() => handleSelect(option)}
                                disabled={isExplained}
                            >
                                <div className="flex items-center w-full">
                                    {isExplained && option.id === selectedOption?.id && (
                                        <span className="mr-2">
                                            {option.isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </span>
                                    )}
                                    <span>{option.text}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>

                {isExplained && (
                    <div className={`p-4 rounded-md mt-4 animate-in fade-in slide-in-from-top-2 ${selectedOption?.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <p className="font-semibold mb-1">
                            {selectedOption?.isCorrect ? 'Correto!' : 'Incorreto'}
                        </p>
                        <p>{selectedOption?.feedback || (selectedOption?.isCorrect ? "Boa escolha. Essa é a ação mais segura." : "Essa ação apresenta riscos.")}</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex justify-end pt-4">
                {isExplained && (
                    <Button onClick={handleNext} size="lg" className={criticalFail ? "bg-red-600 hover:bg-red-700" : ""}>
                        {criticalFail ? "Ver Resultado" : (isLast ? "Finalizar" : "Continuar")}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
