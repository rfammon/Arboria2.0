import { useState, useEffect } from 'react';
import type { InterventionPlan } from '../types/plan';

export function usePlanConflicts(
    scheduleStart: string | undefined,
    responsibleName: string | undefined,
    selectedTreeId: string | undefined,
    existingPlans: InterventionPlan[] | undefined,
    isEdit: boolean,
    currentPlanId?: string
) {
    const [conflictWarning, setConflictWarning] = useState<string | null>(null);

    useEffect(() => {
        if (!scheduleStart || !existingPlans) {
            setConflictWarning(null);
            return;
        }

        const date = new Date(scheduleStart);
        date.setHours(0, 0, 0, 0);

        // Check for conflicts
        const conflicts = existingPlans.filter(p => {
            // Skip current plan if editing
            if (isEdit && currentPlanId && p.id === currentPlanId) return false;

            const pDateStr = p.schedule.start || p.schedule.startDate;
            if (!pDateStr) return false;

            const pDate = new Date(pDateStr);
            pDate.setHours(0, 0, 0, 0);

            if (pDate.getTime() !== date.getTime()) return false;

            // Check responsible conflict
            if (responsibleName && p.responsible &&
                p.responsible.toLowerCase() === responsibleName.toLowerCase()) {
                return true;
            }

            // Check tree conflict
            if (selectedTreeId && p.tree_id === selectedTreeId) {
                return true;
            }

            return false;
        });

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            if (conflict.tree_id === selectedTreeId) {
                setConflictWarning(`Atenção: Já existe um plano (${conflict.plan_id}) para esta árvore nesta data.`);
            } else {
                setConflictWarning(`Atenção: O responsável ${conflict.responsible} já tem outro plano (${conflict.plan_id}) nesta data.`);
            }
        } else {
            setConflictWarning(null);
        }

    }, [scheduleStart, responsibleName, selectedTreeId, existingPlans, isEdit, currentPlanId]);

    return conflictWarning;
}
