import { Menu, PanelLeft, PanelLeftClose, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../features/notifications/NotificationBell';
import { UpdateIndicator } from '../ui/UpdateIndicator';
import { GlobalSearch } from '../features/search/GlobalSearch';
import { Button } from '../ui/button';
import { toast } from 'sonner';
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
    const navigate = useNavigate();

    return (
        <header className="sticky top-0 z-[50] flex h-16 w-full items-center justify-between border-b border-white/10 bg-card/95 backdrop-blur-xl px-4 md:px-6 transition-all duration-200 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 md:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="lg:hidden text-muted-foreground hover:text-primary transition-colors"
                    title="Menu"
                >
                    <Menu className="w-5 h-5 md:w-6 md:h-6" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    className="hidden lg:flex text-muted-foreground hover:text-primary transition-colors"
                    title={isSidebarCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {isSidebarCollapsed ? (
                        <PanelLeft className="w-5 h-5 translate-x-[1px]" />
                    ) : (
                        <PanelLeftClose className="w-5 h-5" />
                    )}
                </Button>

                <div className="flex lg:hidden items-center gap-2 shrink-0">
                    <img src="/logo.png" alt="Logo" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
                    <span className="text-lg font-bold tracking-tight text-foreground/90">
                        Arbor<span className="text-primary italic">IA</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 md:gap-4 flex-1 justify-end max-w-[600px] ml-auto">
                <GlobalSearch />
                <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <DownloadHub />
                    <div className="hidden lg:block">
                        <UpdateIndicator />
                    </div>
                    <NotificationBell />
                </div>

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
                        <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/installation-selector')}>
                            <Building2 className="mr-2 h-4 w-4" />
                            Trocar Instalação
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={async () => {
                            const toastId = toast.loading('Saindo...');
                            try {
                                await signOut();
                                toast.success('Até logo!', { id: toastId });
                            } catch (error) {
                                console.error('Sign out error:', error);
                                toast.error('Erro ao sair, mas limpando sessão...', { id: toastId });
                                // Mesmo com erro, o AuthContext.signOut já deve ter redirecionado via finally
                            }
                        }}>
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
