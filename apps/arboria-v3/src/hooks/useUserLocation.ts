import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * User Location Hook - GPS Tracking with Auto-Disable
 * 
 * Epic 8: GPS User Location Tracking
 * 
 * Features:
 * - Continuous GPS tracking with watchPosition
 * - Auto-disable after 5min inactivity (battery saving)
 * - Accuracy filtering (min 50m)
 * - Permission handling
 * - Error states
 */

export interface UserLocation {
    latitude: number;
    longitude: number;
    accuracy: number; // meters
    timestamp: number;
    heading?: number; // degrees (0-360)
    speed?: number; // m/s
}

export type TrackingState = 'off' | 'loading' | 'active' | 'error';

export interface UseUserLocationOptions {
    autoDisableMinutes?: number; // Default: 5
    minAccuracyMeters?: number; // Default: 50
    enableAutoDisable?: boolean; // Default: true
}

export function useUserLocation(options: UseUserLocationOptions = {}) {
    const {
        autoDisableMinutes = 5,
        minAccuracyMeters = 50,
        enableAutoDisable = true,
    } = options;

    // State
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [state, setState] = useState<TrackingState>('off');
    const [error, setError] = useState<string | null>(null);

    // Refs
    const watchIdRef = useRef<number | null>(null);
    const autoDisableTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastInteractionRef = useRef<number>(Date.now());

    /**
     * Stop GPS tracking
     */
    const stopTracking = useCallback(() => {
        console.log('[useUserLocation] Stopping GPS tracking...');

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (autoDisableTimerRef.current) {
            clearTimeout(autoDisableTimerRef.current);
            autoDisableTimerRef.current = null;
        }

        setState('off');
        setError(null);
    }, []);

    /**
     * Reset auto-disable timer
     * Called on user interaction with map
     */
    const resetAutoDisableTimer = useCallback(() => {
        lastInteractionRef.current = Date.now();

        if (!enableAutoDisable || state !== 'active') return;

        // Clear existing timer
        if (autoDisableTimerRef.current) {
            clearTimeout(autoDisableTimerRef.current);
        }

        // Set new timer
        autoDisableTimerRef.current = setTimeout(() => {
            console.log('[useUserLocation] Auto-disable timer expired');
            toast.info('Rastreamento GPS desativado por inatividade');
            stopTracking();
        }, autoDisableMinutes * 60 * 1000);
    }, [enableAutoDisable, state, autoDisableMinutes, stopTracking]);

    /**
     * Start GPS tracking
     */
    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocalização não disponível neste dispositivo');
            setState('error');
            toast.error('GPS não disponível');
            return;
        }

        console.log('[useUserLocation] Starting GPS tracking...');
        setState('loading');
        setError(null);

        // Request permission and start watching
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy, heading, speed } = position.coords;
                const timestamp = position.timestamp;

                console.log(`[useUserLocation] GPS update: ±${accuracy.toFixed(0)}m`);

                // Filter low-accuracy updates
                if (accuracy > minAccuracyMeters) {
                    console.warn(`[useUserLocation] Ignoring low-accuracy update (${accuracy.toFixed(0)}m > ${minAccuracyMeters}m)`);
                    return;
                }

                // Update location
                setLocation({
                    latitude,
                    longitude,
                    accuracy,
                    timestamp,
                    heading: heading ?? undefined,
                    speed: speed ?? undefined,
                });

                // Transition to active state
                if (state !== 'active') {
                    setState('active');
                    toast.success('GPS ativado');
                }

                // Reset auto-disable timer
                resetAutoDisableTimer();
            },
            (err) => {
                console.error('[useUserLocation] GPS error:', err);

                let errorMessage = 'Erro ao obter local ização';
                let errorDescription = '';

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Permissão de localização negada';
                        errorDescription = 'Autorize o acesso à localização nas configurações do navegador.';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'GPS não disponível';
                        errorDescription = 'Este recurso requer um dispositivo com GPS (smartphone/tablet). Computadores geralmente não possuem GPS integrado.';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Timeout ao obter localização';
                        errorDescription = 'Não foi possível obter sua localização em tempo hábil. Tente novamente.';
                        break;
                }

                setError(errorMessage);
                setState('error');

                // Show detailed error with description
                toast.error(errorMessage, {
                    description: errorDescription,
                    duration: 6000, // Show longer for user to read
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5000, // Cache position for 5s
            }
        );

        // Start auto-disable timer
        resetAutoDisableTimer();
    }, [minAccuracyMeters, state, resetAutoDisableTimer]);

    /**
     * Cleanup on unmount
     */
    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, [stopTracking]);

    return {
        location,
        state,
        isTracking: state === 'active' || state === 'loading',
        error,
        startTracking,
        stopTracking,
        resetAutoDisableTimer, // Expose for map interaction handlers
    };
}
