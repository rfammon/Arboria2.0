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
        <div className="max-w-md mx-auto p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
            <div className="mb-4 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                    Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Diagnostic Mode
                </span>
            </div>

            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">
                {currentQuestion.text}
            </h3>

            <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        className={`w-full p-4 text-left border rounded-lg transition-all ${selectedOptionId === option.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/50'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                            }`}
                    >
                        {option.text}
                    </button>
                ))}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleConfirm}
                    disabled={!selectedOptionId}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isLastQuestion ? 'Finish' : 'Next'}
                    {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};
