
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function useRealtime() {
    const { activeInstallation } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!activeInstallation) return;

        const channel = supabase.channel(`installation_${activeInstallation.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `installation_id=eq.${activeInstallation.id}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newNotif = payload.new as any;
                        // Check if it belongs to current user? Realtime usually broadcasts unless 'broadcast' is used or RLS works with subscription tokens.
                        // Standard supabase realtime: "If the table has RLS enabled, clients will only receive changes for rows they are allowed to see"
                        // So we should be good if we authenticated the socket.

                        toast(newNotif.title, {
                            description: newNotif.message,
                        });
                    }
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsConnected(true);
                if (status === 'CHANNEL_ERROR') setIsConnected(false);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeInstallation]);

    return { isConnected };
}
