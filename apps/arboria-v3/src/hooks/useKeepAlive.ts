import { useEffect, useCallback } from 'react';
import { App } from '@capacitor/app';
import { ReportService } from '../services/reportService';

export const useKeepAlive = () => {
    const pingServer = useCallback(async () => {
        console.log('[KeepAlive] Pinging report server...');
        await ReportService.healthCheck();
    }, []);

    useEffect(() => {
        // 1. Immediate ping on mount
        pingServer();

        // 2. Periodic ping every 14 minutes (Render hibernates at 15m)
        const interval = setInterval(pingServer, 14 * 60 * 1000);

        // 3. Ping on App Resume
        const listener = App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
                console.log('[KeepAlive] App resumed, waking up server...');
                pingServer();
            }
        });

        return () => {
            clearInterval(interval);
            listener.then(l => l.remove());
        };
    }, [pingServer]);
};
