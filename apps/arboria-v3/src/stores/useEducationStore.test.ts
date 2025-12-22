import { describe, it, expect, beforeEach } from 'vitest';
import { useEducationStore } from './useEducationStore';

describe('useEducationStore', () => {
    beforeEach(() => {
        useEducationStore.setState({
            modules: {
                'safety': { id: 'safety', status: 'available', score: 0 },
                'pruning': { id: 'pruning', status: 'locked', score: 0 }
            },
            isHighContrast: false
        });
    });

    it('should update module status to completed', () => {
        const { completeModule } = useEducationStore.getState();

        completeModule('safety', 85);

        const state = useEducationStore.getState();
        expect(state.modules['safety'].status).toBe('completed');
        expect(state.modules['safety'].score).toBe(85);
    });

    it('should update module status to tested_out if passed', () => {
        const { completeModule } = useEducationStore.getState();

        // Simulating "Test Out"
        completeModule('safety', 95, true);

        const state = useEducationStore.getState();
        expect(state.modules['safety'].status).toBe('tested_out');
        expect(state.modules['safety'].score).toBe(95);
    });

    it('should toggle high contrast mode', () => {
        const store = useEducationStore.getState();
        expect(store.isHighContrast).toBe(false); // Default

        store.toggleHighContrast();
        expect(useEducationStore.getState().isHighContrast).toBe(true);

        store.toggleHighContrast();
        expect(useEducationStore.getState().isHighContrast).toBe(false);
    });
});
