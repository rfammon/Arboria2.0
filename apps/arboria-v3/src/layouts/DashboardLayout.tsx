import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { TreeDeciduous, LayoutDashboard, ClipboardList, Settings, LogOut, History, FileText, Play, AlertTriangle, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
// import { ModeToggle } from '../components/mode-toggle';
import { useAuth } from '../context/AuthContext';
import { OfflineSyncIndicator } from '../components/features/OfflineSyncIndicator';
import { InstallationSwitchDialog } from '../components/features/InstallationSwitchDialog';
import { TopHeader } from '../components/layout/TopHeader';


export default function DashboardLayout() {
    const { user, loading, signOut, activeInstallation, installations, setActiveInstallation, hasPermission } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        return saved === 'true';
    });
    const [isSwitchDialogOpen, setIsSwitchDialogOpen] = useState(false);
    const location = useLocation();

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar-collapsed', String(next));
            return next;
        });
    };

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

        // Education: Access to training materials
        { name: 'Educação', href: '/education', icon: BookOpen },

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
                    className="fixed inset-0 z-[55] bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-[60] bg-card/80 backdrop-blur-xl border-r border-white/10 shadow-[var(--shadow-deep)] transform transition-all duration-300 ease-in-out lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full",
                isSidebarCollapsed ? "lg:w-20" : "lg:w-64",
                "w-64" // mobile width
            )}
                style={{
                    paddingTop: 'var(--safe-area-top)',
                    paddingBottom: 'var(--safe-area-bottom)',
                    paddingLeft: 'var(--safe-area-left)'
                }}
            >
                <div className="flex flex-col h-full bg-transparent text-card-foreground">
                    {/* Logo */}
                    <div className={cn(
                        "h-16 flex items-center border-b border-border transition-all duration-300",
                        isSidebarCollapsed ? "px-5 justify-center" : "px-6"
                    )}>
                        <TreeDeciduous className="w-8 h-8 text-green-600 dark:text-green-500 shrink-0" />
                        {!isSidebarCollapsed && (
                            <div className="flex flex-col flex-1 min-w-0 ml-2 animate-in fade-in duration-300">
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
                        )}
                    </div>


                    {/* Nav */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    title={isSidebarCollapsed ? item.name : undefined}
                                    className={cn(
                                        "flex items-center text-sm font-medium rounded-xl transition-all active:scale-95",
                                        isSidebarCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 py-3",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-inner"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:shadow-sm"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", isSidebarCollapsed ? "" : "mr-3")} />
                                    {!isSidebarCollapsed && <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-border">
                        <button
                            onClick={() => signOut()}
                            title={isSidebarCollapsed ? "Sair" : undefined}
                            className={cn(
                                "flex items-center w-full text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors",
                                isSidebarCollapsed ? "px-0 justify-center h-12 w-12 mx-auto" : "px-4 py-3"
                            )}
                        >
                            <LogOut className={cn("w-5 h-5", isSidebarCollapsed ? "" : "mr-3")} />
                            {!isSidebarCollapsed && <span>Sair</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className={cn(
                    "flex-1 flex flex-col min-w-0 bg-background transition-all duration-300",
                    isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
                )}
                style={{
                    paddingTop: 'var(--safe-area-top)',
                    paddingRight: 'var(--safe-area-right)'
                }}
            >
                {/* Global Top Header */}
                <TopHeader
                    onMenuClick={() => setIsSidebarOpen(true)}
                    onToggleSidebar={toggleSidebarCollapse}
                    isSidebarCollapsed={isSidebarCollapsed}
                />

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
