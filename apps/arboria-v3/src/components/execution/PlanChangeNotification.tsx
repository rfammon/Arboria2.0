import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

export function PlanChangeNotification() {
    const [hasChanges, setHasChanges] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        // Subscribe to changes in tasks table
        // We focus on tasks because that's where assignment/creation happens mostly
        // Also could listen to intervention_plans if structure changes
        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks'
                },
                (payload) => {
                    console.log('Change received!', payload);
                    // Check if modification affects current user or generic list
                    // Simplified: just show "updates available"
                    setHasChanges(true);

                    // Optional: show toast immediately
                    // toast('Dados atualizados no servidor.');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleRefresh = async () => {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        await queryClient.invalidateQueries({ queryKey: ['execution-stats'] });
        setHasChanges(false);
        toast.success('Dados atualizados!');
    };

    if (!hasChanges) return null;

    return (
        <div className="fixed top-20 right-4 z-50 bg-background/95 backdrop-blur border border-yellow-500/50 shadow-lg rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <div className="text-sm font-medium">
                Mudanças detectadas no plano
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Atualizar
            </Button>
        </div>
    );
}
