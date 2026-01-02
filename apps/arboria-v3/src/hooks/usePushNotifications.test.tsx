import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePushNotifications } from './usePushNotifications';
import { PushNotifications, type Token } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mocks
vi.mock('@capacitor/push-notifications', () => ({
    PushNotifications: {
        checkPermissions: vi.fn(),
        requestPermissions: vi.fn(),
        register: vi.fn(),
        addListener: vi.fn().mockImplementation(() => Promise.resolve({ remove: vi.fn() })),
        removeAllListeners: vi.fn(),
    },
}));

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        getPlatform: vi.fn(),
    },
}));

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            upsert: vi.fn().mockResolvedValue({ error: null }),
        })),
    },
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

describe('usePushNotifications', () => {
    const mockNavigate = vi.fn();
    const mockUser = { id: 'test-user-id' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        (useNavigate as any).mockReturnValue(mockNavigate);
        (Capacitor.getPlatform as any).mockReturnValue('ios');
        (PushNotifications.checkPermissions as any).mockResolvedValue({ receive: 'granted' });
    });

    it('should not register if on web platform', () => {
        (Capacitor.getPlatform as any).mockReturnValue('web');
        renderHook(() => usePushNotifications());
        expect(PushNotifications.register).not.toHaveBeenCalled();
    });

    it('should register and add listeners on mobile platform', async () => {
        renderHook(() => usePushNotifications());
        // Small delay to allow async operations inside useEffect
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(PushNotifications.checkPermissions).toHaveBeenCalled();
        expect(PushNotifications.addListener).toHaveBeenCalledWith('registration', expect.any(Function));
        expect(PushNotifications.addListener).toHaveBeenCalledWith('pushNotificationActionPerformed', expect.any(Function));
    });

    it('should save token to supabase on registration', async () => {
        let registrationCallback: (token: Token) => void = () => { };
        (PushNotifications.addListener as any).mockImplementation((event: string, cb: any) => {
            if (event === 'registration') {
                registrationCallback = cb;
            }
            return Promise.resolve({ remove: vi.fn() });
        });

        renderHook(() => usePushNotifications());
        await new Promise(resolve => setTimeout(resolve, 10));

        const mockToken = { value: 'test-token' };
        await registrationCallback(mockToken);

        expect(supabase.from).toHaveBeenCalledWith('device_tokens');
    });

    it('should navigate to settings on app_update notification', async () => {
        let actionCallback: any;
        (PushNotifications.addListener as any).mockImplementation((event: string, cb: any) => {
            if (event === 'pushNotificationActionPerformed') {
                actionCallback = cb;
            }
            return Promise.resolve({ remove: vi.fn() });
        });

        renderHook(() => usePushNotifications());
        await new Promise(resolve => setTimeout(resolve, 10));

        // Simulate notification action
        actionCallback({
            notification: {
                data: { type: 'app_update' }
            }
        });

        expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });

    it('should navigate to deep link path if provided as relative path', async () => {
        let actionCallback: any;
        (PushNotifications.addListener as any).mockImplementation((event: string, cb: any) => {
            if (event === 'pushNotificationActionPerformed') {
                actionCallback = cb;
            }
            return Promise.resolve({ remove: vi.fn() });
        });

        renderHook(() => usePushNotifications());
        await new Promise(resolve => setTimeout(resolve, 10));

        actionCallback({
            notification: {
                data: { deep_link: '/execution/task/123' }
            }
        });

        expect(mockNavigate).toHaveBeenCalledWith('/execution/task/123');
    });

    it('should parse and navigate to arboria:// URL scheme', async () => {
        let actionCallback: any;
        (PushNotifications.addListener as any).mockImplementation((event: string, cb: any) => {
            if (event === 'pushNotificationActionPerformed') {
                actionCallback = cb;
            }
            return Promise.resolve({ remove: vi.fn() });
        });

        renderHook(() => usePushNotifications());
        await new Promise(resolve => setTimeout(resolve, 10));

        actionCallback({
            notification: {
                data: { deep_link: 'arboria://plans/456?search=test' }
            }
        });

        expect(mockNavigate).toHaveBeenCalledWith('/plans/456?search=test');
    });

    it('should fallback to alerts center if no link or special type is found', async () => {
        let actionCallback: any;
        (PushNotifications.addListener as any).mockImplementation((event: string, cb: any) => {
            if (event === 'pushNotificationActionPerformed') {
                actionCallback = cb;
            }
            return Promise.resolve({ remove: vi.fn() });
        });

        renderHook(() => usePushNotifications());
        await new Promise(resolve => setTimeout(resolve, 10));

        actionCallback({
            notification: {
                data: {}
            }
        });

        expect(mockNavigate).toHaveBeenCalledWith('/alerts');
    });
});
