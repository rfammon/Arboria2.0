import { Download, FileText, CheckCircle2, FolderOpen, ExternalLink, X, Loader2 } from 'lucide-react';
import { useDownloads } from '@/context/DownloadContext';
import { type DownloadItem } from '@/types/downloads';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { FileOpener } from '@capacitor-community/file-opener';
import { Capacitor } from '@capacitor/core';
import { cn } from '@/lib/utils';
import { PageContainer } from '@/components/layout/PageContainer';

export default function DownloadsPage() {
    const { downloads, removeDownload, clearHistory } = useDownloads();

    const tauriOpen = async (path: string) => {
        try {
            if (window.__TAURI__) {
                await window.__TAURI__.invoke('plugin:shell|open', { path });
            }
        } catch (err) {
            console.error('Tauri open failed:', err);
        }
    };

    const handleOpenFile = async (item: DownloadItem) => {
        if (!item.path) return;
        try {
            if (Capacitor.isNativePlatform()) {
                await FileOpener.open({
                    filePath: item.path,
                    contentType: item.type === 'pdf' ? 'application/pdf' :
                        item.type === 'csv' ? 'text/csv' : 'application/zip'
                });
            } else if (window.__TAURI__) {
                await tauriOpen(item.path);
            } else {
                window.open(item.path, '_blank');
            }
        } catch (err) {
            console.error('Failed to open file:', err);
        }
    };

    const handleOpenFolder = async (item: DownloadItem) => {
        if (!item.path) return;
        if (window.__TAURI__) {
            try {
                const pathParts = item.path.split(/[\\/]/);
                if (pathParts.length > 1) {
                    pathParts.pop();
                    const dir = pathParts.join('/');
                    await tauriOpen(dir);
                }
            } catch (err) {
                console.error('Failed to open folder:', err);
            }
        }
    };

    return (
        <PageContainer>
            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gerenciador de Downloads</h1>
                        <p className="text-muted-foreground mt-1">
                            Acompanhe e gerencie todos os relatórios e documentos gerados.
                        </p>
                    </div>
                    {downloads.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={clearHistory}
                            className="flex items-center gap-2"
                        >
                            Limpar Histórico
                        </Button>
                    )}
                </div>

                {downloads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
                        <Download className="h-16 w-16 text-muted-foreground opacity-20 mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">Nenhum download encontrado</h3>
                        <p className="text-sm text-muted-foreground opacity-70">
                            Os arquivos que você gerar aparecerão aqui.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {downloads.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group relative flex flex-col p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "flex h-12 w-12 items-center justify-center rounded-lg border",
                                            item.type === 'pdf' ? "bg-red-500/10 border-red-500/20 text-red-600" :
                                                item.type === 'zip' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600" :
                                                    "bg-green-500/10 border-green-500/20 text-green-600"
                                        )}>
                                            {item.status === 'progress' ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : (
                                                <FileText className="h-6 w-6" />
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeDownload(item.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-base truncate mb-1" title={item.filename}>
                                            {item.filename}
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-medium">
                                            <span>{format(item.timestamp, "d 'de' MMMM", { locale: ptBR })}</span>
                                            <span>•</span>
                                            <span>{format(item.timestamp, "HH:mm")}</span>
                                        </div>

                                        {item.status === 'progress' && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold text-primary">
                                                    <span>Processando...</span>
                                                    <span>{item.progress}%</span>
                                                </div>
                                                <Progress value={item.progress} className="h-2" />
                                            </div>
                                        )}

                                        {item.status === 'success' && (
                                            <div className="flex items-center gap-2 mt-auto">
                                                <Button
                                                    variant="default"
                                                    className="flex-1 font-bold"
                                                    onClick={() => handleOpenFile(item)}
                                                >
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Abrir Arquivo
                                                </Button>
                                                {window.__TAURI__ && (
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleOpenFolder(item)}
                                                    >
                                                        <FolderOpen className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                        {item.status === 'error' && (
                                            <div className="p-2 rounded bg-destructive/10 text-destructive text-xs font-medium">
                                                Falha no download. Tente novamente.
                                            </div>
                                        )}
                                    </div>

                                    {item.status === 'success' && (
                                        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white border-2 border-background shadow-sm translate-x-1/2 -translate-y-1/2">
                                            <CheckCircle2 className="h-4 w-4" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
