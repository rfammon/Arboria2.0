import { RefreshCw, CloudOff, Wifi } from 'lucide-react';
import { useOfflineSync } from '../../context/OfflineSyncContext';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function OfflineSyncIndicator() {
    const { pendingPhotos, pendingActions, processQueue, isSyncing } = useOfflineSync();

    // Total pending items
    const totalPending = pendingPhotos + pendingActions;

    if (totalPending === 0 && !isSyncing) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 bg-background border border-border shadow-lg p-3 rounded-lg animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
                {isSyncing ? (
                    <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                ) : (
                    <CloudOff className="w-4 h-4 text-orange-500" />
                )}
                <div className="flex flex-col">
                    <span className="text-sm font-medium">
                        {isSyncing ? 'Sincronizando...' : 'Uploads Pendentes'}
                    </span>
                    {!isSyncing && (
                        <span className="text-xs text-muted-foreground">
                            {totalPending} {totalPending === 1 ? 'item' : 'itens'} aguardando
                        </span>
                    )}
                </div>
            </div>

            {!isSyncing && (
                <Button
                    size="sm"
                    variant="default"
                    className="h-8 gap-2"
                    onClick={() => {
                        if (!navigator.onLine) {
                            toast.error('Você ainda está offline.');
                            return;
                        }
                        processQueue();
                    }}
                >
                    <Wifi className="w-3 h-3" />
                    Sincronizar
                </Button>
            )}
        </div>
    );
}
