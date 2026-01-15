import { invoke } from '@tauri-apps/api/core';
import { PlatformAdapter, DownloadResult } from '../types';

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

        const filePath = await invoke<string>('save_download_file', {
            filename,
            base64Data
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
    }
};
