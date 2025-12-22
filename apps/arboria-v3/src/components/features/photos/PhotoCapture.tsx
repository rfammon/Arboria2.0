import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, AlertTriangle, Loader2, Upload } from 'lucide-react';
import { usePhotoCapture } from '@/hooks/usePhotoCapture';
import { PhotoPreview } from './PhotoPreview';
import type { CompressionResult } from '@/lib/photoCompression';

interface PhotoCaptureProps {
    onPhotoConfirmed: (photo: CompressionResult) => void;
    onCancel?: () => void;
}

/**
 * PhotoCapture Component
 * Story 1.1: Camera Photo Capture with Compression
 * 
 * Implements:
 * - AC1: Camera button, capture, auto-compress, preview
 * - AC2: Low light warning with retake option
 * - Fallback: File upload for devices without camera support
 */
export function PhotoCapture({ onPhotoConfirmed, onCancel }: PhotoCaptureProps) {
    const {
        capturePhoto,
        uploadPhoto,
        isCapturing,
        capturedPhoto,
        error,
        lowLightWarning,
        resetCapture,
    } = usePhotoCapture();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleConfirm = () => {
        if (!capturedPhoto) return;
        onPhotoConfirmed(capturedPhoto);
    };

    const handleRetake = () => {
        resetCapture();
        capturePhoto();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadPhoto(file);
        }
        // Reset input value to allow selecting same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            {!capturedPhoto ? (
                <>
                    {/* AC1: Camera capture button */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Button
                            onClick={capturePhoto}
                            disabled={isCapturing}
                            size="lg"
                            className="w-full"
                        >
                            {isCapturing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Camera...
                                </>
                            ) : (
                                <>
                                    <Camera className="mr-2 h-5 w-5" />
                                    Camera
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isCapturing}
                            variant="secondary"
                            size="lg"
                            className="w-full"
                        >
                            <Upload className="mr-2 h-5 w-5" />
                            Upload
                        </Button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                    />

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {onCancel && (
                        <Button
                            onClick={onCancel}
                            variant="outline"
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    )}
                </>
            ) : (
                <>
                    {/* AC1: Preview before confirming */}
                    <PhotoPreview compressedPhoto={capturedPhoto} />

                    {/* AC2: Low light warning */}
                    {lowLightWarning && (
                        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                                <strong>Poor lighting detected.</strong> Image quality may be reduced.
                                You can retake the photo or proceed anyway.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        <Button
                            onClick={handleRetake}
                            variant="outline"
                            className="flex-1"
                        >
                            Retake
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1"
                        >
                            Confirm Photo
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
