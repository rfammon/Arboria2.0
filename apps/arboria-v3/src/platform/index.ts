import { Capacitor } from '@capacitor/core';
import { PlatformAdapter } from './types';
import { TauriAdapter } from './tauri/adapter';
import { AndroidAdapter } from './android/adapter';
import { WebAdapter } from './web/adapter';

const getAdapter = (): PlatformAdapter => {
    if (window.__TAURI__) {
        return TauriAdapter;
    }

    const platform = Capacitor.getPlatform();
    if (platform === 'android' || platform === 'ios') {
        return AndroidAdapter;
    }

    return WebAdapter;
};

export const platform = getAdapter();
export * from './types';
