import { PlatformAdapter, DownloadResult } from '../types';

export const AndroidAdapter: PlatformAdapter = {
    platformName: 'android',
    isNative: true,

    async downloadFile(blob: Blob, filename: string): Promise<DownloadResult> {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { FileOpener } = await import('@capacitor-community/file-opener');

        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        const writeResult = await Filesystem.writeFile({
            path: filename,
            data: base64Data,
            directory: Directory.Cache,
        });

        await FileOpener.open({
            filePath: writeResult.uri,
            contentType: blob.type || 'application/pdf',
        });

        return { path: writeResult.uri, platform: 'android' };
    },

    async openFile(path: string): Promise<void> {
        const { FileOpener } = await import('@capacitor-community/file-opener');
        await FileOpener.open({
            filePath: path,
        });
    }
};
