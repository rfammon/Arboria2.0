
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../hooks/useNotifications';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../lib/utils';
import { Swipeable } from '../../ui/Swipeable';
import { Trash2, CheckCircle2 } from 'lucide-react';

export function NotificationBell() {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        deleteNotification,
        refresh
    } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);

    const handleOpen = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            refresh();
        }
    };

    const handleMarkRead = async (id: string, link?: string) => {
        await markAsRead(id);
        if (link) {
            if (link.startsWith('http')) {
                window.location.href = link;
            } else {
                navigate(link);
            }
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
                            <Button variant="ghost" size="sm" className="h-auto px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50" onClick={clearAll}>
                                Limpar
                            </Button>
                        )}
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" className="h-auto px-2 text-xs" onClick={markAllAsRead}>
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
                        <div className="divide-y overflow-x-hidden">
                            {notifications.map((notif) => (
                                <Swipeable
                                    key={notif.id}
                                    onSwipeLeft={() => deleteNotification(notif.id)}
                                    onSwipeRight={!notif.is_read ? () => markAsRead(notif.id) : undefined}
                                    leftActionLabel="Excluir"
                                    leftActionIcon={<Trash2 className="w-4 h-4" />}
                                    rightActionLabel="Lida"
                                    rightActionIcon={<CheckCircle2 className="w-4 h-4" />}
                                    rightActionClassName="bg-blue-500"
                                >
                                    <div
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
                                </Swipeable>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
