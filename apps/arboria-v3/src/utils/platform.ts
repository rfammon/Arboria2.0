import { Capacitor } from '@capacitor/core';

export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isMobile = () => isAndroid() || isIOS();

export const isTauri = () => {
    // @ts-ignore
    return !!window.__TAURI__;
};

export const getPlatform = () => {
    if (isTauri()) return 'tauri';
    if (isAndroid()) return 'android';
    if (isIOS()) return 'ios';
    return 'web';
};
