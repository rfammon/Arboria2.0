import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEducationGuard } from './useEducationGuard';
import { useEducationStore } from '../stores/useEducationStore';

describe('useEducationGuard', () => {
    beforeEach(() => {
        useEducationStore.setState({
            modules: {
                'safety': { id: 'safety', status: 'available', score: 0 },
                'pruning': { id: 'pruning', status: 'locked', score: 0 }
            }
        });
    });

    it('should deny access if prerequisites are not met', () => {
        const { result } = renderHook(() => useEducationGuard());
        // Pruning requires Safety. Safety is 'available' (not complete).
        expect(result.current.canAccess('pruning')).toBe(false);
    });

    it('should grant access if prerequisites are met', () => {
        const { completeModule } = useEducationStore.getState();
        completeModule('safety', 100); // Complete Safety

        const { result } = renderHook(() => useEducationGuard());
        // Now Pruning should be accessible (assuming logic checks safety)
        expect(result.current.canAccess('pruning')).toBe(true);
    });
});
