
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { NotificationService, type Notification } from '../lib/notificationService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function useNotifications() {
    const { user, activeInstallation } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadNotifications = async () => {
        if (!user) return;
        try {
            const [notifs, count] = await Promise.all([
                NotificationService.getNotifications(),
                NotificationService.getUnreadCount()
            ]);
            setNotifications(notifs || []);
            setUnreadCount(count || 0);
        } catch (e) {
            console.error('Error loading notifications:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;

        loadNotifications();

        // Realtime subscription
        // Note: We use '*' to catch inserts, updates, and deletes
        const channel = supabase.channel(`notifications_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    console.log('Realtime notification event:', payload);

                    if (payload.eventType === 'INSERT') {
                        const newNotif = payload.new as Notification;

                        // Optimistic update
                        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
                        setUnreadCount(prev => prev + 1);

                        // Show toast
                        toast(newNotif.title, {
                            description: newNotif.message,
                        });
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedNotif = payload.new as Notification;
                        setNotifications(prev => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));

                        // Recalculate unread count
                        loadNotifications(); // Simplest way to ensure accuracy
                    } else if (payload.eventType === 'DELETE') {
                        loadNotifications();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, activeInstallation]);

    const markAsRead = async (id: string) => {
        await NotificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await NotificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const clearAll = async () => {
        await NotificationService.clearAll();
        setNotifications([]);
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearAll,
        refresh: loadNotifications
    };
}
