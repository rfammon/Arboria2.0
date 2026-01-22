import type { PlatformAdapter, DownloadResult } from '../types';

export const AndroidAdapter: PlatformAdapter = {
    platformName: 'android',
    isNative: true,

    async downloadFile(blob: Blob, filename: string): Promise<DownloadResult> {
        try {
            const { Filesystem, Directory } = await import('@capacitor/filesystem');
            const { FileOpener } = await import('@capacitor-community/file-opener');
            const { sanitizeFilename } = await import('../../utils/fileUtils');

            const sanitizedFilename = sanitizeFilename(filename);

            // Robust Base64 conversion
            let base64Data: string;
            try {
                const reader = new FileReader();
                base64Data = await new Promise<string>((resolve, reject) => {
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        if (!result) return reject(new Error("Empty result"));
                        const base64 = result.split(',')[1];
                        if (!base64) reject(new Error("Invalid base64"));
                        else resolve(base64);
                    };
                    reader.onerror = () => reject(new Error("Reader error"));
                    reader.readAsDataURL(blob);
                });
            } catch (e: any) {
                throw new Error(`Erro na conversão: ${e.message}`);
            }

            base64Data = base64Data.trim().replace(/\s/g, '');

            // Write File to CACHE (Safer permissions)
            let writeResult;
            try {
                writeResult = await Filesystem.writeFile({
                    path: sanitizedFilename,
                    data: base64Data,
                    directory: Directory.Cache, // Changed from Documents to Cache
                    recursive: true
                });
            } catch (writeError: any) {
                console.error("Write Error:", writeError);
                throw new Error(`Erro ao salvar em Cache: ${writeError.message}`);
            }

            console.log(`[AndroidAdapter] File written to: ${writeResult.uri}`);

            // Open File
            try {
                await FileOpener.open({
                    filePath: writeResult.uri,
                    contentType: blob.type || 'application/pdf',
                });
            } catch (openError: any) {
                console.error("Open Error:", openError);
                throw new Error(`Erro ao abrir visualizador: ${openError.message}`);
            }

            // Using Cache, we might not want to promise "Saved in Documents"
            // But for now, let's just confirm it opened.
            /* 
            await Toast.show({
                text: `Arquivo aberto temporariamente`,
                duration: 'short'
            });
            */

            return { path: writeResult.uri, platform: 'android' };

        } catch (error: any) {
            console.error('[AndroidAdapter] Critical Error:', error);
            // Try to show toast if Toast plugin is available (dynamic import inside catch might fail if network is down?)
            // But we can try 'window.alert' as a crude fallback if Toast fails, but let's stick to Toast import if possible.
            try {
                const { Toast } = await import('@capacitor/toast');
                await Toast.show({
                    text: `Android Error: ${error.message}`,
                    duration: 'long'
                });
            } catch (e) {
                console.error("Failed to show error toast", e);
            }
            throw error;
        }
    },

    async openFile(path: string): Promise<void> {
        const { FileOpener } = await import('@capacitor-community/file-opener');
        await FileOpener.open({
            filePath: path,
        });
    },

    async getAppVersion(): Promise<string> {
        const { App } = await import('@capacitor/app');
        const info = await App.getInfo();
        return info.version;
    },

    async installUpdate(localPath: string): Promise<void> {
        const { FileOpener } = await import('@capacitor-community/file-opener');
        await FileOpener.open({
            filePath: localPath,
            contentType: 'application/vnd.android.package-archive',
        });
    },

    async deleteFile(path: string): Promise<void> {
        const { Filesystem } = await import('@capacitor/filesystem');
        await Filesystem.deleteFile({
            path: path
        });
    },

    supportsOfflineCapture: true
};
