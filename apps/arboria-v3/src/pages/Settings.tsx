import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTheme } from '../components/theme-provider';
import { useUpdate } from '../hooks/useUpdate';
import { useAuth } from '../context/AuthContext';
import { useDownloads } from '../context/DownloadContext';
import InstallationSettings from './InstallationSettings';
import { Monitor, Moon, Sun, Download, RefreshCw, Loader2, CheckCircle2, AlertCircle, Smartphone, TreeDeciduous } from 'lucide-react';
import { cn } from '../lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

export default function Settings() {
    const { activeInstallation, hasPermission } = useAuth();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight font-display">Configurações</h2>
                <p className="text-muted-foreground font-medium">Gerencie suas preferências, aparência e instalação do sistema.</p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-muted/50 p-1 text-muted-foreground border border-white/5 shadow-inner">
                    <TabsTrigger value="general" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">Geral</TabsTrigger>
                    <TabsTrigger value="updates" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">Atualizações</TabsTrigger>
                    {activeInstallation && hasPermission('manage_installation') && (
                        <TabsTrigger value="installation" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">Instalação</TabsTrigger>
                    )}
                    <TabsTrigger value="downloads" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md transition-all">Downloads</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <GeneralSettings />
                </TabsContent>

                <TabsContent value="updates" className="space-y-4">
                    <UpdateSettings />
                </TabsContent>

                {activeInstallation && hasPermission('manage_installation') && (
                    <TabsContent value="installation" className="space-y-4">
                        <InstallationSettings embedded={true} />
                    </TabsContent>
                )}

                <TabsContent value="downloads" className="space-y-4">
                    <DownloadSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function GeneralSettings() {
    const { theme, setTheme } = useTheme();
    const { updateUserTheme } = useAuth();
    const [pendingTheme, setPendingTheme] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const themes = [
        { id: "light", name: "Light", icon: Sun, color: "bg-white text-slate-950" },
        { id: "dark", name: "Dark", icon: Moon, color: "bg-slate-950 text-white" },
        { id: "forest", name: "Forest", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-900" },
        { id: "dark-forest", name: "Dark Forest", icon: CheckCircle2, color: "bg-emerald-950 text-emerald-50" },
        { id: "madeira", name: "Madeira", icon: TreeDeciduous, color: "bg-[#F5EFE6] text-[#42352B]" },
        { id: "system", name: "System", icon: Monitor, color: "bg-slate-200 text-slate-900" },
    ];

    const handleThemeSelect = (newTheme: string) => {
        setTheme(newTheme as any); // Apply locally immediately
        setPendingTheme(newTheme);
        setIsDialogOpen(true);
    };

    const confirmDefault = async () => {
        if (pendingTheme) {
            await updateUserTheme(pendingTheme);
            toast.success("Tema definido como padrão para sua conta.");
        }
        setIsDialogOpen(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>
                    Selecione o tema visual do aplicativo.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => handleThemeSelect(t.id)}
                            className={cn(
                                "flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-95 group relative overflow-hidden",
                                theme === t.id
                                    ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)] ring-2 ring-primary/20"
                                    : "border-transparent bg-muted/30 hover:bg-muted/50"
                            )}
                        >
                            <div className={cn(
                                "h-12 w-12 rounded-2xl flex items-center justify-center mb-3 border shadow-sm transition-transform group-hover:scale-110",
                                t.color,
                                theme === t.id && "shadow-lg shadow-primary/10"
                            )}>
                                <t.icon className="h-6 w-6" />
                            </div>
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider",
                                theme === t.id ? "text-primary" : "text-muted-foreground"
                            )}>{t.name}</span>
                        </button>
                    ))}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Definir como Padrão?</DialogTitle>
                            <DialogDescription>
                                Você deseja que o tema <strong>{themes.find(t => t.id === pendingTheme)?.name}</strong> seja carregado automaticamente sempre que você entrar na sua conta?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Não, apenas agora</Button>
                            <Button onClick={confirmDefault}>Sim, salvar como padrão</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

function UpdateSettings() {
    const {
        checkForUpdates,
        downloadUpdate,
        installUpdate,
        currentVersion,
        latestVersion,
        releaseNotes,
        status,
        progress,
        error,
        hasUpdate,
    } = useUpdate();

    const checking = status === 'checking';
    const downloading = status === 'downloading';
    const available = status === 'available';
    const readyToInstall = status === 'ready-to-install';
    const installing = status === 'installing';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Atualização de Software (v{currentVersion})</CardTitle>
                <CardDescription>
                    Verifique e instale novas versões do ArborIA.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                        <Smartphone className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Versão Atual</p>
                            <p className="text-sm text-muted-foreground font-mono">{currentVersion || 'Desconhecida'}</p>
                        </div>
                    </div>
                    <div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${readyToInstall ? 'bg-green-100 text-green-700' :
                            available ? 'bg-blue-100 text-blue-700' :
                                downloading ? 'bg-yellow-100 text-yellow-700' :
                                    installing ? 'bg-purple-100 text-purple-700' :
                                        'bg-gray-100 text-gray-700'
                            }`}>
                            {status === 'ready-to-install' ? 'PRONTO' :
                                status === 'installing' ? 'INSTALANDO' :
                                    status.toUpperCase().replace('-', ' ')}
                        </div>
                    </div>
                </div>

                {available && latestVersion && (
                    <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <Download className="h-5 w-5" />
                            <span className="font-medium">Nova versão {latestVersion} disponível!</span>
                        </div>
                        {releaseNotes && (
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 ml-7">
                                {releaseNotes}
                            </p>
                        )}
                    </div>
                )}

                {downloading && (
                    <div className="space-y-2 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="font-medium">Baixando atualização... {progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {readyToInstall && (
                    <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="font-medium">Atualização baixada com sucesso!</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1 ml-7">
                            Clique em "Instalar" para iniciar a instalação.
                        </p>
                    </div>
                )}

                {installing && (
                    <div className="p-4 border rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="font-medium">Abrindo instalador...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                            <AlertCircle className="h-5 w-5" />
                            <span className="font-medium">Erro na atualização</span>
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 ml-7">
                            {error}
                        </p>
                    </div>
                )}

                {status === 'idle' && !hasUpdate && (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                        Clique em "Verificar Atualizações" para procurar novas versões.
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2">
                {readyToInstall ? (
                    <Button onClick={installUpdate} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Instalar Atualização
                    </Button>
                ) : available ? (
                    <Button onClick={downloadUpdate} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar v{latestVersion}
                    </Button>
                ) : (
                    <Button onClick={checkForUpdates} variant="outline" disabled={checking || downloading || installing} className="w-full sm:w-auto">
                        {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Verificar Atualizações
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

function DownloadSettings() {
    const { downloadDirectory, selectDownloadDirectory } = useDownloads();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Downloads</CardTitle>
                <CardDescription>Configure onde os arquivos baixados serão salvos.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Pasta de Destino
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted/50 text-muted-foreground truncate font-mono">
                                {downloadDirectory || 'Padrão (Downloads)'}
                            </div>
                            <Button onClick={selectDownloadDirectory} variant="outline" size="sm">
                                Alterar
                            </Button>
                        </div>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Todos os relatórios e backups serão salvos nesta pasta.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
