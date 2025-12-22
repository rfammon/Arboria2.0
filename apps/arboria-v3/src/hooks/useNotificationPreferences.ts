import { } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface NotificationPreferences {
    user_id: string;
    email_enabled: boolean;
    email_access_requests: boolean;
    email_approvals: boolean;
    email_invites: boolean;
    email_task_completion: boolean;
    push_enabled: boolean;
    push_task_completion: boolean;
    push_alerts: boolean;
}

const defaultPreferences: Omit<NotificationPreferences, 'user_id'> = {
    email_enabled: true,
    email_access_requests: true,
    email_approvals: true,
    email_invites: true,
    email_task_completion: true,
    push_enabled: true,
    push_task_completion: true,
    push_alerts: true,
};

export function useNotificationPreferences() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: preferences, isLoading, error } = useQuery({
        queryKey: ['notification-preferences', user?.id],
        queryFn: async (): Promise<NotificationPreferences> => {
            if (!user?.id) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('user_notification_preferences')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                // If no preferences exist, create default ones
                if (error.code === 'PGRST116') {
                    const { data: newPrefs, error: insertError } = await supabase
                        .from('user_notification_preferences')
                        .insert({ user_id: user.id, ...defaultPreferences })
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    return newPrefs;
                }
                throw error;
            }

            return data;
        },
        enabled: !!user?.id,
    });

    const updatePreferences = useMutation({
        mutationFn: async (updates: Partial<NotificationPreferences>) => {
            if (!user?.id) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('user_notification_preferences')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
            toast.success('Preferências de notificação atualizadas');
        },
        onError: (error) => {
            console.error('Error updating preferences:', error);
            toast.error('Erro ao atualizar preferências');
        }
    });

    const togglePreference = (key: keyof Omit<NotificationPreferences, 'user_id'>) => {
        if (!preferences) return;
        updatePreferences.mutate({ [key]: !preferences[key] });
    };

    return {
        preferences: preferences || { user_id: user?.id || '', ...defaultPreferences },
        isLoading,
        error,
        updatePreferences: updatePreferences.mutate,
        togglePreference,
        isUpdating: updatePreferences.isPending,
    };
}

/**
 * Hook to send notification emails manually (for testing or specific cases)
 */
export function useSendNotificationEmail() {
    const sendEmail = useMutation({
        mutationFn: async (params: {
            userId: string;
            type: string;
            message: string;
            taskId?: string;
            instalacaoName?: string;
        }) => {
            const { data, error } = await supabase.functions.invoke('send-notification-email', {
                body: {
                    user_id: params.userId,
                    type: params.type,
                    message: params.message,
                    task_id: params.taskId,
                    instalacao_name: params.instalacaoName,
                }
            });

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            if (data.skipped) {
                console.log('Email skipped:', data.reason);
            } else {
                console.log('Email sent successfully');
            }
        },
        onError: (error) => {
            console.error('Error sending email:', error);
        }
    });

    return {
        sendEmail: sendEmail.mutate,
        isSending: sendEmail.isPending,
        error: sendEmail.error,
    };
}
