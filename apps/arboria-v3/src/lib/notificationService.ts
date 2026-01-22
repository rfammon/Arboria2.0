import { supabase } from './supabase';

export interface Notification {
    id: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    title: string;
    message: string;
    is_read: boolean;
    action_link?: string;
    created_at: string;
    metadata?: any;
}

export const NotificationService = {
    async getNotifications(limit = 20) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as Notification[];
    },

    async getUnreadCount() {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    },

    async markAsRead(id: string) {
        const { error } = await supabase
            .rpc('mark_notifications_read', { p_notification_ids: [id] });

        if (error) throw error;
    },

    async markAllAsRead() {
        const { error } = await supabase
            .rpc('mark_notifications_read', { p_notification_ids: null }); // null means all

        if (error) throw error;
    },

    async clearAll() {
        const { error } = await supabase
            .rpc('delete_notifications', { p_notification_ids: null });

        if (error) throw error;
    },

    async deleteNotification(id: string) {
        const { error } = await supabase
            .rpc('delete_notifications', { p_notification_ids: [id] });

        if (error) throw error;
    },

    async sendPushNotification(userIds: string[], title: string, body: string, data?: any) {
        const results = await Promise.allSettled(
            userIds.map(userId =>
                supabase.functions.invoke('send-push-notification', {
                    body: {
                        userId,
                        title,
                        body,
                        data
                    }
                })
            )
        );

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                console.error(`Failed to send push notification to ${userIds[index]}:`, result.reason);
            } else if (result.value.error) {
                console.error(`Error from push notification function for ${userIds[index]}:`, result.value.error);
            }
        });
    }
};
