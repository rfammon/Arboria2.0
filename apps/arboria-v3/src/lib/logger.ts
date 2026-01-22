type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    module: string;
    action?: string;
    userId?: string;
    [key: string]: any;
}

class Logger {
    private level: LogLevel;
    private enabled: boolean;

    constructor() {
        // Em produção, só loga errors
        this.level = import.meta.env.PROD ? 'error' : 'debug';
        this.enabled = import.meta.env.DEV || localStorage.getItem('debug') === 'true';
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.enabled) return false;

        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        const currentIndex = levels.indexOf(this.level);
        const targetIndex = levels.indexOf(level);

        return targetIndex >= currentIndex;
    }

    private formatMessage(level: LogLevel, context: LogContext, message: string): string {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}] [${context.module}]`;

        if (context.action) {
            return `${prefix} ${context.action}: ${message}`;
        }

        return `${prefix} ${message}`;
    }

    debug(context: LogContext, message: string, data?: any) {
        if (!this.shouldLog('debug')) return;
        console.debug(this.formatMessage('debug', context, message), data || '');
    }

    info(context: LogContext, message: string, data?: any) {
        if (!this.shouldLog('info')) return;
        console.info(this.formatMessage('info', context, message), data || '');
    }

    warn(context: LogContext, message: string, data?: any) {
        if (!this.shouldLog('warn')) return;
        console.warn(this.formatMessage('warn', context, message), data || '');
    }

    error(context: LogContext, message: string, error?: Error | any) {
        if (!this.shouldLog('error')) return;

        const errorData = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error;

        console.error(this.formatMessage('error', context, message), errorData);

        // BONUS: Envia para serviço de monitoring (Sentry, etc) quando disponível
        if (import.meta.env.PROD && typeof window !== 'undefined' && (window as any).Sentry) {
            (window as any).Sentry.captureException(error, {
                contexts: {
                    module: context.module,
                    action: context.action,
                    extra: context
                }
            });
        }
    }
}

export const logger = new Logger();
