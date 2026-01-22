import { Capacitor } from '@capacitor/core';
import type { PlatformAdapter } from './types';
import { TauriAdapter } from './tauri/adapter';
import { AndroidAdapter } from './android/adapter';
import { WebAdapter } from './web/adapter';

const getAdapter = (): PlatformAdapter => {
    if (typeof window !== 'undefined') {
        const isTauri = !!((window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__);
        if (isTauri) return TauriAdapter;
    }

    const platformName = Capacitor.getPlatform();
    if (platformName === 'android' || platformName === 'ios') {
        return AndroidAdapter;
    }

    return WebAdapter;
};

export const platform = getAdapter();
export * from './types';
