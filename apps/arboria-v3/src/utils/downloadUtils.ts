import { toast } from 'sonner';
import { platform } from '@/platform';
import type { DownloadResult } from '@/platform';

/**
 * Downloads or opens a file across different platforms using the Platform Adapter.
 * Returns the result with path and platform details.
 */
export const downloadFile = async (blob: Blob, filename: string): Promise<DownloadResult> => {
    console.log(`[Download] Platform: ${platform.platformName}, File: ${filename}`);

    try {
        return await platform.downloadFile(blob, filename);
    } catch (error: any) {
        console.error(`[Download] ${platform.platformName} error:`, error);

        // Specific error handling for Tauri bridge
        if (platform.platformName === 'tauri' &&
            (error.message?.includes('missing required key') || error.message?.includes('permission'))) {
            toast.error('Erro de permissão no Tauri. Verifique as configurações de ACL.');
        } else {
            console.error('[Download] Detailed error:', error);
            // Show the raw error message for better debugging
            const errorMessage = typeof error === 'string' ? error : error.message || JSON.stringify(error);
            toast.error(`Erro ao baixar arquivo: ${errorMessage}`);
        }

        // Final fallback to web download if the platform-specific method fails
        if (platform.platformName !== 'web') {
            console.log('[Download] Falling back to Web Download');
            const { WebAdapter } = await import('@/platform/web/adapter');
            return await WebAdapter.downloadFile(blob, filename);
        }

        return { path: '', platform: 'error' };
    }
};
