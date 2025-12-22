import { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Play } from 'lucide-react';

interface MicroLearningCardProps {
    title: string;
    description: string;
    mediaType: 'image' | 'video';
    mediaSrc: string;
    onComplete: () => void;
}

export function MicroLearningCard({ title, description, mediaType, mediaSrc, onComplete }: MicroLearningCardProps) {
    const [canAdvance, setCanAdvance] = useState(mediaType === 'image');

    useEffect(() => {
        if (mediaType === 'video') {
            const timer = setTimeout(() => {
                setCanAdvance(true);
            }, 5000); // Force 5s watch time
            return () => clearTimeout(timer);
        }
    }, [mediaType]);

    return (
        <Card className="w-full max-w-sm h-[600px] flex flex-col overflow-hidden mx-auto shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-blue-100">
            {/* Visual-First Area (approx 70% height) */}
            <div className="relative h-[70%] bg-black">
                {mediaType === 'image' ? (
                    <img src={mediaSrc} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 group cursor-pointer">
                        {/* Placeholder for real video player */}
                        <video src={mediaSrc} className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-16 h-16 text-white opacity-80" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content Area (approx 30%) */}
            <div className="h-[30%] flex flex-col justify-between p-5 bg-white dark:bg-slate-900">
                <div>
                    <h3 className="text-xl font-bold leading-tight mb-2 text-gray-900 dark:text-gray-100">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                        {description}
                    </p>
                </div>

                <Button
                    onClick={onComplete}
                    disabled={!canAdvance}
                    className="w-full mt-4 bg-primary hover:bg-primary/90"
                >
                    {canAdvance ? 'Continuar' : 'Aguarde...'}
                </Button>
            </div>
        </Card>
    );
}
