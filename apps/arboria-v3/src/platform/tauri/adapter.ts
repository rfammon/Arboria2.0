import { invoke } from '@tauri-apps/api/core';
import type { PlatformAdapter, DownloadResult } from '../types';

export const TauriAdapter: PlatformAdapter = {
    platformName: 'tauri',
    isNative: true,

    async downloadFile(blob: Blob, filename: string): Promise<DownloadResult> {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        console.log('[TauriAdapter] Calling save_download_file with:', { filename, base64Length: base64Data?.length });
        const filePath = await invoke<string>('save_download_file', {
            filename,
            payload: base64Data
        });

        return { path: filePath, platform: 'tauri' };
    },

    async openFile(path: string): Promise<void> {
        try {
            await invoke('open_file_natively', { path });
        } catch (e) {
            console.warn('[TauriAdapter] Native open failed, trying plugins:', e);
            try {
                await invoke('plugin:opener|open_path', { path });
            } catch (openerErr) {
                await invoke('plugin:shell|open', { path });
            }
        }
    },

    async showInFolder(path: string): Promise<void> {
        await invoke('show_in_folder', { path });
    },

    async selectDirectory(): Promise<string | null> {
        if (!(window as any).__TAURI__) return null;

        try {
            const selected = await (window as any).__TAURI__.dialog.open({
                directory: true,
                multiple: false,
                defaultPath: await (window as any).__TAURI__.path.downloadDir()
            });
            return selected as string | null;
        } catch (e) {
            console.error('[TauriAdapter] Error in selectDirectory:', e);
            return null;
        }
    },

    async deleteFile(path: string): Promise<void> {
        await invoke('delete_file', { path });
    },

    async getAppVersion(): Promise<string> {
        const { getVersion } = await import('@tauri-apps/api/app');
        return await getVersion();
    },

    async installUpdate(localPath: string): Promise<void> {
        await this.openFile(localPath);
    },
    supportsOfflineCapture: false // Use server-side capture for maps on Tauri (using local Node server)
};
