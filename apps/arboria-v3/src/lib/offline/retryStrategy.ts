export interface RetryableAction {
    id: string;
    retryCount: number;
    lastAttempt?: Date;
}

/**
 * Calcula o delay antes da próxima tentativa usando backoff exponencial
 * Formula: min(maxDelay, baseDelay * 2^retryCount) + random jitter
 *
 * @param retryCount - Número de tentativas anteriores
 * @param baseDelay - Delay inicial em ms (padrão: 1000ms = 1s)
 * @param maxDelay - Delay máximo em ms (padrão: 60000ms = 1min)
 * @returns Delay em milissegundos
 */
export function calculateBackoff(
    retryCount: number,
    baseDelay = 1000,
    maxDelay = 60000
): number {
    // Exponencial: 1s, 2s, 4s, 8s, 16s, 32s, 60s (cap)
    const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, retryCount));

    // Jitter: adiciona aleatoriedade de ±20% para evitar "thundering herd"
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);

    return Math.floor(exponentialDelay + jitter);
}

/**
 * Verifica se uma ação está pronta para retry
 *
 * @param action - Ação com metadados de retry
 * @returns true se deve tentar agora, false se deve esperar
 */
export function shouldRetryNow(action: RetryableAction): boolean {
    if (!action.lastAttempt) return true;  // Primeira tentativa

    const elapsed = Date.now() - action.lastAttempt.getTime();
    const requiredDelay = calculateBackoff(action.retryCount);

    return elapsed >= requiredDelay;
}
