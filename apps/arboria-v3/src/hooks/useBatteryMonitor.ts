import { useState, useEffect } from 'react';

/**
 * Battery Monitor Hook
 * 
 * Monitors battery status and estimates GPS tracking impact.
 * Epic 8: GPS User Location Tracking
 */

export interface BatteryStatus {
    level: number; // 0-100
    isCharging: boolean;
    chargingTime?: number; // seconds
    dischargingTime?: number; // seconds
}

export type BatteryImpact = 'low' | 'medium' | 'high';

export interface UseBatteryMonitorReturn {
    batteryStatus: BatteryStatus | null;
    batteryImpact: BatteryImpact;
    isSupported: boolean;
}

export function useBatteryMonitor(isTracking: boolean): UseBatteryMonitorReturn {
    const [batteryStatus, setBatteryStatus] = useState<BatteryStatus | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if Battery API is supported
        if (!('getBattery' in navigator)) {
            console.warn('[useBatteryMonitor] Battery API not supported');
            setIsSupported(false);
            return;
        }

        setIsSupported(true);

        let battery: any;

        const updateBatteryStatus = (bat: any) => {
            setBatteryStatus({
                level: Math.round(bat.level * 100),
                isCharging: bat.charging,
                chargingTime: bat.chargingTime !== Infinity ? bat.chargingTime : undefined,
                dischargingTime: bat.dischargingTime !== Infinity ? bat.dischargingTime : undefined,
            });
        };

        // Get battery and set up listeners
        (navigator as any).getBattery().then((bat: any) => {
            battery = bat;
            updateBatteryStatus(bat);

            // Listen for battery changes
            bat.addEventListener('levelchange', () => updateBatteryStatus(bat));
            bat.addEventListener('chargingchange', () => updateBatteryStatus(bat));
            bat.addEventListener('chargingtimechange', () => updateBatteryStatus(bat));
            bat.addEventListener('dischargingtimechange', () => updateBatteryStatus(bat));
        });

        return () => {
            if (battery) {
                battery.removeEventListener('levelchange', updateBatteryStatus);
                battery.removeEventListener('chargingchange', updateBatteryStatus);
                battery.removeEventListener('chargingtimechange', updateBatteryStatus);
                battery.removeEventListener('dischargingtimechange', updateBatteryStatus);
            }
        };
    }, []);

    /**
     * Estimate battery impact from GPS tracking
     * 
     * Heuristics:
     * - If charging: low impact
     * - GPS typically drains 5-10%/hour
     * - low: < 5%/h
     * - medium: 5-10%/h
     * - high: > 10%/h
     */
    const estimateBatteryImpact = (): BatteryImpact => {
        if (!isTracking) return 'low';
        if (batteryStatus?.isCharging) return 'low';

        // If we have discharging time, calculate drain rate
        if (batteryStatus?.dischargingTime && batteryStatus.dischargingTime > 0) {
            const hoursRemaining = batteryStatus.dischargingTime / 3600;
            const drainRatePerHour = (batteryStatus.level / hoursRemaining);

            if (drainRatePerHour > 10) return 'high';
            if (drainRatePerHour > 5) return 'medium';
            return 'low';
        }

        // Fallback: assume medium impact for GPS tracking
        return 'medium';
    };

    return {
        batteryStatus,
        batteryImpact: estimateBatteryImpact(),
        isSupported,
    };
}
