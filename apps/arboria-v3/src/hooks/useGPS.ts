/**
 * GPS Hook - Precise Location Capture
 * Implements Weighted Average and Median Filter for improved software-level accuracy.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { latLonToUTM, type UTMCoordinates } from '../lib/coordinateUtils';
import Gnss, { type GnssMeasurementEvent } from '../lib/plugins/GnssPlugin';
import { Capacitor } from '@capacitor/core';

export interface GPSCoordinates {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

export interface GPSState {
    coordinates: GPSCoordinates | null;
    utmCoords: UTMCoordinates | null;
    isSearching: boolean;
    bestAccuracy: number;
    samples: number;
    error: string | null;
}

const TIMEOUT_MS = 20000; // 20 seconds
const MIN_SAMPLES = 5;
const TARGET_ACCURACY = 5; // meters

export function useGPS() {
    const [state, setState] = useState<GPSState>({
        coordinates: null,
        utmCoords: null,
        isSearching: false,
        bestAccuracy: Infinity,
        samples: 0,
        error: null
    });

    const watchIdRef = useRef<number | null>(null);
    const timeoutIdRef = useRef<number | null>(null);
    const samplesRef = useRef<GeolocationPosition[]>([]);

    const cleanup = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (timeoutIdRef.current !== null) {
            clearTimeout(timeoutIdRef.current);
            timeoutIdRef.current = null;
        }
        setState(prev => ({ ...prev, isSearching: false }));
    }, []);

    // Median Filter to remove outliers
    const filterOutliers = (positions: GeolocationPosition[]) => {
        if (positions.length < 3) return positions;

        const lats = positions.map(p => p.coords.latitude).sort((a, b) => a - b);
        const lngs = positions.map(p => p.coords.longitude).sort((a, b) => a - b);

        const medianLat = lats[Math.floor(lats.length / 2)];
        const medianLng = lngs[Math.floor(lngs.length / 2)];

        // Simple outlier rejection: discard points too far from median
        // Threshold: ~15 meters (approx 0.00015 degrees)
        return positions.filter(p => {
            return Math.abs(p.coords.latitude - medianLat) < 0.00015 &&
                Math.abs(p.coords.longitude - medianLng) < 0.00015;
        });
    };

    const calculateWeightedAverage = (positions: GeolocationPosition[]): GPSCoordinates | null => {
        if (positions.length === 0) return null;

        const filtered = filterOutliers(positions);
        if (filtered.length === 0) {
            // Fallback to last position
            const last = positions[positions.length - 1];
            return {
                latitude: last.coords.latitude,
                longitude: last.coords.longitude,
                accuracy: last.coords.accuracy,
                timestamp: last.timestamp
            };
        }

        let totalLat = 0;
        let totalLng = 0;
        let totalWeight = 0;
        let bestAcc = Infinity;

        filtered.forEach(pos => {
            const acc = pos.coords.accuracy;
            const weight = 1 / (acc * acc); // Inverse variance weighting
            totalLat += pos.coords.latitude * weight;
            totalLng += pos.coords.longitude * weight;
            totalWeight += weight;
            if (acc < bestAcc) bestAcc = acc;
        });

        return {
            latitude: totalLat / totalWeight,
            longitude: totalLng / totalWeight,
            accuracy: bestAcc, // Optimistic accuracy
            timestamp: Date.now()
        };
    };

    const getPreciseLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: 'GPS não disponível neste dispositivo',
                isSearching: false
            }));
            return;
        }

        setState({
            coordinates: null,
            utmCoords: null,
            isSearching: true,
            bestAccuracy: Infinity,
            samples: 0,
            error: null
        });

        samplesRef.current = [];

        const finishCollection = () => {
            if (samplesRef.current.length === 0) {
                setState(prev => ({
                    ...prev,
                    error: 'Nenhum sinal GPS detectado',
                    isSearching: false
                }));
                return;
            }

            const result = calculateWeightedAverage(samplesRef.current);
            if (result) {
                const utm = latLonToUTM(result.latitude, result.longitude);
                setState(prev => ({
                    ...prev,
                    coordinates: result,
                    utmCoords: utm,
                    isSearching: false,
                    error: null
                }));
            }
            cleanup();
        };

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        // Timeout handler
        timeoutIdRef.current = window.setTimeout(() => {
            finishCollection();
        }, TIMEOUT_MS);

        // Watch position
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const accuracy = position.coords.accuracy;

                // Add to samples if it reasonable
                if (accuracy < 30) {
                    samplesRef.current.push(position);
                    setState(prev => ({
                        ...prev,
                        samples: samplesRef.current.length,
                        bestAccuracy: Math.min(prev.bestAccuracy, accuracy)
                    }));
                }

                // If we have enough good samples, we can finish early? 
                // No, "Burst" implies collecting to improve. 
                // Refinements: waiting for more samples improves Mean.
                // But user wants to avoid "Burst do levantamento".
                // I will keeping collecting until timeout OR until we get "Excellent" accuracy (e.g. < 3m) consistently?
                // For now, I'll stick to collecting for at least a few seconds or until accuracy is great.

                if (samplesRef.current.length >= MIN_SAMPLES && accuracy < TARGET_ACCURACY) {
                    // Fast conversion if we have great signal
                    finishCollection();
                }
            },
            (error) => {
                setState(prev => ({
                    ...prev,
                    error: `Erro no GPS: ${error.message}`
                }));
            },
            options
        );
    }, [cleanup]);

    const stop = useCallback(() => {
        if (samplesRef.current.length > 0) {
            // If stopped manually, calculation what we have
            const result = calculateWeightedAverage(samplesRef.current);
            if (result) {
                const utm = latLonToUTM(result.latitude, result.longitude);
                setState(prev => ({
                    ...prev,
                    coordinates: result,
                    utmCoords: utm,
                    isSearching: false,
                    error: null
                }));
            }
        }
        cleanup();
    }, [cleanup]);

    const startAdvancedGPS = useCallback(async () => {
        if (Capacitor.getPlatform() === 'web') {
            console.warn('GPS Avançado (GnssPlugin) não suportado na Web');
            return;
        }

        // Reset state for new capture
        setState({
            coordinates: null,
            utmCoords: null,
            isSearching: true,
            bestAccuracy: Infinity,
            samples: 0,
            error: null
        });

        try {
            // Listen for smoothed location events from Hatch Filter
            await Gnss.addListener('smoothed_location', (event: any) => {
                // 'event' is SmoothedLocation
                const utm = latLonToUTM(event.latitude, event.longitude);
                setState(prev => ({
                    ...prev,
                    coordinates: {
                        latitude: event.latitude,
                        longitude: event.longitude,
                        accuracy: event.accuracy,
                        timestamp: Date.now()
                    },
                    utmCoords: utm,
                    bestAccuracy: event.accuracy,
                    samples: prev.samples + 1, // Increment simply to show activity
                    isSearching: true // Keep it "searching" (refining)
                }));
            });

            // Keep raw logging for debug if needed
            await Gnss.addListener('gnss_measurement', (_: GnssMeasurementEvent) => {
                // Optional: console.log('Raw GNSS:', _);
            });

            await Gnss.start();
            console.log('Advanced GPS (Hatch Filter) started');
        } catch (e) {
            console.error('Failed to start Advanced GPS:', e);
            setState(prev => ({ ...prev, error: 'Falha ao iniciar GPS Avançado', isSearching: false }));
        }
    }, [cleanup]);

    // Ensure cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
            if (Capacitor.getPlatform() !== 'web') {
                Gnss.stop().catch(e => console.error('Error stopping Gnss on unmount:', e));
            }
        };
    }, [cleanup]);

    const stopAdvancedGPS = useCallback(async () => {
        if (Capacitor.getPlatform() === 'web') return;
        try {
            await Gnss.stop();
            setState(prev => ({ ...prev, isSearching: false }));
            console.log('Advanced GPS stopped');
        } catch (e) {
            console.error('Failed to stop Advanced GPS:', e);
        }
    }, []);

    return {
        ...state,
        getPreciseLocation,
        stop,
        startAdvancedGPS,
        stopAdvancedGPS
    };
}
