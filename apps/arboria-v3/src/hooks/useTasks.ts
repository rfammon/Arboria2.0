import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Task } from '../types/execution';

export const useTasks = () => {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            // Fetch tasks assigned to current user (or all for now per RLS)
            const { data, error } = await supabase
                .from('tasks')
                .select(`
          *,
          tree:trees(*)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Task[];
        }
    });
};
