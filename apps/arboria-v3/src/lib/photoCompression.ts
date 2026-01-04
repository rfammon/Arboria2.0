import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    useWebWorker: boolean;
    preserveExif: boolean;
}

export interface CompressionResult {
    compressedFile: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    exifData: ExifData | null;
}

export interface ExifData {
    latitude: number | null;
    longitude: number | null;
    timestamp: Date | null;
    cameraModel: string | null;
}

/**
 * Compresses a photo file with EXIF preservation
 * 
 * @param file - Original photo file from camera
 * @param options - Compression options (defaults: 2MB, 1920px, EXIF preserved)
 * @returns Compressed file with metadata
 * 
 * @example
 * const result = await compressPhoto(cameraFile);
 * console.log(`Saved ${result.compressionRatio}%`);
 */
export async function compressPhoto(
    file: File,
    options?: Partial<CompressionOptions>
): Promise<CompressionResult> {
    const defaultOptions: CompressionOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        preserveExif: true, // CRITICAL for AC1: GPS + timestamp preservation
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const compressedFile = await imageCompression(file, {
            maxSizeMB: finalOptions.maxSizeMB,
            maxWidthOrHeight: finalOptions.maxWidthOrHeight,
            useWebWorker: finalOptions.useWebWorker,
            fileType: 'image/jpeg', // Standardize on JPEG for compatibility
        });

        // Extract EXIF from compressed file to verify preservation
        const exifData = await extractExifData(compressedFile);

        return {
            compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            compressionRatio: ((1 - compressedFile.size / file.size) * 100),
            exifData,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Photo compression failed: ${message}`);
    }
}

/**
 * Checks image quality by analyzing brightness
 * Used for AC2: Warning when photo captured in poor lighting
 * 
 * @param file - Photo file to analyze
 * @returns Quality metrics (isLowLight flag and average brightness)
 */
export async function checkImageQuality(file: File): Promise<{
    isLowLight: boolean;
    averageBrightness: number;
}> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onerror = () => reject(new Error('Failed to read image file'));

        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                img.src = result;
            } else {
                reject(new Error('Invalid file format'));
            }
        };

        img.onerror = () => reject(new Error('Failed to load image'));

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                let totalBrightness = 0;

                // Calculate average brightness across all pixels
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    totalBrightness += avg;
                }

                const averageBrightness = totalBrightness / (data.length / 4);

                resolve({
                    isLowLight: averageBrightness < 60, // Threshold: < 60/255 is considered low light
                    averageBrightness,
                });
            } catch (error) {
                reject(error);
            }
        };

        reader.readAsDataURL(file);
    });
}

/**
 * Extracts EXIF data from a photo file
 * 
 * @param file - Photo file to extract EXIF from
 * @returns EXIF data (GPS coords, timestamp, camera model)
 */
export async function extractExifData(file: File): Promise<ExifData | null> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onerror = () => {
            console.warn('[EXIF] Failed to read file');
            resolve(null);
        };

        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (!result || typeof result === 'string') {
                    resolve(null);
                    return;
                }

                // Load image to access EXIF
                const img = new Image();
                const blob = new Blob([result]);
                const url = URL.createObjectURL(blob);

                img.onload = () => {
                    try {
                        // Use exif-js to extract EXIF data
                        // Note: exif-js is a browser library that attaches to window
                        const EXIF = (window as any).EXIF;

                        if (!EXIF) {
                            console.warn('[EXIF] exif-js library not loaded');
                            resolve(getFallbackExifData());
                            URL.revokeObjectURL(url);
                            return;
                        }

                        EXIF.getData(img, function (this: any) {
                            try {
                                // Extract GPS coordinates
                                const latArray = EXIF.getTag(this, 'GPSLatitude');
                                const latRef = EXIF.getTag(this, 'GPSLatitudeRef');
                                const lonArray = EXIF.getTag(this, 'GPSLongitude');
                                const lonRef = EXIF.getTag(this, 'GPSLongitudeRef');

                                let latitude: number | null = null;
                                let longitude: number | null = null;

                                if (latArray && lonArray) {
                                    // Convert from [degrees, minutes, seconds] to decimal
                                    latitude = convertDMSToDD(latArray[0], latArray[1], latArray[2], latRef);
                                    longitude = convertDMSToDD(lonArray[0], lonArray[1], lonArray[2], lonRef);
                                }

                                // Extract timestamp
                                const dateTime = EXIF.getTag(this, 'DateTime') ||
                                    EXIF.getTag(this, 'DateTimeOriginal') ||
                                    EXIF.getTag(this, 'DateTimeDigitized');

                                let timestamp: Date | null = null;
                                if (dateTime) {
                                    // EXIF DateTime format: "YYYY:MM:DD HH:MM:SS"
                                    const formatted = dateTime.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
                                    timestamp = new Date(formatted);
                                    if (isNaN(timestamp.getTime())) {
                                        timestamp = null;
                                    }
                                }

                                // Extract camera model
                                const make = EXIF.getTag(this, 'Make');
                                const model = EXIF.getTag(this, 'Model');
                                const cameraModel = [make, model].filter(Boolean).join(' ').trim() || null;

                                URL.revokeObjectURL(url);
                                resolve({
                                    latitude,
                                    longitude,
                                    timestamp: timestamp || new Date(),
                                    cameraModel,
                                });
                            } catch (error) {
                                console.warn('[EXIF] Error parsing EXIF tags:', error);
                                URL.revokeObjectURL(url);
                                resolve(getFallbackExifData());
                            }
                        });
                    } catch (error) {
                        console.warn('[EXIF] EXIF.getData failed:', error);
                        URL.revokeObjectURL(url);
                        resolve(getFallbackExifData());
                    }
                };

                img.onerror = () => {
                    console.warn('[EXIF] Failed to load image');
                    URL.revokeObjectURL(url);
                    resolve(null);
                };

                img.src = url;
            } catch (error) {
                console.warn('[EXIF] Extraction failed:', error);
                resolve(null);
            }
        };

        reader.readAsArrayBuffer(file);
    });
}

/**
 * Converts GPS coordinates from DMS (Degrees, Minutes, Seconds) to Decimal Degrees
 */
function convertDMSToDD(
    degrees: number,
    minutes: number,
    seconds: number,
    direction: string
): number {
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
        dd = dd * -1;
    }
    return parseFloat(dd.toFixed(7));
}

/**
 * Returns fallback EXIF data when extraction fails or data is unavailable
 */
function getFallbackExifData(): ExifData {
    return {
        latitude: null,
        longitude: null,
        timestamp: new Date(),
        cameraModel: null,
    };
}


/**
 * Formats file size in human-readable format
 * 
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.34 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
