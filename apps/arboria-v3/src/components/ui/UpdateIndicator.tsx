import { useEffect, useState } from 'react';
import { useUpdate } from '../../hooks/useUpdate';
import { Button } from './button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { RefreshCw, Loader2, ArrowDownCircle, Download } from 'lucide-react';
import { Progress } from './progress';

export function UpdateIndicator() {
    const {
        status,
        progress,
        checkForUpdates,
        downloadApk,
        installApk,
        currentVersion,
        latestVersion,
        hasUpdate,
    } = useUpdate();

    const downloading = status === 'downloading';
    const readyToInstall = status === 'ready-to-install';
    const available = status === 'available';
    const updateAvailable = hasUpdate || available || downloading || readyToInstall;

    const [isOpen, setIsOpen] = useState(false);

    // Check for updates on mount
    useEffect(() => {
        checkForUpdates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!updateAvailable && !downloading && !readyToInstall) {
        return null;
    }

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleDownload = () => {
        downloadApk();
    };

    const handleInstall = () => {
        installApk();
        handleClose();
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="relative text-muted-foreground hover:text-primary"
                onClick={handleOpen}
                title={`Versão atual: ${currentVersion}`}
            >
                {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                ) : readyToInstall ? (
                    <ArrowDownCircle className="h-4 w-4 text-green-500 animate-bounce" />
                ) : available ? (
                    <Download className="h-4 w-4 text-blue-500" />
                ) : (
                    <RefreshCw className="h-4 w-4" />
                )}
                {(available || readyToInstall) && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                )}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atualização do Sistema</DialogTitle>
                        <DialogDescription>
                            {readyToInstall
                                ? "APK baixado. Abra o arquivo para instalar."
                                : downloading
                                    ? "Baixando APK..."
                                    : available
                                        ? `Nova versão ${latestVersion} disponível!`
                                        : "Verificando atualizações..."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Versão atual: <span className="font-mono">{currentVersion}</span>
                        </div>

                        {downloading && (
                            <div className="space-y-2">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-center text-muted-foreground">{progress.toFixed(0)}% concluído</p>
                            </div>
                        )}

                        {readyToInstall && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800 text-sm text-green-800 dark:text-green-300">
                                APK baixado! Clique em "Instalar" para continuar.
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose} disabled={downloading && progress < 100}>
                            {readyToInstall ? 'Fechar' : 'Cancelar'}
                        </Button>
                        {available && (
                            <Button onClick={handleDownload}>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar APK
                            </Button>
                        )}
                        {readyToInstall && (
                            <Button onClick={handleInstall} className="bg-green-600 hover:bg-green-700">
                                Instalar Agora
                            </Button>
                        )}
                        {!available && !downloading && !readyToInstall && (
                            <Button onClick={checkForUpdates} variant="secondary">
                                Verificar Novamente
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
