import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEducationStore } from './useEducationStore';

describe('useEducationStore', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useEducationStore.setState({
            modules: {
                'safety': { id: 'safety', status: 'available', score: 0, currentCardIndex: 0 },
                'pruning': { id: 'pruning', status: 'locked', score: 0, currentCardIndex: 0 },
                'ops': { id: 'ops', status: 'locked', score: 0, currentCardIndex: 0 },
                'risk': { id: 'risk', status: 'locked', score: 0, currentCardIndex: 0 }
            },
            certificationStatus: 'idle',
            streak: { current: 0, lastActivityDate: null },
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

    describe('Certification & Progress', () => {
        it('should unlock specific modules when certification is granted', () => {
            const { grantCertification } = useEducationStore.getState();

            grantCertification();

            const state = useEducationStore.getState();
            expect(state.certificationStatus).toBe('certified');
            expect(state.modules['ops'].status).toBe('available');
            expect(state.modules['risk'].status).toBe('available');
            expect(state.modules['pruning'].status).toBe('available');
        });

        it('should update module progress', () => {
            const { updateModuleProgress } = useEducationStore.getState();
            updateModuleProgress('safety', 5);

            expect(useEducationStore.getState().modules['safety'].currentCardIndex).toBe(5);
        });
    });

    describe('Streak Logic', () => {
        it('should start a streak on first activity', () => {
            const date = new Date('2025-01-01T12:00:00Z');
            vi.setSystemTime(date);

            useEducationStore.getState().updateStreak();

            const { streak } = useEducationStore.getState();
            expect(streak.current).toBe(1);
            expect(streak.lastActivityDate).toBe('2025-01-01');
        });

        it('should increment streak on consecutive days', () => {
            useEducationStore.setState({
                streak: { current: 1, lastActivityDate: '2025-01-01' }
            });

            const date = new Date('2025-01-02T12:00:00Z');
            vi.setSystemTime(date);

            useEducationStore.getState().updateStreak();

            const { streak } = useEducationStore.getState();
            expect(streak.current).toBe(2);
            expect(streak.lastActivityDate).toBe('2025-01-02');
        });

        it('should reset streak if a day is missed', () => {
            useEducationStore.setState({
                streak: { current: 5, lastActivityDate: '2025-01-01' }
            });

            const date = new Date('2025-01-03T12:00:00Z'); // Missed Jan 2
            vi.setSystemTime(date);

            useEducationStore.getState().updateStreak();

            const { streak } = useEducationStore.getState();
            expect(streak.current).toBe(1);
            expect(streak.lastActivityDate).toBe('2025-01-03');
        });
    });
});
