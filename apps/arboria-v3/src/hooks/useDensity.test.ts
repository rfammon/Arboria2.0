import { renderHook } from '@testing-library/react';
import { useDensity } from './useDensity';
import { Capacitor } from '@capacitor/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        getPlatform: vi.fn(),
    },
}));

describe('useDensity', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.documentElement.removeAttribute('data-density');
    });

    it('should set density to "field" when on android', () => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('android');

        const { result } = renderHook(() => useDensity());

        expect(result.current).toBe('field');
        expect(document.documentElement.getAttribute('data-density')).toBe('field');
    });

    it('should set density to "field" when on ios', () => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('ios');

        const { result } = renderHook(() => useDensity());

        expect(result.current).toBe('field');
        expect(document.documentElement.getAttribute('data-density')).toBe('field');
    });

    it('should set density to "office" when on web', () => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('web');

        const { result } = renderHook(() => useDensity());

        expect(result.current).toBe('office');
        expect(document.documentElement.getAttribute('data-density')).toBe('office');
    });

    it('should set density to "office" when on unknown platform', () => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('unknown' as any);

        const { result } = renderHook(() => useDensity());

        expect(result.current).toBe('office');
        expect(document.documentElement.getAttribute('data-density')).toBe('office');
    });
});
