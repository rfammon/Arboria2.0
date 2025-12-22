import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
    compressPhoto,
    checkImageQuality,
    type CompressionResult,
} from '@/lib/photoCompression';

interface UsePhotoCaptureReturn {
    capturePhoto: () => Promise<void>;
    uploadPhoto: (file: File) => Promise<void>;
    isCapturing: boolean;
    capturedPhoto: CompressionResult | null;
    error: string | null;
    lowLightWarning: boolean;
    resetCapture: () => void;
}

/**
 * Custom hook for capturing and compressing photos with device camera
 * Story 1.1: Camera Photo Capture with Compression
 * 
 * Features:
 * - Integrates with Capacitor Camera plugin
 * - Automatic compression after capture (AC1)
 * - Low-light quality checking (AC2)
 * - Error handling
 * 
 * @example
 * ```tsx
 * const { capturePhoto, capturedPhoto, lowLightWarning } = usePhotoCapture();
 * 
 * <Button onClick={capturePhoto}>Capture</Button>
 * {lowLightWarning && <Alert>Poor lighting detected</Alert>}
 * ```
 */
export function usePhotoCapture(): UsePhotoCaptureReturn {
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState<CompressionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lowLightWarning, setLowLightWarning] = useState(false);

    const processFile = async (file: File) => {
        try {
            setError(null);
            setLowLightWarning(false);

            // AC2: Check image quality for low-light warning
            try {
                const qualityCheck = await checkImageQuality(file);
                if (qualityCheck.isLowLight) {
                    setLowLightWarning(true);
                }
            } catch (qualityError) {
                console.warn('Quality check failed:', qualityError);
            }

            // AC1: Compress photo with EXIF preservation
            const compressed = await compressPhoto(file);

            // Verify compression worked (should be <= 2MB)
            const maxSizeBytes = 2 * 1024 * 1024; // 2MB
            if (compressed.compressedSize > maxSizeBytes) {
                console.warn(
                    `Compressed size (${compressed.compressedSize}) exceeded 2MB target. ` +
                    `Using anyway, but may need to reduce quality.`
                );
            }

            setCapturedPhoto(compressed);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to process photo';
            setError(message);
            console.error('Photo processing error:', err);
        } finally {
            setIsCapturing(false);
        }
    };

    const capturePhoto = async () => {
        try {
            setIsCapturing(true);
            setError(null);
            setLowLightWarning(false);

            // AC1: Open device camera
            const image = await Camera.getPhoto({
                quality: 90,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
                allowEditing: false,
            });

            if (!image.webPath) {
                throw new Error('Camera did not return an image');
            }

            // Convert camera output to File object
            const response = await fetch(image.webPath);
            const blob = await response.blob();
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

            await processFile(file);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to capture photo';
            // Ignorar erro se usuário cancelou
            if (!message.includes('User cancelled')) {
                setError(message);
                console.error('Photo capture error:', err);
            }
            setIsCapturing(false);
        }
    };

    const uploadPhoto = async (file: File) => {
        setIsCapturing(true);
        await processFile(file);
    };

    const resetCapture = () => {
        setCapturedPhoto(null);
        setError(null);
        setLowLightWarning(false);
    };

    return {
        capturePhoto,
        uploadPhoto,
        isCapturing,
        capturedPhoto,
        error,
        lowLightWarning,
        resetCapture,
    };
}
