import type { PlatformAdapter, DownloadResult } from '../types';

export const WebAdapter: PlatformAdapter = {
    platformName: 'web',
    isNative: false,

    async downloadFile(blob: Blob, filename: string): Promise<DownloadResult> {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 1000);

        return { path: url, platform: 'web' };
    },

    async openFile(path: string): Promise<void> {
        window.open(path, '_blank');
    },

    async getAppVersion(): Promise<string> {
        return '1.0.0-web';
    },

    async installUpdate(localPath: string): Promise<void> {
        window.open(localPath, '_blank');
    }
};
