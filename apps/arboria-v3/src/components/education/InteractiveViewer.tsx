import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { ContentViewer } from './ContentViewer';
import { cn } from '../../lib/utils';

interface InteractiveViewerProps {
    content: string;
    title: string;
    onComplete: () => void;
}

export function InteractiveViewer({ content, title, onComplete }: InteractiveViewerProps) {
    const [currentSection, setCurrentSection] = useState(0);
    const [progress, setProgress] = useState(0);

    // Split content into sections based on H2 headers
    const sections = useMemo(() => {
        if (!content) return [];
        
        // Split by "## " but keep the delimiter to re-add it or just handle it
        // Regex lookahead might be complex, simple split is easier
        const parts = content.split('\n## ');
        
        return parts.map((part, index) => {
            // Re-add "## " for all except the first one if it didn't have it (intro)
            // If the content starts with "## ", the first part is empty string
            if (index === 0 && !content.startsWith('## ')) {
                return part;
            }
            return '## ' + part;
        }).filter(part => part.trim().length > 0);
    }, [content]);

    useEffect(() => {
        if (sections.length > 0) {
            setProgress(((currentSection + 1) / sections.length) * 100);
        }
    }, [currentSection, sections.length]);

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            setCurrentSection(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentSection > 0) {
            setCurrentSection(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleComplete = () => {
        onComplete();
    };

    if (sections.length === 0) return null;

    return (
        <div className="flex flex-col min-h-[calc(100vh-12rem)]">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-gray-100 dark:bg-gray-800">
                <motion.div 
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Section Counter (Floating or fixed) */}
            <div className="mb-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{title}</span>
                <span>Parte {currentSection + 1} de {sections.length}</span>
            </div>

            {/* Content Area */}
            <div className="flex-grow relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="pb-20"
                    >
                        <ContentViewer content={sections[currentSection]} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-center items-center gap-4 z-40">
                <div className="w-full max-w-3xl flex justify-between items-center px-4">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentSection === 0}
                        className={cn("transition-opacity", currentSection === 0 ? "opacity-0 pointer-events-none" : "opacity-100")}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Anterior
                    </Button>

                    <Button 
                        onClick={handleNext}
                        size="lg"
                        className={cn(
                            "min-w-[140px] shadow-lg transition-all transform active:scale-95",
                            currentSection === sections.length - 1 
                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                : "bg-primary hover:bg-primary/90"
                        )}
                    >
                        {currentSection === sections.length - 1 ? (
                            <>
                                Concluir Módulo
                                <CheckCircle className="h-4 w-4 ml-2" />
                            </>
                        ) : (
                            <>
                                Continuar
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
