import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNotificationPreferences } from './useNotificationPreferences';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mocks
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
            update: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
        })),
    },
}));

vi.mock('@/context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useNotificationPreferences', () => {
    const mockUser = { id: 'test-user-id' };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuth as any).mockReturnValue({ user: mockUser });
        queryClient.clear();
    });

    it('should include new push notification fields in preferences', async () => {
        const mockPreferences = {
            user_id: 'test-user-id',
            email_enabled: true,
            push_enabled: true,
            push_task_completion: true,
            push_plan_completion: true,
            push_invite_accepted: true,
            push_app_update: true,
            push_alerts: true,
        };

        (supabase.from as any).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockPreferences, error: null }),
        });

        const { result } = renderHook(() => useNotificationPreferences(), { wrapper });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.preferences).toMatchObject({
            push_plan_completion: true,
            push_invite_accepted: true,
            push_app_update: true,
        });
    });

    it('should update specific push preferences correctly', async () => {
        const mockPreferences = {
            user_id: 'test-user-id',
            push_plan_completion: true,
        };

        (supabase.from as any).mockReturnValue({
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: mockPreferences, error: null }),
            update: vi.fn().mockReturnThis(),
        });

        const { result } = renderHook(() => useNotificationPreferences(), { wrapper });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Simulate toggling a preference
        result.current.togglePreference('push_plan_completion');

        await waitFor(() => {
            expect(supabase.from).toHaveBeenCalledWith('user_notification_preferences');
        });
    });
});
