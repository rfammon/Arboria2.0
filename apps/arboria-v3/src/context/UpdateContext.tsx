import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { platform } from '@/platform';

// --- Types ---

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready-to-install' | 'installing' | 'error';

interface UpdateState {
    status: UpdateStatus;
    error: string | null;
    progress: number;
    currentVersion: string;
    latestVersion: string | null;
    releaseNotes: string | null;
    updateUrl: string | null;
    localFilePath: string | null;
    hasUpdate: boolean;
}

interface UpdateContextType extends UpdateState {
    checkForUpdates: () => Promise<void>;
    downloadUpdate: () => Promise<void>;
    installUpdate: () => Promise<void>;
    cleanupUpdate: () => Promise<void>;
}

const UpdateContext = createContext<UpdateContextType | null>(null);

// --- Provider ---

export function UpdateProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<UpdateState>({
        status: 'idle',
        error: null,
        progress: 0,
        currentVersion: 'Loading...',
        latestVersion: null,
        releaseNotes: null,
        updateUrl: null,
        localFilePath: null,
        hasUpdate: false,
    });

    // Initialize - get current app version and cleanup old files
    useEffect(() => {
        const init = async () => {
            try {
                const version = await platform.getAppVersion().catch(() => 'Unknown');
                setState(s => ({ ...s, currentVersion: version }));

                // Platform specific cleanup if needed
                if (platform.platformName === 'android') {
                    const { Filesystem, Directory } = await import('@capacitor/filesystem');
                    try {
                        const result = await Filesystem.readdir({
                            path: '',
                            directory: Directory.Cache
                        });

                        for (const file of result.files) {
                            if (file.name.endsWith('.apk')) {
                                await Filesystem.deleteFile({
                                    path: file.name,
                                    directory: Directory.Cache
                                }).catch(() => { });
                                console.log('[Update] Residual APK cleaned up:', file.name);
                            }
                        }
                    } catch (e) {
                        console.log('[Update] Storage cleanup skipped or failed');
                    }
                }

            } catch (error) {
                console.error('[Update] Init failed:', error);
            }
        };
        init();
    }, []);

    // Check for updates via Edge Function
    const checkForUpdates = useCallback(async () => {
        if (state.status === 'downloading') return;
        setState(s => ({ ...s, status: 'checking', error: null, progress: 0 }));

        try {
            const { data, error } = await supabase.functions.invoke('get-latest-version', {
                body: {
                    currentVersion: state.currentVersion,
                    platform: platform.platformName
                }
            });

            if (error) throw error;

            if (data.hasUpdate && data.updateUrl) {
                setState(s => ({
                    ...s,
                    status: 'available',
                    latestVersion: data.latestVersion,
                    releaseNotes: data.releaseNotes,
                    updateUrl: data.updateUrl,
                    hasUpdate: true,
                }));
                toast.info(`Nova versão ${data.latestVersion} disponível para ${platform.platformName}!`);
            } else {
                setState(s => ({ ...s, status: 'idle', hasUpdate: false }));
                if (data.error) {
                    console.log('[Update] Notice:', data.error);
                } else {
                    toast.info('Você já está na versão mais recente.');
                }
            }
        } catch (e: any) {
            console.error('[Update] Check failed:', e);
            setState(s => ({ ...s, status: 'error', error: e.message }));
            toast.error('Erro ao verificar atualizações.');
        }
    }, [state.currentVersion, state.status]);

    // Download update to local storage
    const downloadUpdate = useCallback(async () => {
        if (!state.updateUrl) {
            toast.error('URL de atualização não disponível.');
            return;
        }

        setState(s => ({ ...s, status: 'downloading', progress: 0, error: null }));

        try {
            console.log('[Update] Downloading from:', state.updateUrl);

            // On web, just open the link
            if (platform.platformName === 'web') {
                window.open(state.updateUrl, '_blank');
                setState(s => ({ ...s, status: 'idle', progress: 0 }));
                return;
            }

            toast.info('Baixando atualização...');

            // Determine file name based on platform
            const extension = platform.platformName === 'tauri' ? 'exe' : 'apk';
            const fileName = `arboria-update-${state.latestVersion}.${extension}`;

            if (platform.platformName === 'android') {
                const { Filesystem, Directory } = await import('@capacitor/filesystem');
                const downloadResult = await Filesystem.downloadFile({
                    url: state.updateUrl,
                    path: fileName,
                    directory: Directory.Cache,
                });

                setState(s => ({
                    ...s,
                    status: 'ready-to-install',
                    progress: 100,
                    localFilePath: downloadResult.path || null
                }));
            } else if (platform.platformName === 'tauri') {
                // For Tauri, we'll use a fetch-and-save approach via our custom save_download_file command
                const response = await fetch(state.updateUrl);
                const blob = await response.blob();
                const { path } = await platform.downloadFile(blob, fileName);

                setState(s => ({
                    ...s,
                    status: 'ready-to-install',
                    progress: 100,
                    localFilePath: path
                }));
            }

            toast.success('Download concluído! Clique em Instalar.');

        } catch (e: any) {
            console.error('[Update] Download failed:', e);
            setState(s => ({ ...s, status: 'error', error: e.message }));
            toast.error('Falha no download: ' + e.message);
        }
    }, [state.updateUrl, state.latestVersion]);

    // Install the downloaded update
    const installUpdate = useCallback(async () => {
        if (!state.localFilePath) {
            toast.error('Arquivo não encontrado. Faça o download primeiro.');
            return;
        }

        setState(s => ({ ...s, status: 'installing' }));

        try {
            toast.info('Iniciando instalação...');
            await platform.installUpdate(state.localFilePath);

            if (platform.platformName === 'tauri') {
                toast.success('Instalador iniciado! O app será atualizado.', { duration: 5000 });
            } else {
                toast.success('Instalador aberto! Siga as instruções do Android.', { duration: 10000 });
            }

        } catch (e: any) {
            console.error('[Update] Install failed:', e);
            setState(s => ({ ...s, status: 'error', error: e.message }));
            toast.error('Erro ao abrir instalador: ' + e.message);
        }
    }, [state.localFilePath]);

    // Cleanup - delete downloaded file
    const cleanupUpdate = useCallback(async () => {
        if (!state.localFilePath) return;

        try {
            if (platform.platformName === 'android') {
                const { Filesystem, Directory } = await import('@capacitor/filesystem');
                const fileName = state.localFilePath.split('/').pop();
                if (fileName) {
                    await Filesystem.deleteFile({
                        path: fileName,
                        directory: Directory.Cache,
                    });
                }
            }
            // Add Tauri cleanup if necessary, although usually installers are in Downloads

            console.log('[Update] Cleanup complete');

            setState(s => ({
                ...s,
                status: 'idle',
                progress: 0,
                localFilePath: null,
                hasUpdate: false
            }));

        } catch (e: any) {
            console.warn('[Update] Cleanup warning:', e.message);
        }
    }, [state.localFilePath]);

    return (
        <UpdateContext.Provider value={{
            ...state,
            checkForUpdates,
            downloadUpdate,
            installUpdate,
            cleanupUpdate
        }}>
            {children}
        </UpdateContext.Provider>
    );
}

export function useUpdate() {
    const context = useContext(UpdateContext);
    if (!context) {
        throw new Error('useUpdate must be used within an UpdateProvider');
    }
    return context;
}
