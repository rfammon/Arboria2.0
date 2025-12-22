import { vi } from 'vitest';

export const PushNotifications = {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    register: vi.fn(),
    addListener: vi.fn(),
    removeAllListeners: vi.fn(),
};

export const Capacitor = {
    getPlatform: vi.fn().mockReturnValue('web'),
    isNativePlatform: vi.fn().mockReturnValue(false),
};
