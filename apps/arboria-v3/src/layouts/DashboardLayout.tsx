import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, TreeDeciduous, LayoutDashboard, ClipboardList, Settings, LogOut, History, FileText, Play, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
// import { ModeToggle } from '../components/mode-toggle';
import { NotificationBell } from '../components/features/notifications/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { OfflineSyncIndicator } from '../components/features/OfflineSyncIndicator';
import { InstallationSwitchDialog } from '../components/features/InstallationSwitchDialog';


export default function DashboardLayout() {
    const { user, loading, signOut, activeInstallation, installations, setActiveInstallation, userDisplayName, activeProfileNames, hasPermission } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-blue-600 font-bold z-[9999]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p>Carregando ArborIA...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (installations.length === 0 && !loading) {
        return <Navigate to="/onboarding" replace />;
    }

    // Ensure we have an active installation if one exists
    if (!activeInstallation && installations.length > 0) {
        setActiveInstallation(installations[0]);
    }

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        // Inventory: Requires view_inventory or manage_installation
        ...((hasPermission('view_inventory') || hasPermission('manage_installation'))
            ? [{ name: 'Inventário', href: '/inventory', icon: TreeDeciduous }] : []),

        // Plans Manager: Requires creating/editing plans or approval rights
        ...((hasPermission('create_plans') || hasPermission('edit_plans') || hasPermission('approve_plans'))
            ? [{ name: 'Gestor de Planos', href: '/plans', icon: ClipboardList }] : []),

        // History: Managers only
        ...(hasPermission('manage_installation')
            ? [{ name: 'Histórico', href: '/activity-history', icon: History }] : []),

        // Execution: Requires view_plans or manage_installation
        ...(hasPermission('view_plans') || hasPermission('manage_installation')
            ? [{ name: 'Execução', href: '/execution', icon: Play }] : []),

        // Alerts: Everyone for now, or refine? Assuming public for members.
        { name: 'Alertas', href: '/alerts', icon: AlertTriangle },

        // Reports: Managers only
        ...(hasPermission('manage_installation')
            ? [{ name: 'Relatórios', href: '/reports', icon: FileText }] : []),

        // Settings: Managers only
        ...(activeInstallation && hasPermission('manage_installation')
            ? [{ name: 'Configurações', href: '/settings', icon: Settings }] : []),
    ];

    return (
        <div className="min-h-screen bg-background flex transition-colors duration-200">
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-sm transform transition-transform duration-200 ease-in-out lg:static lg:transform-none",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
                style={{
                    paddingTop: 'var(--safe-area-top)',
                    paddingBottom: 'var(--safe-area-bottom)',
                    paddingLeft: 'var(--safe-area-left)'
                }}
            >
                <div className="flex flex-col h-full bg-card text-card-foreground">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-border">
                        <TreeDeciduous className="w-8 h-8 text-green-600 dark:text-green-500 mr-2" />
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xl font-bold leading-none">
                                <span className="text-blue-600 dark:text-blue-500">Arbor</span>
                                <span className="text-green-600 dark:text-green-500">IA</span>
                            </span>
                            {activeInstallation && (
                                <button
                                    onClick={() => setIsSwitchDialogOpen(true)}
                                    className="text-xs text-muted-foreground truncate text-left hover:text-primary transition-colors flex items-center gap-2 mt-1 px-2 py-1 -ml-2 rounded-md hover:bg-accent/50"
                                    title="Trocar instalação"
                                >
                                    <span className="truncate max-w-[120px] font-medium">{activeInstallation.nome}</span>
                                    <Settings className="w-3.5 h-3.5 text-muted-foreground/70" />
                                </button>
                            )}
                        </div>
                    </div>


                    {/* Nav */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-border space-y-2">
                        <div className="flex items-center justify-between px-4 py-2">
                            <div className="flex items-center gap-2">
                                {/* <ModeToggle /> - Moved to Settings */}
                                <NotificationBell />
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="px-4 py-2 mb-2 border-b border-border/50 pb-4">
                            <p className="text-sm font-medium leading-none truncate" title={userDisplayName}>
                                {userDisplayName}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 truncate" title={activeProfileNames}>
                                {activeProfileNames}
                            </p>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-destructive hover:text-destructive-foreground hover:bg-destructive/10 rounded-lg"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col min-w-0 bg-background transition-colors duration-200"
                style={{
                    paddingTop: 'var(--safe-area-top)',
                    paddingRight: 'var(--safe-area-right)'
                }}
            >
                {/* Mobile Header */}
                <header className="bg-card dark:bg-card border-b border-border h-16 flex items-center justify-between px-4 lg:hidden">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-muted-foreground hover:bg-muted rounded-md"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <span className="ml-4 text-lg font-semibold">
                            <span className="text-blue-600 dark:text-blue-500">Arbor</span>
                            <span className="text-green-600 dark:text-green-500">IA</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <ModeToggle /> */}
                        <NotificationBell />
                    </div>
                </header>

                {/* Page Content */}
                <main
                    className="flex-1 p-4 lg:p-8 overflow-y-auto"
                    style={{ paddingBottom: 'calc(1rem + var(--safe-area-bottom))' }}
                >
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            <OfflineSyncIndicator />
            <InstallationSwitchDialog open={isSwitchDialogOpen} onOpenChange={setIsSwitchDialogOpen} />
        </div>
    );
}
