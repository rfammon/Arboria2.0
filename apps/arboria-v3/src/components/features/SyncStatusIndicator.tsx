import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function SyncStatusIndicator() {
    const { isSyncing, pendingActions, pendingPhotos } = useOfflineSync();
    const isOnline = useOnlineStatus();

    const totalPending = pendingActions + pendingPhotos;

    if (!isOnline) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium animate-in fade-in slide-in-from-top-2">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Offline ({totalPending} pendentes)</span>
            </div>
        );
    }

    if (isSyncing) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sincronizando...</span>
            </div>
        );
    }

    if (totalPending > 0) {
        return (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{totalPending} aguardando</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium transition-colors">
            <Cloud className="w-3.5 h-3.5" />
            <span>Online</span>
        </div>
    );
}
