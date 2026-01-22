import type { PresenceState } from '../../hooks/usePresence';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';

interface PresenceBadgeProps {
    users: PresenceState[];
    className?: string;
}

export function PresenceBadge({ users, className }: PresenceBadgeProps) {
    if (users.length === 0) return null;

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative flex items-center h-6">
                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-background z-10" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter mr-1 ml-2">
                    LIVE
                </span>

                <TooltipProvider>
                    <div className="flex -space-x-2 overflow-hidden px-1">
                        {users.slice(0, 3).map((u, i) => (
                            <Tooltip key={u.user_id + i}>
                                <TooltipTrigger asChild>
                                    <Avatar className="h-6 w-6 border-2 border-background ring-0 shadow-sm transition-transform hover:scale-110 hover:z-20">
                                        <AvatarFallback className="text-[9px] font-bold bg-primary text-primary-foreground">
                                            {u.user_name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="text-xs font-medium">{u.user_name} está vendo esta árvore</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}

                        {users.length > 3 && (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-background bg-muted text-[8px] font-bold text-muted-foreground z-10">
                                +{users.length - 3}
                            </div>
                        )}
                    </div>
                </TooltipProvider>
            </div>
        </div>
    );
}
