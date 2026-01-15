
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { UpdateIndicator } from '../ui/UpdateIndicator';
import { GlobalSearch } from '../features/search/GlobalSearch';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DownloadHub } from './DownloadHub';

interface TopHeaderProps {
    onMenuClick: () => void;
    onToggleSidebar?: () => void;
    isSidebarCollapsed?: boolean;
}

export function TopHeader({ onMenuClick, onToggleSidebar, isSidebarCollapsed }: TopHeaderProps) {
    const { userDisplayName, activeProfileNames, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-[50] flex h-16 w-full items-center justify-between border-b border-white/10 bg-card/95 backdrop-blur-xl px-4 md:px-6 transition-all duration-200 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-muted-foreground hover:bg-muted rounded-md lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <button
                    onClick={onToggleSidebar}
                    className="hidden lg:flex p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                    title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    <Menu className="w-5 h-5" />
                </button>

                <GlobalSearch />

                <span className="text-lg font-semibold lg:hidden flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="text-blue-600 dark:text-blue-500">Arbor</span>
                    <span className="text-green-600 dark:text-green-500">IA</span>
                </span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <DownloadHub />
                <UpdateIndicator />
                <NotificationBell />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                            <Avatar className="h-9 w-9 border border-border shadow-sm">
                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                                    {userDisplayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userDisplayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {activeProfileNames}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/#/settings'}>
                            Configurações
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => signOut()}>
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
