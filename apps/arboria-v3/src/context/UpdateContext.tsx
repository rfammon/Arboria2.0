import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { App } from '@capacitor/app';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

// --- Types ---

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready-to-install' | 'installing' | 'error';

interface UpdateState {
    status: UpdateStatus;
    error: string | null;
    progress: number;
    currentVersion: string;
    latestVersion: string | null;
    releaseNotes: string | null;
    apkUrl: string | null;
    apkFilePath: string | null; // Local file path of downloaded APK
    hasUpdate: boolean;
}

interface UpdateContextType extends UpdateState {
    checkForUpdates: () => Promise<void>;
    downloadApk: () => Promise<void>;
    installApk: () => Promise<void>;
    cleanupApk: () => Promise<void>;
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
        apkUrl: null,
        apkFilePath: null,
        hasUpdate: false,
    });

    // Initialize - get current app version and cleanup old APKs
    useEffect(() => {
        const init = async () => {
            try {
                const appInfo = await App.getInfo().catch(() => ({ version: 'Unknown' }));
                setState(s => ({ ...s, currentVersion: appInfo.version }));

                // Cleanup any residual APKs in cache
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
                    // Ignore readdir errors
                    console.log('[Update] Storage cleanup skipped or failed');
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
                body: { currentVersion: state.currentVersion }
            });

            if (error) throw error;

            if (data.hasUpdate && data.apkUrl) {
                setState(s => ({
                    ...s,
                    status: 'available',
                    latestVersion: data.latestVersion,
                    releaseNotes: data.releaseNotes,
                    apkUrl: data.apkUrl,
                    hasUpdate: true,
                }));
                toast.info(`Nova versão ${data.latestVersion} disponível!`);
            } else {
                setState(s => ({ ...s, status: 'idle', hasUpdate: false }));
                toast.info('Você já está na versão mais recente.');
            }
        } catch (e: any) {
            console.error('[Update] Check failed:', e);
            setState(s => ({ ...s, status: 'error', error: e.message }));
            toast.error('Erro ao verificar atualizações.');
        }
    }, [state.currentVersion, state.status]);

    // Download APK to local storage
    const downloadApk = useCallback(async () => {
        if (!state.apkUrl) {
            toast.error('URL do APK não disponível.');
            return;
        }

        setState(s => ({ ...s, status: 'downloading', progress: 0, error: null }));

        try {
            const { Capacitor } = await import('@capacitor/core');
            const { Filesystem, Directory } = await import('@capacitor/filesystem');
            const platform = Capacitor.getPlatform();

            console.log('[Update] Platform detected:', platform);
            console.log('[Update] Downloading APK from:', state.apkUrl);

            // On web, just open the link
            if (platform === 'web') {
                window.open(state.apkUrl, '_blank');
                setState(s => ({ ...s, status: 'idle', progress: 0 }));
                return;
            }

            toast.info('Baixando atualização...');
            const fileName = `arboria-update-${state.latestVersion}.apk`;

            console.log('[Update] Starting native download to:', fileName);

            // Use native downloadFile for binary safety and better performance
            const downloadResult = await Filesystem.downloadFile({
                url: state.apkUrl,
                path: fileName,
                directory: Directory.Cache,
            });

            console.log('[Update] Download result:', JSON.stringify(downloadResult));

            // Verify file exists and has size
            const fileInfo = await Filesystem.stat({
                path: fileName,
                directory: Directory.Cache
            });
            console.log('[Update] Downloaded file size:', fileInfo.size, 'bytes');

            if (fileInfo.size < 1000000) { // Less than 1MB is suspicious for this APK
                throw new Error(`Arquivo baixado parece incompleto (${(fileInfo.size / 1024).toFixed(0)} KB)`);
            }

            const stats = await Filesystem.getUri({
                path: fileName,
                directory: Directory.Cache
            });

            // Strip file:// prefix just in case FileOpener prefers raw path on some versions
            const rawPath = stats.uri.replace(/^file:\/\//, '');
            console.log('[Update] APK URIs:', { uri: stats.uri, rawPath });

            setState(s => ({
                ...s,
                status: 'ready-to-install',
                progress: 100,
                apkFilePath: stats.uri
            }));

            toast.success('Download concluído! Clique em Instalar.');

        } catch (e: any) {
            console.error('[Update] Download failed:', e);
            setState(s => ({ ...s, status: 'error', error: e.message }));
            toast.error('Falha no download: ' + e.message);
        }
    }, [state.apkUrl, state.latestVersion]);

    // Install the downloaded APK
    const installApk = useCallback(async () => {
        if (!state.apkFilePath) {
            toast.error('APK não encontrado. Faça o download primeiro.');
            return;
        }

        setState(s => ({ ...s, status: 'installing' }));

        try {
            const { FileOpener } = await import('@capacitor-community/file-opener');

            console.log('[Update] Opening APK for installation:', state.apkFilePath);
            toast.info('Abrindo instalador...');

            await FileOpener.open({
                filePath: state.apkFilePath,
                contentType: 'application/vnd.android.package-archive',
            });

            console.log('[Update] FileOpener.open() succeeded');

            // Keep the status as installing - user will restart app after install
            toast.success('Instalador aberto! Siga as instruções do Android.', {
                duration: 10000,
            });

        } catch (e: any) {
            console.error('[Update] Install failed:', e);
            console.error('[Update] Error details:', JSON.stringify(e));
            setState(s => ({ ...s, status: 'error', error: e.message }));
            toast.error('Erro ao abrir instalador: ' + e.message);
        }
    }, [state.apkFilePath]);

    // Cleanup - delete downloaded APK
    const cleanupApk = useCallback(async () => {
        if (!state.apkFilePath) return;

        try {
            const { Filesystem } = await import('@capacitor/filesystem');

            // Extract filename from URI
            const fileName = state.apkFilePath.split('/').pop();
            if (!fileName) return;

            await Filesystem.deleteFile({
                path: fileName,
                directory: (await import('@capacitor/filesystem')).Directory.Cache,
            });

            console.log('[Update] APK cleaned up:', fileName);

            setState(s => ({
                ...s,
                status: 'idle',
                progress: 0,
                apkFilePath: null,
                hasUpdate: false
            }));

        } catch (e: any) {
            // Ignore cleanup errors - file may already be deleted
            console.warn('[Update] Cleanup warning:', e.message);
        }
    }, [state.apkFilePath]);

    return (
        <UpdateContext.Provider value={{
            ...state,
            checkForUpdates,
            downloadApk,
            installApk,
            cleanupApk
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
