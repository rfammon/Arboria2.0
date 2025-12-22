import { useEducationStore } from '../stores/useEducationStore';

export const useEducationGuard = () => {
    const { modules } = useEducationStore();

    const isModuleComplete = (id: string) => {
        const mod = modules[id];
        return mod?.status === 'completed' || mod?.status === 'tested_out';
    };

    const canAccess = (moduleId: string): boolean => {
        // Safety is always accessible (Core)
        if (moduleId === 'safety') return true;
        if (moduleId === 'concepts') return true; // Assuming concepts is free

        // Advanced modules require Safety
        const safetyComplete = isModuleComplete('safety');

        if (moduleId === 'pruning' || moduleId === 'risk' || moduleId === 'sim_certification') {
            return safetyComplete;
        }

        // Default strict
        return false;
    };

    return { canAccess };
};
