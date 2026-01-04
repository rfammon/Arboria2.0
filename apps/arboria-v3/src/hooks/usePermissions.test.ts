import { renderHook } from '@testing-library/react';
import { usePermissions } from './usePermissions';
import { useAuth } from '../context/AuthContext';
import { describe, it, expect, vi } from 'vitest';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('usePermissions', () => {
    it('should return permissions from useAuth', () => {
        const mockHasPermission = vi.fn((p) => p === 'test_perm');
        (useAuth as any).mockReturnValue({
            hasPermission: mockHasPermission,
            permissions: ['test_perm'],
            activeProfileNames: 'Test Profile'
        });

        const { result } = renderHook(() => usePermissions());

        expect(result.current.permissions).toEqual(['test_perm']);
        expect(result.current.hasPermission('test_perm')).toBe(true);
        expect(result.current.hasPermission('other')).toBe(false);
        expect(result.current.activeProfileNames).toBe('Test Profile');
    });

    it('should correctly identify master role', () => {
        (useAuth as any).mockReturnValue({
            hasPermission: () => true,
            permissions: ['global_access'],
            activeProfileNames: 'Mestre'
        });

        const { result } = renderHook(() => usePermissions());

        expect(result.current.isMaster).toBe(true);
        expect(result.current.isGuest).toBe(false);
    });

    it('should correctly identify guest role', () => {
        (useAuth as any).mockReturnValue({
            hasPermission: () => false,
            permissions: [],
            activeProfileNames: ''
        });

        const { result } = renderHook(() => usePermissions());

        expect(result.current.isGuest).toBe(true);
        expect(result.current.isMaster).toBe(false);
    });
});
