/**
 * TypeScript type definitions for photo-related functionality
 * Story 1.1: Camera Photo Capture with Compression
 * Story 1.2: Photo Preview and Management
 */

export interface PhotoMetadata {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    width?: number;
    height?: number;
    capturedAt: Date;
    exifData?: ExifData;
}

export interface ExifData {
    latitude: number | null;
    longitude: number | null;
    timestamp: Date | null;
    cameraModel: string | null;
    altitude?: number | null;
    orientation?: number;
}

export interface CapturedPhoto {
    file: File;
    metadata: PhotoMetadata;
    preview?: string; // Base64 data URL for preview
}

export interface PhotoCompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    quality?: number;
    preserveExif?: boolean;
}

/**
 * Story 1.2: Enhanced photo type with sync status and management
 */
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface PhotoWithMetadata extends Omit<CapturedPhoto, 'file'> {
    id: string;  // UUID v4 for unique identification
    file?: File; // Optional for remote photos
    url?: string; // For remote photos
    syncStatus: SyncStatus;  // AC1: Sync status tracking
    treeId?: string;  // Associated tree (null until saved)
    localStorageKey?: string;  // IndexedDB key for offline storage
    uploadedAt?: Date;  // Timestamp when synced to Supabase
    uploadError?: string;  // Error message if sync failed
    storagePath?: string; // Full storage path for deletion
}

export interface PhotoGalleryProps {
    photos: PhotoWithMetadata[];
    onPhotosChange: (photos: PhotoWithMetadata[]) => void;
    readOnly?: boolean;
}

/**
 * Story 1.4: Database photo record type
 * Matches tree_photos table schema from Supabase
 */
export interface TreePhotoRecord {
    id: string;
    tree_id: string;
    instalacao_id: string;
    storage_path: string;
    filename: string;
    file_size: number;
    mime_type: string;
    gps_latitude?: number;
    gps_longitude?: number;
    captured_at?: string;
    uploaded_by: string;
    uploaded_at: string;
    display_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * Story 1.4: Photo record with signed URL for display
 * Used in TreeDetails and Map popup
 */
export interface TreePhotoWithUrl extends TreePhotoRecord {
    signedUrl: string;
    uploaderName?: string;
}
