/**
 * Quota Monitor - IndexedDB Storage Monitoring
 * 
 * Monitors IndexedDB quota usage and warns users at 80% capacity.
 * Helps prevent silent failures from quota exceeded errors.
 * 
 * Risk Mitigation Story: PM-01 - IndexedDB Quota Exceeded
 */

export interface QuotaInfo {
    usage: number; // bytes used
    quota: number; // bytes available
    percentage: number; // 0-100
    warning: boolean; // true if > 80%
    critical: boolean; // true if > 95%
}

/**
 * Get current storage quota information
 * 
 * Uses StorageManager API (available in modern browsers)
 */
export async function getQuotaInfo(): Promise<QuotaInfo> {
    if (!navigator.storage || !navigator.storage.estimate) {
        // Fallback for browsers without StorageManager API
        return {
            usage: 0,
            quota: 50 * 1024 * 1024, // Assume 50MB default
            percentage: 0,
            warning: false,
            critical: false,
        };
    }

    try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage || 0;
        const quota = estimate.quota || 50 * 1024 * 1024;
        const percentage = (usage / quota) * 100;

        return {
            usage,
            quota,
            percentage,
            warning: percentage > 80,
            critical: percentage > 95,
        };
    } catch (error) {
        console.error('Failed to estimate quota:', error);
        return {
            usage: 0,
            quota: 50 * 1024 * 1024,
            percentage: 0,
            warning: false,
            critical: false,
        };
    }
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);

    return `${value.toFixed(2)} ${sizes[i]}`;
}

/**
 * Check if there's enough quota for a new photo
 * 
 * AC: Warn users before quota exceeded
 */
export async function canStorePhoto(sizeBytes: number): Promise<{
    canStore: boolean;
    reason?: string;
    quotaInfo: QuotaInfo;
}> {
    const quotaInfo = await getQuotaInfo();
    const afterStorage = quotaInfo.usage + sizeBytes;
    const afterPercentage = (afterStorage / quotaInfo.quota) * 100;

    // Block if would exceed 95%
    if (afterPercentage > 95) {
        return {
            canStore: false,
            reason: `Armazenamento quase cheio (${quotaInfo.percentage.toFixed(1)}%). Libere espaço antes de adicionar mais fotos.`,
            quotaInfo,
        };
    }

    // Warn if would exceed 80%
    if (afterPercentage > 80) {
        return {
            canStore: true,
            reason: `Atenção: Armazenamento em ${afterPercentage.toFixed(1)}% após esta foto. Considere sincronizar ou limpar cache.`,
            quotaInfo,
        };
    }

    return {
        canStore: true,
        quotaInfo,
    };
}

/**
 * Monitor quota periodically and dispatch events
 * 
 * Usage:
 * ```
 * startQuotaMonitoring((info) => {
 *   if (info.warning) {
 *     showWarningModal(info);
 *   }
 * });
 * ```
 */
export function startQuotaMonitoring(
    callback: (info: QuotaInfo) => void,
    intervalMs: number = 60000 // Check every minute
): () => void {
    const checkQuota = async () => {
        const info = await getQuotaInfo();
        callback(info);
    };

    // Initial check
    checkQuota();

    // Periodic checks
    const intervalId = setInterval(checkQuota, intervalMs);

    // Return cleanup function
    return () => clearInterval(intervalId);
}

/**
 * Get cleanup suggestions based on quota usage
 */
export async function getCleanupSuggestions(): Promise<string[]> {
    const quotaInfo = await getQuotaInfo();
    const suggestions: string[] = [];

    if (quotaInfo.percentage > 80) {
        suggestions.push('Sincronize fotos pendentes para a nuvem');
        suggestions.push('Limpe o cache de fotos já sincronizadas');
    }

    if (quotaInfo.percentage > 90) {
        suggestions.push('Delete árvores antigas que não são mais necessárias');
        suggestions.push('Considere usar um dispositivo com mais armazenamento');
    }

    return suggestions;
}
