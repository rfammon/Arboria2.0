import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface PresenceState {
    user_id: string;
    user_name: string;
    tree_id: string | null;
    last_active: string;
}

export type PresenceMap = Record<string, PresenceState[]>;

/**
 * Hook to manage real-time presence using Supabase Presence.
 * Tracks which users are viewing which trees.
 * 
 * @param currentTreeId - The ID of the tree the current user is viewing (optional)
 */
export function usePresence(currentTreeId: string | null = null) {
    const { user, activeInstallation } = useAuth();
    const [presences, setPresences] = useState<PresenceMap>({});

    useEffect(() => {
        if (!user || !activeInstallation) return;

        // Create a channel for the installation presence
        const channel = supabase.channel(`presence_${activeInstallation.id}`, {
            config: {
                presence: {
                    key: user.id,
                },
            },
        });

        // Handle sync event to update the state
        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const formattedPresences: PresenceMap = {};

                Object.values(state).forEach((items: any) => {
                    items.forEach((presence: PresenceState) => {
                        if (presence.tree_id) {
                            if (!formattedPresences[presence.tree_id]) {
                                formattedPresences[presence.tree_id] = [];
                            }
                            // Avoid duplicates if a user has multiple tabs
                            if (!formattedPresences[presence.tree_id].some(p => p.user_id === presence.user_id)) {
                                formattedPresences[presence.tree_id].push(presence);
                            }
                        }
                    });
                });

                setPresences(formattedPresences);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track current player state
                    await channel.track({
                        user_id: user.id,
                        user_name: user.email?.split('@')[0] || 'Unknown', // Fallback to email prefix
                        tree_id: currentTreeId,
                        last_active: new Date().toISOString(),
                    });
                }
            });

        return () => {
            channel.unsubscribe();
        };
    }, [user, activeInstallation, currentTreeId]);

    return { presences };
}
