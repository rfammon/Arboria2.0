import { Capacitor } from '@capacitor/core';

export type NavigationApp = 'google' | 'waze' | 'apple';

export const openNavigationApp = (lat: number, lng: number, app: NavigationApp = 'google') => {
    if (!lat || !lng) {
        console.error('Invalid coordinates for navigation');
        return;
    }

    const isIOS = Capacitor.getPlatform() === 'ios';

    if (app === 'waze') {
        window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
        return;
    }

    if (app === 'apple' || (app === 'google' && isIOS)) {
        // Apple Maps is default on iOS if not explicitly asking for google
        // But if explicitly asking for google we should use google.
        // Let's simplify:
        if (isIOS && app === 'apple') {
            window.location.href = `maps://?q=${lat},${lng}`;
            return;
        }
    }

    // Default to Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
};
