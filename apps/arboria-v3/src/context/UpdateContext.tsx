import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { App } from '@capacitor/app';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

// --- Types ---

type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'ready-to-install' | 'error';

interface UpdateState {
    status: UpdateStatus;
    error: string | null;
    progress: number;
    currentVersion: string;
    latestVersion: string | null;
    releaseNotes: string | null;
    apkUrl: string | null;
    hasUpdate: boolean;
}

interface UpdateContextType extends UpdateState {
    checkForUpdates: () => Promise<void>;
    downloadAndInstall: () => Promise<void>;
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
        hasUpdate: false,
    });

    // Initialize - get current app version
    useEffect(() => {
        const init = async () => {
            try {
                const appInfo = await App.getInfo().catch(() => ({ version: 'Unknown' }));
                setState(s => ({ ...s, currentVersion: appInfo.version }));
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

    // Download APK and trigger installation
    const downloadAndInstall = useCallback(async () => {
        if (!state.apkUrl) {
            toast.error('URL do APK não disponível.');
            return;
        }

        setState(s => ({ ...s, status: 'downloading', progress: 0 }));

        try {
            // Import Capacitor to check platform
            const { Capacitor } = await import('@capacitor/core');
            const platform = Capacitor.getPlatform();

            console.log('[Update] Platform detected:', platform);

            // On web (browser), we can't download due to CORS - open link directly
            if (platform === 'web') {
                toast.info('Abrindo link de download...');
                window.open(state.apkUrl, '_blank');
                setState(s => ({ ...s, status: 'idle', progress: 0 }));
                return;
            }

            toast.info('Iniciando download...');

            // On native (Android), fetch works without CORS restrictions
            const response = await fetch(state.apkUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            const reader = response.body?.getReader();

            if (!reader) throw new Error('Failed to get response reader');

            const chunks: Uint8Array[] = [];
            let received = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                received += value.length;

                if (total > 0) {
                    const progress = Math.round((received / total) * 100);
                    setState(s => ({ ...s, progress }));
                }
            }

            // Combine chunks into a single blob
            const blob = new Blob(chunks as BlobPart[], { type: 'application/vnd.android.package-archive' });
            const base64 = await blobToBase64(blob);

            // Save to filesystem
            const fileName = `arboria-${state.latestVersion}.apk`;
            const result = await Filesystem.writeFile({
                path: fileName,
                data: base64,
                directory: Directory.Cache,
            });

            setState(s => ({ ...s, status: 'ready-to-install', progress: 100 }));
            toast.success('Download concluído!');

            // Open the APK for installation
            const fileUri = result.uri;
            await triggerApkInstall(fileUri);

        } catch (e: any) {
            console.error('[Update] Download failed:', e);
            setState(s => ({ ...s, status: 'error', error: e.message }));
            toast.error('Falha no download: ' + e.message);
        }
    }, [state.apkUrl, state.latestVersion]);

    return (
        <UpdateContext.Provider value={{ ...state, checkForUpdates, downloadAndInstall }}>
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

// --- Helpers ---

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            // Remove data URL prefix if present
            const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
            resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function triggerApkInstall(fileUri: string): Promise<void> {
    // On Android, we need to use an intent to install the APK
    // This works with Capacitor by opening a content:// or file:// URI
    // The FileOpener plugin or native code is typically needed here

    // For now, we'll try using the App plugin's openUrl
    // This may need to be replaced with a custom plugin or @capacitor-community/file-opener
    try {
        // Convert file URI to content URI if needed for Android 7+
        const { Capacitor } = await import('@capacitor/core');

        if (Capacitor.getPlatform() === 'android') {
            // Show instructions to user - user must open file manager to install
            toast.info('APK baixado! Abra o gerenciador de arquivos para instalar.', {
                duration: 10000,
                description: `Arquivo: ${fileUri}`,
            });

            // TODO: Integrate @capacitor-community/file-opener for seamless installation
            console.log('[Update] APK saved to:', fileUri);
        }
    } catch (e) {
        console.error('[Update] Failed to trigger install:', e);
        throw e;
    }
}
