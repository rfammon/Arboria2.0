import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { InterventionPlan, PlanFormData } from '../types/plan';
import { useAuth } from '../context/AuthContext';
import { calculatePlanStats } from '../lib/planUtils';

export interface UsePlansReturn {
    plans: InterventionPlan[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    createPlan: (data: PlanFormData) => Promise<InterventionPlan | null>;
    updatePlan: (id: string, data: Partial<PlanFormData>) => Promise<InterventionPlan | null>;
    deletePlan: (id: string) => Promise<boolean>;
    getPlanById: (id: string) => Promise<InterventionPlan | null>;
}

export function usePlans(): UsePlansReturn {
    const { activeInstallation } = useAuth();
    const queryClient = useQueryClient();

    const { data: plans = [], isLoading: loading, error: queryError, refetch } = useQuery({
        queryKey: ['plans', activeInstallation?.id],
        queryFn: async () => {
            if (!activeInstallation?.id) return [];

            const { data, error } = await supabase
                .from('intervention_plans')
                .select('*, tree:arvores(id, especie, local, risklevel, latitude, longitude), work_orders(id, status, tasks(progress_percent))')
                .eq('instalacao_id', activeInstallation.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as any || [];
        },
        enabled: !!activeInstallation?.id,
    });

    const createPlan = async (formData: PlanFormData): Promise<InterventionPlan | null> => {
        if (!activeInstallation?.id) return null;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const newPlan = {
                instalacao_id: activeInstallation.id,
                user_id: user.id,
                intervention_type: formData.intervention_type,
                tree_id: formData.tree_id,
                schedule: formData.schedule,
                justification: formData.justification || null,
                responsible: formData.responsible || null,
                responsible_title: formData.responsible_title || null,
                techniques: formData.techniques || [],
                tools: formData.tools || [],
                epis: formData.epis || [],
                team_composition: formData.team_composition || null,
                durations: formData.durations || null,
            };

            const { data, error } = await supabase
                .from('intervention_plans')
                .insert(newPlan)
                .select('*, tree:arvores(id, especie, codigo, local, latitude, longitude)')
                .single();

            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['plans', activeInstallation.id] });
            return data as any;
        } catch (err) {
            console.error('Error creating plan:', err);
            return null;
        }
    };

    const updatePlan = async (id: string, formData: Partial<PlanFormData>): Promise<InterventionPlan | null> => {
        try {
            const { data, error } = await supabase
                .from('intervention_plans')
                .update(formData)
                .eq('id', id)
                .select('*, tree:arvores(id, especie, codigo, local, latitude, longitude)')
                .single();

            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['plans', activeInstallation?.id] });
            return data as any;
        } catch (err) {
            console.error('Error updating plan:', err);
            return null;
        }
    };

    const deletePlan = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('intervention_plans')
                .delete()
                .eq('id', id);

            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['plans', activeInstallation?.id] });
            return true;
        } catch (err) {
            console.error('Error deleting plan:', err);
            return false;
        }
    };

    const getPlanById = async (id: string): Promise<InterventionPlan | null> => {
        try {
            const { data, error } = await supabase
                .from('intervention_plans')
                .select('*, tree:arvores(id, especie, codigo, local, latitude, longitude)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as any;
        } catch (err) {
            console.error('Error fetching plan:', err);
            return null;
        }
    };

    return {
        plans,
        loading,
        error: queryError ? (queryError as Error).message : null,
        refetch: () => refetch(),
        createPlan,
        updatePlan,
        deletePlan,
        getPlanById
    };
}


/**
 * Hook to calculate plan statistics
 */
export function usePlanStats(plans: InterventionPlan[]) {
    const [stats, setStats] = useState<ReturnType<typeof calculatePlanStats>>({
        totalPlans: 0,
        pendingInterventions: 0,
        thisWeek: 0,
        thisMonth: 0,
        byType: {
            poda: 0,
            supressao: 0,
            transplante: 0,
            tratamento: 0,
            monitoramento: 0
        }
    });

    useEffect(() => {
        setStats(calculatePlanStats(plans));
    }, [plans]);

    return stats;
}
