import { supabase } from '../supabase';

interface ConnectivityStatus {
    online: boolean;
    latency: number;  // ms
    lastCheck: Date;
    quality: 'excellent' | 'good' | 'poor' | 'offline';
}

let cachedStatus: ConnectivityStatus = {
    online: false,
    latency: Infinity,
    lastCheck: new Date(),
    quality: 'offline'
};

let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * Verifica conectividade REAL fazendo um lightweight request ao Supabase
 * Se o ping falhar ou demorar > 5s, considera offline
 */
async function checkConnectivity(): Promise<ConnectivityStatus> {
    const startTime = Date.now();

    try {
        // Lightweight query: verifica se consegue acessar o Supabase
        // Usa uma query simples que sempre retorna rapidamente
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const { error } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1)
            .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        const latency = Date.now() - startTime;

        if (error && error.message.includes('aborted')) {
            return { online: false, latency: Infinity, lastCheck: new Date(), quality: 'offline' };
        }

        // Classificação de qualidade baseada em latência
        let quality: ConnectivityStatus['quality'];
        if (latency < 200) quality = 'excellent';
        else if (latency < 1000) quality = 'good';
        else quality = 'poor';

        return { online: true, latency, lastCheck: new Date(), quality };

    } catch (error) {
        console.warn('[Heartbeat] Connectivity check failed:', error);
        return { online: false, latency: Infinity, lastCheck: new Date(), quality: 'offline' };
    }
}

/**
 * Inicia verificação periódica de conectividade
 * @param intervalMs - Intervalo entre checks (padrão: 30s)
 */
export function startHeartbeat(intervalMs = 30000) {
    // Check inicial
    checkConnectivity().then(status => {
        cachedStatus = status;
    });

    // Verificação periódica
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }

    heartbeatInterval = setInterval(async () => {
        cachedStatus = await checkConnectivity();
    }, intervalMs);
}

export function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

/**
 * Retorna o status de conectividade atual (cached)
 * IMPORTANTE: Este valor é atualizado a cada 30s
 */
export function getConnectivityStatus(): ConnectivityStatus {
    return cachedStatus;
}

/**
 * Força uma verificação imediata (use antes de operações críticas)
 */
export async function recheckConnectivity(): Promise<ConnectivityStatus> {
    cachedStatus = await checkConnectivity();
    return cachedStatus;
}
