import { useState, useEffect } from 'react';
import { formatFileSize, type CompressionResult } from '@/lib/photoCompression';

interface PhotoPreviewProps {
    compressedPhoto: CompressionResult;
}

/**
 * PhotoPreview Component
 * Story 1.1: AC1 - Shows preview of compressed photo before confirming
 * 
 * Displays:
 * - Preview image
 * - Compression statistics (original size, compressed size, savings%)
 */
export function PhotoPreview({ compressedPhoto }: PhotoPreviewProps) {
    const [preview, setPreview] = useState<string>('');

    useEffect(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(compressedPhoto.compressedFile);

        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [compressedPhoto.compressedFile]);

    return (
        <div className="space-y-3">
            {/* AC1: Preview image */}
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                {preview ? (
                    <img
                        src={preview}
                        alt="Photo preview"
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="text-sm text-muted-foreground">Loading preview...</div>
                    </div>
                )}
            </div>

            {/* Compression statistics */}
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/50 p-3">
                <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground">Original</div>
                    <div className="text-sm font-semibold">{formatFileSize(compressedPhoto.originalSize)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground">Compressed</div>
                    <div className="text-sm font-semibold">{formatFileSize(compressedPhoto.compressedSize)}</div>
                </div>
                <div className="text-center">
                    <div className="text-xs font-medium text-muted-foreground">Saved</div>
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {compressedPhoto.compressionRatio.toFixed(0)}%
                    </div>
                </div>
            </div>

            {/* EXIF data preview (if available) */}
            {compressedPhoto.exifData && (
                <div className="text-xs text-muted-foreground">
                    <div>📍 GPS: {compressedPhoto.exifData.latitude && compressedPhoto.exifData.longitude
                        ? `${compressedPhoto.exifData.latitude.toFixed(6)}, ${compressedPhoto.exifData.longitude.toFixed(6)}`
                        : 'Not available'
                    }</div>
                    <div>📅 {compressedPhoto.exifData.timestamp?.toLocaleString() || 'No timestamp'}</div>
                </div>
            )}
        </div>
    );
}
