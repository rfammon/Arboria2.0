import { Capacitor } from '@capacitor/core';

export const openNavigationApp = (lat: number, lng: number) => {
    if (!lat || !lng) {
        console.error('Invalid coordinates for navigation');
        return;
    }

    const isIOS = Capacitor.getPlatform() === 'ios';

    if (isIOS) {
        // Redirect to Apple Maps
        window.location.href = `maps://?q=${lat},${lng}`;
    } else {
        // Redirect to Google Maps (works on Android and Web fallback)
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
};
