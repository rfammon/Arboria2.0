import { Flame } from 'lucide-react';
import { useEducationStore } from '../../../stores/useEducationStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

export function StreakCounter() {
    const { streak } = useEducationStore();

    if (streak.current === 0) return null;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-950/50 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800 animate-in fade-in zoom-in duration-500">
                        <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400 fill-orange-600 dark:fill-orange-400 animate-pulse" />
                        <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                            {streak.current} {streak.current === 1 ? 'dia' : 'dias'}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Sequência de aprendizado! Continue amanhã para manter o fogo aceso.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
