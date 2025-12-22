/**
 * Clinometer Hook - Tree Height Measurement
 * Based on original clinometer.js
 * Uses device orientation (gyroscope) and camera
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface ClinometerState {
    currentAngle: number;
    angleBase: number | null;
    angleTop: number | null;
    distance: number;
    calculatedHeight: number | null;
    isActive: boolean;
    cameraStream: MediaStream | null;
    error: string | null;
    step: 'distance' | 'base' | 'top' | 'result';
}

const ANGLE_SMOOTHING = 0.1; // 10% new value, 90% old value

export function useClinometer() {
    const [state, setState] = useState<ClinometerState>({
        currentAngle: 0,
        angleBase: null,
        angleTop: null,
        distance: 10,
        calculatedHeight: null,
        isActive: false,
        cameraStream: null,
        error: null,
        step: 'distance'
    });

    const streamRef = useRef<MediaStream | null>(null);
    const smoothedAngleRef = useRef<number>(0);

    // Handle device orientation
    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        const rawBeta = event.beta;
        if (rawBeta === null) return;

        // Calibrate: beta is 0° when device is flat, 90° when vertical
        // We want 0° when pointing horizontally
        const calibratedAngle = rawBeta - 90;

        // Smooth the angle to reduce jitter
        smoothedAngleRef.current =
            smoothedAngleRef.current * (1 - ANGLE_SMOOTHING) +
            calibratedAngle * ANGLE_SMOOTHING;

        setState(prev => ({
            ...prev,
            currentAngle: smoothedAngleRef.current
        }));
    }, []);

    // Request device orientation permission (iOS)
    const requestOrientationPermission = useCallback(async () => {
        if (typeof DeviceOrientationEvent !== 'undefined') {
            if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
                try {
                    const permission = await (DeviceOrientationEvent as any).requestPermission();
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                        return true;
                    } else {
                        setState(prev => ({
                            ...prev,
                            error: 'Permissão de sensores negada'
                        }));
                        return false;
                    }
                } catch (e) {
                    // Fallback for older browsers
                    window.addEventListener('deviceorientation', handleOrientation);
                    return true;
                }
            } else {
                // No permission needed
                window.addEventListener('deviceorientation', handleOrientation);
                return true;
            }
        } else {
            setState(prev => ({
                ...prev,
                error: 'Dispositivo não possui giroscópio'
            }));
            return false;
        }
    }, [handleOrientation]);

    // Start camera and sensors
    const startMeasurement = useCallback(async () => {
        // Request orientation permission
        const orientationOk = await requestOrientationPermission();
        if (!orientationOk) return;

        // Request camera access
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            }).catch(() => {
                // Fallback to any camera
                return navigator.mediaDevices.getUserMedia({ video: true });
            });

            streamRef.current = stream;

            setState(prev => ({
                ...prev,
                cameraStream: stream,
                isActive: true,
                error: null,
                step: 'distance'
            }));
        } catch (err) {
            setState(prev => ({
                ...prev,
                error: 'Erro ao acessar câmera. Verifique se está em HTTPS.',
                isActive: false
            }));
        }
    }, [requestOrientationPermission]);

    // Stop camera and sensors
    const stopMeasurement = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        window.removeEventListener('deviceorientation', handleOrientation);

        setState(prev => ({
            ...prev,
            cameraStream: null,
            isActive: false
        }));
    }, [handleOrientation]);

    // Set distance and move to base capture
    const setDistance = useCallback((dist: number) => {
        if (dist <= 0) {
            setState(prev => ({ ...prev, error: 'Distância deve ser maior que zero' }));
            return false;
        }

        setState(prev => ({
            ...prev,
            distance: dist,
            step: 'base',
            error: null
        }));
        return true;
    }, []);

    // Capture base angle
    const captureBase = useCallback(() => {
        setState(prev => ({
            ...prev,
            angleBase: prev.currentAngle,
            step: 'top'
        }));
    }, []);

    // Capture top angle and calculate height
    const captureTop = useCallback(() => {
        setState(prev => {
            const angleTop = prev.currentAngle;
            const height = calculateTreeHeight(prev.distance, prev.angleBase!, angleTop);

            return {
                ...prev,
                angleTop,
                calculatedHeight: height,
                step: 'result'
            };
        });
    }, []);

    // Reset measurement
    const reset = useCallback(() => {
        setState(prev => ({
            ...prev,
            angleBase: null,
            angleTop: null,
            calculatedHeight: null,
            step: 'distance',
            error: null
        }));
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [handleOrientation]);

    return {
        ...state,
        startMeasurement,
        stopMeasurement,
        setDistance,
        captureBase,
        captureTop,
        reset
    };
}

/**
 * Calculates tree height using trigonometry
 * Formula: height = distance × (tan(angleTop) - tan(angleBase))
 */
function calculateTreeHeight(
    distance: number,
    angleBase: number,
    angleTop: number
): number {
    const radTop = (angleTop * Math.PI) / 180;
    const radBase = (angleBase * Math.PI) / 180;

    // tan(top) - tan(base) handles negative base angles correctly
    const height = distance * (Math.tan(radTop) - Math.tan(radBase));

    return Math.abs(height);
}
