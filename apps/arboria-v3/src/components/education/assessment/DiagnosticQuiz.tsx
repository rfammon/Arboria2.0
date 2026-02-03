import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Question {
    id: string;
    text: string;
    options: { id: string; text: string; isCorrect: boolean }[];
}

interface DiagnosticQuizProps {
    questions: Question[];
    onComplete: (result: { score: number; passed: boolean }) => void;
}

export const DiagnosticQuiz: React.FC<DiagnosticQuizProps> = ({ questions, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    const handleOptionClick = (optionId: string) => {
        if (isAnswered) return;
        setSelectedOptionId(optionId);
    };

    const traverseNext = () => {
        // Check correctness
        const option = currentQuestion.options.find(o => o.id === selectedOptionId);
        const isCorrect = option?.isCorrect ?? false;

        const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
        setCorrectCount(newCorrectCount);

        if (isLastQuestion) {
            // Calculate final score
            // Logic: Score is percentage.
            // But wait, the update is async? No, we calculated newCorrectCount locally.
            // Wait, if I'm on the last question, I need to use newCorrectCount.
            const total = questions.length;
            const percentage = Math.round((newCorrectCount / total) * 100);
            onComplete({ score: percentage, passed: percentage >= 90 });
        } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedOptionId(null);
            setIsAnswered(false);
        }
    };

    const handleConfirm = () => {
        if (!selectedOptionId) return;
        // We strictly follow the test: User clicks Answer then Next.
        // My previous logic merged them. The test says:
        // fireEvent.click(screen.getByText('Correct Answer'));
        // fireEvent.click(screen.getByText('Next'));
        // This implies selection does NOT auto-advance.

        // So:
        // 1. User selects (handled by handleOptionClick)
        // 2. User clicks Next/Finish
        traverseNext();
    };

    if (!currentQuestion) return null;

    return (
        <div className="max-w-xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-6 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-500">
                    Questão {currentIndex + 1} de {questions.length}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                    Modo Diagnóstico
                </span>
            </div>

            <h3 className="text-2xl font-black mb-8 text-slate-900 dark:text-white tracking-tight leading-tight">
                {currentQuestion.text}
            </h3>

            <div className="space-y-4 mb-10">
                {currentQuestion.options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        className={`w-full p-5 text-left border-2 rounded-2xl transition-all duration-300 font-medium ${selectedOptionId === option.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/20 shadow-lg shadow-primary/10'
                            : 'border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedOptionId === option.id ? 'border-primary bg-primary' : 'border-slate-300 dark:border-slate-700'}`}>
                                {selectedOptionId === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className={selectedOptionId === option.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}>
                                {option.text}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full mr-8 overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={!selectedOptionId}
                    className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-2xl disabled:opacity-30 disabled:grayscale transition-all hover:scale-105 active:scale-95"
                >
                    {isLastQuestion ? 'Finalizar' : 'Próximo'}
                    {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};
