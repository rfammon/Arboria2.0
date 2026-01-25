import { useActionQueue } from '../../stores/useActionQueue';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useEffect, useState } from 'react';

export default function SyncStatus() {
    const { queue } = useActionQueue();
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <Card className="bg-muted/30">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-medium text-sm">Status da Conexão</h3>
                        <p className="text-xs text-muted-foreground">
                            {isOnline ? 'Online - Sincronizado' : 'Offline - Modo Local'}
                        </p>
                    </div>
                </div>

                {queue.length > 0 && (
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full text-xs font-medium border border-yellow-200">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        {queue.length} pendente(s)
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
