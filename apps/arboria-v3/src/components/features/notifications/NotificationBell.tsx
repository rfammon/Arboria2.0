
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { NotificationService, type Notification } from '../../../lib/notificationService';
import { useRealtime } from '../../../hooks/useRealtime';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
// import { Badge } from '../../ui/badge';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { isConnected } = useRealtime(); // Just to trigger subscription

    useEffect(() => {
        loadNotifications();
        // Set up a poller just in case realtime misses or to refresh counts
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [isConnected]);

    const loadNotifications = async () => {
        try {
            const [notifs, count] = await Promise.all([
                NotificationService.getNotifications(),
                NotificationService.getUnreadCount()
            ]);
            setNotifications(notifs || []);
            setUnreadCount(count);
        } catch (e) {
            console.error(e);
        }
    };

    const handleOpen = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            // Refresh on open
            loadNotifications();
        }
    };

    const handleMarkAllRead = async () => {
        await NotificationService.markAllAsRead();
        await loadNotifications();
    };

    const handleClearAll = async () => {
        await NotificationService.clearAll();
        // Optimistic update
        setNotifications([]);
        setUnreadCount(0);
        await loadNotifications();
    };

    const handleMarkRead = async (id: string, link?: string) => {
        await NotificationService.markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        if (link) {
            window.location.href = link; // Simple navigation
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b p-4">
                    <h4 className="font-semibold">Notificações</h4>
                    <div className="flex gap-2">
                        {notifications.length > 0 && (
                            <Button variant="ghost" size="sm" className="h-auto px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleClearAll}>
                                Limpar
                            </Button>
                        )}
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" className="h-auto px-2 text-xs" onClick={handleMarkAllRead}>
                                Marcar lidas
                            </Button>
                        )}
                    </div>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Nenhuma notificação.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={cn(
                                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                                        !notif.is_read && "bg-blue-50/50"
                                    )}
                                    onClick={() => handleMarkRead(notif.id, notif.action_link)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm font-medium leading-none", !notif.is_read && "text-primary")}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {format(new Date(notif.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
