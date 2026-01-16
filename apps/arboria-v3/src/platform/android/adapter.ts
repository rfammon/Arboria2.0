import type { PlatformAdapter, DownloadResult } from '../types';

export const AndroidAdapter: PlatformAdapter = {
    platformName: 'android',
    isNative: true,

    async downloadFile(blob: Blob, filename: string): Promise<DownloadResult> {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { FileOpener } = await import('@capacitor-community/file-opener');
        const { sanitizeFilename } = await import('../../utils/fileUtils');

        const sanitizedFilename = sanitizeFilename(filename);
        console.log(`[AndroidAdapter] Original: ${filename}, Sanitized: ${sanitizedFilename}`);

        // Robust Base64 conversion (avoiding potential FileReader flakiness with large PDFs)
        let base64Data: string;
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            base64Data = window.btoa(binary);
        } catch (e) {
            console.warn('[AndroidAdapter] ArrayBuffer conversion failed, falling back to FileReader:', e);
            const reader = new FileReader();
            base64Data = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }

        // Defensive: Remove any possible whitespace or incorrect prefix
        base64Data = base64Data.trim().replace(/\s/g, '');

        const writeResult = await Filesystem.writeFile({
            path: sanitizedFilename,
            data: base64Data,
            directory: Directory.Cache,
        });

        console.log(`[AndroidAdapter] File written to: ${writeResult.uri}`);

        // Tauri solution: Ensure we use a clean path for the opener
        // Some Android readers fail with "corrupted" error when receiving a file:/// URI 
        // if they expect a content:// URI or a direct path handle.
        // FileOpener usually handles this, but passing a cleaned path is more robust.
        const cleanPath = writeResult.uri.replace('file://', '');

        await FileOpener.open({
            filePath: writeResult.uri, // FileOpener usually prefers the URI with provider
            contentType: blob.type || 'application/pdf',
        });

        return { path: cleanPath, platform: 'android' };
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
    }
};
