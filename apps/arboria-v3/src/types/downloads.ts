export interface DownloadItem {
    id: string;
    filename: string;
    path?: string;
    type: 'pdf' | 'csv' | 'zip';
    status: 'progress' | 'success' | 'error';
    progress: number;
    timestamp: number;
    error?: string;
}
