import React, { useEffect } from 'react';
import { Download, FileText, CheckCircle2, FolderOpen, ExternalLink, X, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useDownloads } from '@/context/DownloadContext';
import { type DownloadItem } from '@/types/downloads';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        __TAURI__?: any;
    }
}

export const DownloadHub: React.FC = () => {
    const { downloads, removeDownload, clearHistory } = useDownloads();
    const activeDownloads = downloads.filter(d => d.status === 'progress').length;

    useEffect(() => {
        console.log('[DownloadHub] Updated. Items:', downloads.length);
    }, [downloads.length]);

    const handleOpenFile = async (item: DownloadItem) => {
        console.log('[DownloadHub] Attempting to open file:', item.path);
        if (!item.path) {
            console.error('[DownloadHub] No path for item:', item);
            return;
        }

        // Check if this is a blob URL (from failed Tauri save)
        if (item.path.startsWith('blob:')) {
            console.log('[DownloadHub] Detected blob URL, triggering download');
            toast.info('Abrindo arquivo baixado pelo navegador...');

            // Create a temporary anchor element to trigger download
            const link = document.createElement('a');
            link.href = item.path;
            link.download = item.filename || 'arquivo';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                // Note: blob URL will be cleaned by DownloadContext when item is removed
            }, 100);
            return;
        }

        try {
            if (Capacitor.isNativePlatform()) {
                await FileOpener.open({
                    filePath: item.path,
                    contentType: item.type === 'pdf' ? 'application/pdf' :
                        item.type === 'csv' ? 'text/csv' : 'application/zip'
                });
            } else if (window.__TAURI__) {
                console.log('[DownloadHub] Using Custom Native Open for:', item.path);
                try {
                    await invoke('open_file_natively', { path: item.path });
                } catch (e) {
                    console.warn('[DownloadHub] Native open failed, trying plugins:', e);
                    try {
                        await invoke('plugin:opener|open_path', { path: item.path });
                    } catch (openerErr) {
                        await invoke('plugin:shell|open', { path: item.path });
                    }
                }
            } else {
                window.open(item.path, '_blank');
            }
        } catch (err) {
            console.error('[DownloadHub] Global error in handleOpenFile:', err);
            toast.error(`Erro ao abrir arquivo: ${err}`);
        }
    };

    const handleOpenFolder = async (item: DownloadItem) => {
        console.log('[DownloadHub] Attempting to open folder for:', item.path);
        if (!item.path || item.path.startsWith('blob:')) {
            console.warn('[DownloadHub] Cannot open folder for blob URL');
            return;
        }

        if (window.__TAURI__) {
            try {
                console.log('[DownloadHub] Using Custom Reveal for:', item.path);
                try {
                    await invoke('show_in_folder', { path: item.path });
                } catch (e) {
                    console.warn('[DownloadHub] Custom reveal failed, trying plugins:', e);
                    try {
                        await invoke('plugin:opener|reveal_item_in_dir', { path: item.path });
                    } catch (revealErr) {
                        const pathParts = item.path.split(/[\\/]/);
                        if (pathParts.length > 1) {
                            pathParts.pop();
                            const dir = pathParts.join('\\');
                            await invoke('plugin:shell|open', { path: dir });
                        }
                    }
                }
            } catch (err) {
                console.error('[DownloadHub] Error opening folder:', err);
                toast.error(`Erro ao abrir pasta: ${err}`);
            }
        }
    };

    const handleCopyPath = async (path: string) => {
        try {
            await navigator.clipboard.writeText(path);
            toast.success("Caminho copiado para a área de transferência!");
        } catch (err) {
            console.error('[DownloadHub] Failed to copy path:', err);
            toast.error("Erro ao copiar caminho.");
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "relative transition-all duration-300 hover:scale-110 active:scale-95",
                            activeDownloads > 0 ? "text-primary bg-primary/5" : "text-muted-foreground"
                        )}
                        aria-label="Download Center"
                    >
                        {activeDownloads > 0 ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Download className="h-5 w-5" />
                        )}

                        <span className="hidden md:inline ml-2 text-xs font-semibold tracking-wide uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                            Downloads
                        </span>

                        {downloads.length > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1"
                            >
                                <Badge
                                    className={cn(
                                        "h-4 w-4 min-w-0 flex items-center justify-center p-0 text-[10px] font-bold border-2 border-background shadow-sm",
                                        activeDownloads > 0
                                            ? "bg-blue-600 text-white animate-pulse"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {downloads.length}
                                </Badge>
                            </motion.div>
                        )}
                    </Button>
                    {activeDownloads > 0 && (
                        <div className="absolute -inset-1 rounded-full border-2 border-primary/20 animate-ping opacity-25" />
                    )}
                </div>
            </PopoverTrigger>

            <PopoverContent
                className="w-80 p-0 overflow-hidden border-border/40 shadow-2xl z-[100] backdrop-blur-xl bg-card/95"
                align="end"
            >
                <div className="flex items-center justify-between p-4 border-b bg-muted/30 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-primary" />
                        <h4 className="font-bold text-sm tracking-tight text-foreground">Downloads</h4>
                    </div>
                    {downloads.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearHistory}
                            className="h-8 text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            Limpar Histórico
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {downloads.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-muted-foreground space-y-3">
                            <div className="relative">
                                <Download className="h-12 w-12 opacity-10" />
                                <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
                            </div>
                            <p className="text-xs font-medium opacity-40">Nenhum download recente</p>
                        </div>
                    ) : (
                        <div className="p-3 space-y-2.5">
                            <AnimatePresence mode="popLayout">
                                {downloads.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                        className="group relative overflow-hidden rounded-xl border bg-card/60 p-3 shadow-sm transition-all hover:bg-card hover:shadow-md hover:border-primary/20"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                                                item.type === 'pdf' ? "bg-red-500/10 border-red-500/20 text-red-600" :
                                                    item.type === 'zip' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-600" :
                                                        "bg-green-500/10 border-green-500/20 text-green-600"
                                            )}>
                                                {item.status === 'progress' ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <FileText className="h-5 w-5" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-semibold truncate leading-tight text-foreground" title={item.filename}>
                                                        {item.filename}
                                                    </p>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        {item.status === 'success' && (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeDownload(item.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-destructive/10 hover:text-destructive rounded-md"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                                    {format(item.timestamp, "d 'de' MMM, HH:mm", { locale: ptBR })}
                                                </p>

                                                {item.status === 'progress' && (
                                                    <div className="mt-3 space-y-1.5">
                                                        <div className="flex justify-between text-[9px] font-bold text-primary italic uppercase tracking-wider">
                                                            <span>Processando</span>
                                                            <span>{item.progress}%</span>
                                                        </div>
                                                        <Progress value={item.progress} className="h-1.5 bg-muted/50" />
                                                    </div>
                                                )}

                                                {item.status !== 'progress' && (
                                                    <div className="mt-3 flex items-center gap-1.5">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-8 text-[11px] font-bold px-3 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all flex-1"
                                                            onClick={() => handleOpenFile(item)}
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                                            Abrir
                                                        </Button>

                                                        {window.__TAURI__ && item.path && !item.path.startsWith('blob:') && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 border-border/60 hover:border-primary/50 transition-all shrink-0"
                                                                    onClick={() => handleOpenFolder(item)}
                                                                    title="Mostrar na pasta"
                                                                >
                                                                    <FolderOpen className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 border-border/60 hover:border-primary/50 transition-all shrink-0"
                                                                    onClick={() => handleCopyPath(item.path!)}
                                                                    title="Copiar caminho"
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>
                <div className="p-3 border-t bg-muted/20">
                    <p className="text-[10px] text-center text-muted-foreground font-medium">
                        Arquivos salvos automaticamente em Downloads
                    </p>
                </div>
            </PopoverContent>
        </Popover>
    );
};
