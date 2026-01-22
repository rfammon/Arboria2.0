import { getPlatform, isMobile } from './platform';

export type NavigationApp = 'google' | 'waze' | 'apple';

export const openNavigationApp = (lat: number, lng: number, app: NavigationApp = 'google') => {
    if (!lat || !lng) {
        console.error('Invalid coordinates for navigation');
        return;
    }

    const platform = getPlatform();

    if (app === 'waze') {
        const url = isMobile() 
            ? `waze://?ll=${lat},${lng}&navigate=yes`
            : `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
        
        if (isMobile()) {
            window.location.href = url;
        } else {
            window.open(url, '_blank');
        }
        return;
    }

    if (app === 'apple' || (app === 'google' && platform === 'ios')) {
        if (platform === 'ios' && app === 'apple') {
            window.location.href = `maps://?q=${lat},${lng}`;
            return;
        }
    }

    // Default to Google Maps
    // For mobile, try to open the app via intent/URL scheme
    if (isMobile()) {
        const url = platform === 'android'
            ? `geo:${lat},${lng}?q=${lat},${lng}`
            : `comgooglemaps://?q=${lat},${lng}`;
        
        window.location.href = url;
        
        // Fallback to web if app doesn't open after 500ms
        setTimeout(() => {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
        }, 500);
    } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
};
