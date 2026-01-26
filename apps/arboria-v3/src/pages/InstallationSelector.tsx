import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Building2, Plus, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { InstallationCard } from '@/components/installation/InstallationCard';
import { SplashScreen } from '@/components/layout/SplashScreen';
import { AnimatePresence } from 'framer-motion';


export default function InstallationSelector() {
    const { installations, loading, setActiveInstallation, activeInstallation, user, signOut } = useAuth();
    const [timerFinished, setTimerFinished] = useState(false);
    const [selecting, setSelecting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setTimerFinished(true), 3500);
        return () => clearTimeout(timer);
    }, []);

    const showSplash = loading || !timerFinished;
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    if (!loading && !user) {
        navigate('/login', { replace: true });
        return null;
    }

    const filteredInstallations = useMemo(() => {
        return installations.filter(inst => 
            inst.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inst.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inst.descricao?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [installations, searchQuery]);

    const selectInstallation = async (installationId: string) => {
        if (selecting) return;
        setSelecting(true);
        try {
            const installation = installations.find(i => i.id === installationId);
            if (!installation) throw new Error('Instalação não encontrada');

            setActiveInstallation(installation);
            toast.success('Instalação selecionada com sucesso!');
            navigate('/', { replace: true });
        } catch (error: any) {
            toast.error('Erro ao selecionar instalação');
            console.error(error);
        } finally {
            setSelecting(false);
        }
    };

    const handleLogout = async () => {
        const toastId = toast.loading('Saindo...');
        try {
            await signOut();
            toast.success('Até logo!', { id: toastId });
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Erro ao sair, mas limpando sessão...', { id: toastId });
        }
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {showSplash && <SplashScreen key="splash" />}
            </AnimatePresence>

            {!loading && user && (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-emerald-500/30">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[25%] -left-[10%] w-[70%] h-[70%] bg-emerald-500/30 rounded-full blur-[120px] opacity-5 dark:opacity-20" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/30 rounded-full blur-[120px] opacity-5 dark:opacity-20" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-20">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                                <Building2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-sm font-bold tracking-[0.2em] uppercase text-emerald-500/60">Arboria Cloud</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                            Selecione sua <br />
                            <span className="titulo-operacional">Unidade de Gestão</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl font-medium">
                            Bem-vindo de volta. Escolha qual instalação você deseja gerenciar hoje ou crie uma nova.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={handleLogout}
                            variant="fantasma" 
                            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-6 py-6"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Sair da conta
                        </Button>
                    </div>
                </header>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                        <Input 
                            placeholder="Buscar instalação..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl pl-12 h-14 text-lg focus:ring-emerald-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>
                    <Button 
                        onClick={() => navigate('/installation-settings')}
                        variant="principal"
                        className="h-14 px-8 font-bold"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nova Instalação
                    </Button>
                </div>

                {/* Main Content */}
                {installations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-slate-100 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 mb-8">
                            <Building2 className="w-16 h-16 text-slate-400 dark:text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Nenhuma instalação encontrada</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
                            Você ainda não faz parte de nenhuma unidade de gestão florestal.
                        </p>
                        <Button
                            onClick={() => navigate('/installation-settings')}
                            variant="padrao"
                            className="font-bold px-8 h-14"
                        >
                            Começar agora
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInstallations.map((installation) => (
                            <InstallationCard
                                key={installation.id}
                                installation={installation}
                                isActive={activeInstallation?.id === installation.id}
                                onSelect={() => selectInstallation(installation.id)}
                            />
                        ))}

                        {/* Quick Action: Add New */}
                        <div 
                            onClick={() => navigate('/installation-settings')}
                            className="group flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2rem] h-[280px] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer"
                        >
                            <div className="bg-slate-100 dark:bg-white/5 p-6 rounded-full group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-500">
                                <Plus className="w-10 h-10 text-slate-400 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold mt-6 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Nova Instalação</h3>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Footer decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />
        </div>
            )}
        </>
    );
}
