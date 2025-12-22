import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { TRAQRiskCriteria } from '../types/traq';
import { DEFAULT_TRAQ_CRITERIA } from '../lib/traq/defaultCriteria';

/**
 * Hook para buscar critérios TRAQ do banco de dados
 */
export function useTRAQCriteria() {
    const [criteria, setCriteria] = useState<TRAQRiskCriteria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchCriteria() {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('traq_risk_criteria')
                    .select('*')
                    .eq('ativo', true)
                    .order('ordem');

                if (fetchError) {
                    console.warn('Error fetching TRAQ criteria, using defaults:', fetchError);
                    // Não lança erro, usa fallback
                    setCriteria(DEFAULT_TRAQ_CRITERIA);
                } else if (!data || data.length === 0) {
                    console.warn('No TRAQ criteria found in DB, using defaults');
                    setCriteria(DEFAULT_TRAQ_CRITERIA);
                } else {
                    setCriteria(data);
                }
            } catch (err) {
                console.error('Unexpected error fetching TRAQ criteria, using defaults:', err);
                setCriteria(DEFAULT_TRAQ_CRITERIA);
                // Não define erro global para não quebrar a UI
            } finally {
                setLoading(false);
            }
        }

        fetchCriteria();
    }, []);

    return { criteria, loading, error };
}
