export interface DownloadResult {
    path: string;
    platform: string;
}

export interface PlatformAdapter {
    platformName: 'android' | 'ios' | 'tauri' | 'web';
    isNative: boolean;

    downloadFile(blob: Blob, filename: string): Promise<DownloadResult>;
    openFile(path: string): Promise<void>;
    showInFolder?(path: string): Promise<void>;
    selectDirectory?(): Promise<string | null>;
    deleteFile?(path: string): Promise<void>;
    getAppVersion(): Promise<string>;
    installUpdate(localPath: string): Promise<void>;
    supportsOfflineCapture: boolean;
}
