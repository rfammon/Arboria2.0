import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

export type DensityMode = 'field' | 'office';

/**
 * Hook to manage UI density based on the running environment.
 * 'field' density is for mobile field workers (Capacitor).
 * 'office' density is for power users (Desktop/Tauri/Web).
 */
export function useDensity() {
    const [mode, setMode] = useState<DensityMode>('office');

    useEffect(() => {
        const platform = Capacitor.getPlatform();

        // Determine density mode
        // Capacitor platforms 'android' or 'ios' are considered 'field' mode.
        // Everything else (web, electron/tauri detected as web) is 'office' mode.
        let currentMode: DensityMode = 'office';

        if (platform === 'android' || platform === 'ios') {
            currentMode = 'field';
        } else if ((window as any).__TAURI_INTERNALS__) {
            // Precise check for Tauri environment if needed, though default office is fine.
            currentMode = 'office';
        }

        setMode(currentMode);
        // Apply attribute to html element
        document.documentElement.setAttribute('data-density', currentMode);

        console.log(`[Arboria] Density mode set to: ${currentMode} (${platform})`);

        // No cleanup needed as this is a global side effect on mount
    }, []);

    return mode;
}
