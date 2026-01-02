
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../features/notifications/NotificationBell';
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

interface TopHeaderProps {
    onMenuClick: () => void;
}

export function TopHeader({ onMenuClick }: TopHeaderProps) {
    const { userDisplayName, activeProfileNames, signOut } = useAuth();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 md:px-6 transition-all duration-200">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-muted-foreground hover:bg-muted rounded-md lg:hidden"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <GlobalSearch />

                <span className="text-lg font-semibold lg:hidden">
                    <span className="text-blue-600 dark:text-blue-500">Arbor</span>
                    <span className="text-green-600 dark:text-green-500">IA</span>
                </span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
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
