# Detailed Implementation Plan for Code Optimization and Error Handling Improvements

## Overview
This document outlines a comprehensive plan to address the issues identified in the code audit of the Arboria v3 application. The plan focuses on improving error handling, enhancing TypeScript type safety, organizing code structure, and implementing best practices for asynchronous operations and mutations.

## 1. Refactoring Error Handling in useTreeMutations.ts

### Current Issue
The `useTreeMutations.ts` hook currently uses `window.alert()` for displaying error messages, which provides a poor user experience and blocks the UI thread.

### Solution: Replace window.alert() with Toast Notifications

#### Step 1: Create a custom error handler component
First, we'll create a more sophisticated error handling mechanism:

```typescript
// src/components/ui/ErrorMessage.tsx
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';

interface ErrorMessageProps {
  title: string;
  message: string;
 details?: {
    code?: string;
    details?: string;
    hint?: string;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ title, message, details, onRetry, onDismiss }: ErrorMessageProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{message}</p>
        {details && (
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer">Detalhes do erro</summary>
            <div className="mt-2 space-y-1">
              {details.code && <p><strong>Código:</strong> {details.code}</p>}
              {details.details && <p><strong>Detalhes:</strong> {details.details}</p>}
              {details.hint && <p><strong>Dica:</strong> {details.hint}</p>}
            </div>
          </details>
        )}
        <div className="flex gap-2 mt-3">
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
          {onDismiss && (
            <Button type="button" variant="outline" size="sm" onClick={onDismiss}>
              Fechar
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
```

#### Step 2: Update useTreeMutations.ts
Now, we'll update the hook to use toast notifications with more detailed error information:

```typescript
// src/hooks/useTreeMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useActionQueue } from '../store/actionQueue';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Tree } from '../types/tree'; // Import the Tree type
import { TreeFormData } from '../lib/validations/treeSchema'; // Import the form data type

// Helper to check connectivity
const isOnline = () => navigator.onLine;

export const useTreeMutations = () => {
    const queryClient = useQueryClient();
    const { addAction } = useActionQueue();

    const createTree = useMutation({
        mutationFn: async (treeData: TreeFormData) => { // Use proper type here
            // Check offline status
            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing CREATE_TREE');
                const tempId = uuidv4();
                addAction({
                    type: 'CREATE_TREE',
                    payload: { ...treeData, id: tempId }, // Ensure ID for queue
                });
                return { id: tempId, status: 'queued' };
            }

            // Online execution
            const { data, error } = await supabase
                .from('arvores')
                .insert(treeData)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            if (data?.status === 'queued') {
                toast.info('Sem internet. Árvore salva na fila offline.');
            } else {
                toast.success('Árvore criada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error: any) => {
            console.error('[useTreeMutations] Create error:', error);
            const message = error?.message || error?.details || 'Erro desconhecido';
            
            // Enhanced error notification with more details
            toast.error('Erro ao criar árvore', {
                description: message,
                action: {
                    label: 'Detalhes',
                    onClick: () => {
                        // Show detailed error in a modal or expandable section
                        console.error('Full error details:', error);
                    }
                }
            });
        }
    });

    const updateTree = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: TreeFormData }) => { // Use proper type here
            // Sanitize payload: only keep fields defined in the schema and allow updates
            const { id: _, created_at, updated_at, ...updateLoad } = data;

            // Further filter to strictly what matches the arvores table expected update fields
            const allowedFields = [
                'especie', 'data', 'dap', 'altura', 'pontuacao', 'risco', 'observacoes',
                'latitude', 'longitude', 'easting', 'northing', 'utmzonenum', 'utmzoneletter',
                'risco_falha', 'fator_impacto', 'categoria_alvo', 'risco_residual', 'fatores_risco'
            ];

            const sanitizedData = Object.keys(updateLoad)
                .filter(key => allowedFields.includes(key))
                .reduce((obj: Partial<TreeFormData>, key) => {
                    obj[key as keyof TreeFormData] = updateLoad[key as keyof TreeFormData];
                    return obj;
                }, {} as Partial<TreeFormData>);

            console.log('[useTreeMutations] Payload to update:', sanitizedData);

            if (Object.keys(sanitizedData).length === 0) {
                console.warn('[useTreeMutations] No valid fields to update');
                return { id }; // Nothing to update
            }

            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing UPDATE_TREE');
                addAction({
                    type: 'UPDATE_TREE',
                    payload: { id, data: sanitizedData },
                });
                return { id, status: 'queued' };
            }

            const { data: updated, error } = await supabase
                .from('arvores')
                .update(sanitizedData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[useTreeMutations] Supabase Update Error:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
            return updated;
        },
        onSuccess: (data, variables) => {
            const id = data?.id || variables.id;
            if (data?.status === 'queued') {
                toast.info('Sem internet. Edição salva na fila offline.');
            } else {
                toast.success('Árvore atualizada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['tree', id] });
            }
        },
        onError: (error: any) => {
            console.error('[useTreeMutations] Update failed:', error);
            const message = error?.message || 'Erro desconhecido ao atualizar';
            const details = error?.details ? ` (${error.details})` : '';

            // Replace window.alert with toast notification
            toast.error('Erro ao atualizar árvore', {
                description: `${message}${details}`,
                action: {
                    label: 'Detalhes',
                    onClick: () => {
                        // Create a more detailed toast with error information
                        toast.info('Detalhes do erro', {
                            description: (
                                <div className="space-y-1">
                                    <p><strong>Mensagem:</strong> {error?.message || 'N/A'}</p>
                                    <p><strong>Código:</strong> {error?.code || 'N/A'}</p>
                                    <p><strong>Detalhes:</strong> {error?.details || 'N/A'}</p>
                                    <p><strong>Dica:</strong> {error?.hint || 'N/A'}</p>
                                </div>
                            )
                        });
                    }
                }
            });
        }
    });

    const deleteTree = useMutation({
        mutationFn: async (id: string) => {
            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing DELETE_TREE');
                addAction({
                    type: 'DELETE_TREE',
                    payload: { id }
                });
                return { id, status: 'queued' };
            }

            const { error } = await supabase
                .from('arvores')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id };
        },
        onSuccess: (data) => {
            if (data?.status === 'queued') {
                toast.info('Sem internet. Exclusão salva na fila offline.');
            } else {
                toast.success('Árvore removida!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error) => {
            console.error('[useTreeMutations] Delete error:', error);
            toast.error(`Erro ao remover: ${(error as Error).message}`);
        }
    });

    return {
        createTree,
        updateTree,
        deleteTree
    };
};
```

## 2. Improving TypeScript Typing

### Current Issue
Multiple files use `as any` type assertions which bypass TypeScript's type checking, potentially hiding runtime errors.

### Solution: Implement Proper Type Definitions

#### Step 1: Create more specific types for API responses
```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: string;
  } | null;
}

export interface MutationError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
}
```

#### Step 2: Update the hook with proper typing
```typescript
// src/hooks/useTreeMutations.ts (updated version)
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useActionQueue } from '../store/actionQueue';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Tree } from '../types/tree';
import { TreeFormData } from '../lib/validations/treeSchema';
import { MutationError } from '../types/api';

// Helper to check connectivity
const isOnline = () => navigator.onLine;

export const useTreeMutations = () => {
    const queryClient = useQueryClient();
    const { addAction } = useActionQueue();

    const createTree = useMutation({
        mutationFn: async (treeData: TreeFormData) => {
            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing CREATE_TREE');
                const tempId = uuidv4();
                addAction({
                    type: 'CREATE_TREE',
                    payload: { ...treeData, id: tempId },
                });
                return { id: tempId, status: 'queued' } as const;
            }

            const { data, error } = await supabase
                .from('arvores')
                .insert(treeData)
                .select()
                .single();

            if (error) throw error;
            return data as Tree; // Properly typed
        },
        onSuccess: (data) => {
            if (data?.status === 'queued') {
                toast.info('Sem internet. Árvore salva na fila offline.');
            } else {
                toast.success('Árvore criada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error: any) => {
            console.error('[useTreeMutations] Create error:', error);
            const mutationError: MutationError = {
                code: error?.code,
                message: error?.message || error?.details || 'Erro desconhecido',
                details: error?.details,
                hint: error?.hint
            };
            
            toast.error('Erro ao criar árvore', {
                description: mutationError.message,
                action: {
                    label: 'Detalhes',
                    onClick: () => {
                        toast.info('Detalhes do erro', {
                            description: (
                                <div className="space-y-1">
                                    <p><strong>Mensagem:</strong> {mutationError.message}</p>
                                    <p><strong>Código:</strong> {mutationError.code || 'N/A'}</p>
                                    <p><strong>Detalhes:</strong> {mutationError.details || 'N/A'}</p>
                                    <p><strong>Dica:</strong> {mutationError.hint || 'N/A'}</p>
                                </div>
                            )
                        });
                    }
                }
            });
        }
    });

    const updateTree = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: TreeFormData }) => {
            const { id: _, created_at, updated_at, ...updateLoad } = data;

            const allowedFields = [
                'especie', 'data', 'dap', 'altura', 'pontuacao', 'risco', 'observacoes',
                'latitude', 'longitude', 'easting', 'northing', 'utmzonenum', 'utmzoneletter',
                'risco_falha', 'fator_impacto', 'categoria_alvo', 'risco_residual', 'fatores_risco'
            ];

            const sanitizedData = Object.keys(updateLoad)
                .filter(key => allowedFields.includes(key))
                .reduce((obj: Partial<TreeFormData>, key) => {
                    obj[key as keyof TreeFormData] = updateLoad[key as keyof TreeFormData];
                    return obj;
                }, {} as Partial<TreeFormData>);

            console.log('[useTreeMutations] Payload to update:', sanitizedData);

            if (Object.keys(sanitizedData).length === 0) {
                console.warn('[useTreeMutations] No valid fields to update');
                return { id } as const;
            }

            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing UPDATE_TREE');
                addAction({
                    type: 'UPDATE_TREE',
                    payload: { id, data: sanitizedData },
                });
                return { id, status: 'queued' } as const;
            }

            const { data: updated, error } = await supabase
                .from('arvores')
                .update(sanitizedData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[useTreeMutations] Supabase Update Error:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
            return updated as Tree; // Properly typed
        },
        onSuccess: (data, variables) => {
            const id = data?.id || variables.id;
            if (data?.status === 'queued') {
                toast.info('Sem internet. Edição salva na fila offline.');
            } else {
                toast.success('Árvore atualizada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['tree', id] });
            }
        },
        onError: (error: any) => {
            console.error('[useTreeMutations] Update failed:', error);
            const mutationError: MutationError = {
                code: error?.code,
                message: error?.message || 'Erro desconhecido ao atualizar',
                details: error?.details,
                hint: error?.hint
            };

            toast.error('Erro ao atualizar árvore', {
                description: mutationError.message,
                action: {
                    label: 'Detalhes',
                    onClick: () => {
                        toast.info('Detalhes do erro', {
                            description: (
                                <div className="space-y-1">
                                    <p><strong>Mensagem:</strong> {mutationError.message}</p>
                                    <p><strong>Código:</strong> {mutationError.code || 'N/A'}</p>
                                    <p><strong>Detalhes:</strong> {mutationError.details || 'N/A'}</p>
                                    <p><strong>Dica:</strong> {mutationError.hint || 'N/A'}</p>
                                </div>
                            )
                        });
                    }
                }
            });
        }
    });

    const deleteTree = useMutation({
        mutationFn: async (id: string) => {
            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing DELETE_TREE');
                addAction({
                    type: 'DELETE_TREE',
                    payload: { id }
                });
                return { id, status: 'queued' } as const;
            }

            const { error } = await supabase
                .from('arvores')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id } as const;
        },
        onSuccess: (data) => {
            if (data?.status === 'queued') {
                toast.info('Sem internet. Exclusão salva na fila offline.');
            } else {
                toast.success('Árvore removida!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error: any) => {
            console.error('[useTreeMutations] Delete error:', error);
            toast.error(`Erro ao remover: ${(error as Error).message}`);
        }
    });

    return {
        createTree,
        updateTree,
        deleteTree
    };
};
```

## 3. Code Organization and Structure

### Current Issue
The codebase has duplicated logic for coordinate conversions and photo processing across multiple components.

### Solution: Extract Shared Logic into Utilities

#### Step 1: Create a shared coordinate utility
```typescript
// src/lib/coordinates.ts
import proj4 from 'proj4';
import { Tree } from '../types/tree';

export interface UTMCoordinates {
    easting: number;
    northing: number;
    utmZoneNum: number;
    utmZoneLetter: string;
}

export interface LatLonCoordinates {
    latitude: number;
    longitude: number;
}

const DEFAULT_UTM_ZONE = 23; // São Paulo, Brasil
const DEFAULT_UTM_LETTER = 'K'; // Hemisfério Sul

export function utmToLatLon(
    easting: number,
    northing: number,
    zoneNum: number = DEFAULT_UTM_ZONE,
    zoneLetter: string = DEFAULT_UTM_LETTER
): LatLonCoordinates | null {
    try {
        const zone = parseInt(zoneNum.toString(), 10);
        const letter = zoneLetter.toUpperCase();

        // Determine hemisphere based on zone letter
        // Letters N-X are northern hemisphere, C-M are southern hemisphere
        const hemisphere = letter >= 'N' ? '+north' : '+south';

        // Define projections
        const utmProj = `+proj=utm +zone=${zone} ${hemisphere} +datum=WGS84 +units=m +no_defs`;
        const wgs84Proj = 'EPSG:4326';

        // Convert
        const [longitude, latitude] = proj4(utmProj, wgs84Proj, [easting, northing]);

        return {
            latitude: parseFloat(latitude.toFixed(7)),
            longitude: parseFloat(longitude.toFixed(7)),
        };
    } catch (error) {
        console.error('[CoordinateUtils] Error converting UTM to Lat/Lon:', error);
        return null;
    }
}

export function latLonToUTM(
    latitude: number,
    longitude: number
): UTMCoordinates | null {
    try {
        // Calculate UTM zone based on longitude
        const zoneNum = Math.floor((longitude + 180) / 6) + 1;

        // Determine hemisphere
        const zoneLetter = latitude >= 0 ? 'N' : 'K';
        const hemisphere = latitude >= 0 ? '+north' : '+south';

        // Define projections
        const utmProj = `+proj=utm +zone=${zoneNum} ${hemisphere} +datum=WGS84 +units=m +no_defs`;
        const wgs84Proj = 'EPSG:4326';

        // Convert
        const [easting, northing] = proj4(wgs84Proj, utmProj, [longitude, latitude]);

        return {
            easting: parseFloat(easting.toFixed(2)),
            northing: parseFloat(northing.toFixed(2)),
            utmZoneNum: zoneNum,
            utmZoneLetter: zoneLetter,
        };
    } catch (error) {
        console.error('[CoordinateUtils] Error converting Lat/Lon to UTM:', error);
        return null;
    }
}

export function hasValidCoordinates(easting?: number | null, northing?: number | null): boolean {
    return !!(easting && northing && easting !== 0 && northing !== 0);
}

export function diagnoseCoordinates(tree: Tree) {
    const issues: string[] = [];
    
    if (!tree.latitude && !tree.longitude && !tree.easting && !tree.northing) {
        issues.push('Árvore não possui coordenadas');
    }
    
    if (tree.latitude && tree.longitude) {
        if (tree.latitude === 0 && tree.longitude === 0) {
            issues.push('Coordenadas (0, 0) inválidas');
        }
        
        if (tree.latitude < -90 || tree.latitude > 90) {
            issues.push('Latitude fora do intervalo válido');
        }
        
        if (tree.longitude < -180 || tree.longitude > 180) {
            issues.push('Longitude fora do intervalo válido');
        }
    }
    
    if (tree.easting && tree.northing) {
        if (tree.easting === 0 && tree.northing === 0) {
            issues.push('Coordenadas UTM (0, 0) inválidas');
        }
    }
    
    return issues;
}
```

#### Step 2: Create a shared photo processing utility
```typescript
// src/lib/photos.ts
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
            compressionRatio: ((1 - compressedFile.size / file.size) * 10),
            exifData,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Photo compression failed: ${message}`);
    }
}

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
                                    console.log('[EXIF] ✓ Extracted GPS:', { latitude, longitude });
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
                                    } else {
                                        console.log('[EXIF] ✓ Extracted timestamp:', timestamp);
                                    }
                                }

                                // Extract camera model
                                const make = EXIF.getTag(this, 'Make');
                                const model = EXIF.getTag(this, 'Model');
                                const cameraModel = [make, model].filter(Boolean).join(' ').trim() || null;

                                if (cameraModel) {
                                    console.log('[EXIF] ✓ Extracted camera model:', cameraModel);
                                }

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
```

## 4. Async Operations and Mutation Best Practices

### Current Issue
Inconsistent error handling patterns across different hooks and mutation functions.

### Solution: Implement Standardized Error Handling

#### Step 1: Create a mutation error handler utility
```typescript
// src/lib/mutationErrorHandler.ts
import { toast } from 'sonner';
import { MutationError } from '../types/api';

export interface ErrorHandlingOptions {
  actionName: string;
  showDetails?: boolean;
  onRetry?: () => void;
}

export function handleMutationError(
  error: any,
  options: ErrorHandlingOptions
): void {
  console.error(`[${options.actionName}] Error:`, error);
  
  const mutationError: MutationError = {
    code: error?.code,
    message: error?.message || error?.details || `Erro desconhecido ao ${options.actionName.toLowerCase()}`,
    details: error?.details,
    hint: error?.hint
 };

  toast.error(`Erro ao ${options.actionName.toLowerCase()}`, {
    description: mutationError.message,
    action: {
      label: 'Detalhes',
      onClick: () => {
        toast.info('Detalhes do erro', {
          description: (
            <div className="space-y-1">
              <p><strong>Mensagem:</strong> {mutationError.message}</p>
              <p><strong>Código:</strong> {mutationError.code || 'N/A'}</p>
              <p><strong>Detalhes:</strong> {mutationError.details || 'N/A'}</p>
              <p><strong>Dica:</strong> {mutationError.hint || 'N/A'}</p>
              {options.onRetry && (
                <div className="mt-2">
                  <button
                    onClick={options.onRetry}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          )
        });
      }
    }
  });
}
```

#### Step 2: Apply standardized error handling to mutations
```typescript
// Updated useTreeMutations.ts with standardized error handling
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useActionQueue } from '../store/actionQueue';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Tree } from '../types/tree';
import { TreeFormData } from '../lib/validations/treeSchema';
import { handleMutationError } from '../lib/mutationErrorHandler';

// Helper to check connectivity
const isOnline = () => navigator.onLine;

export const useTreeMutations = () => {
    const queryClient = useQueryClient();
    const { addAction } = useActionQueue();

    const createTree = useMutation({
        mutationFn: async (treeData: TreeFormData) => {
            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing CREATE_TREE');
                const tempId = uuidv4();
                addAction({
                    type: 'CREATE_TREE',
                    payload: { ...treeData, id: tempId },
                });
                return { id: tempId, status: 'queued' } as const;
            }

            const { data, error } = await supabase
                .from('arvores')
                .insert(treeData)
                .select()
                .single();

            if (error) throw error;
            return data as Tree;
        },
        onSuccess: (data) => {
            if (data?.status === 'queued') {
                toast.info('Sem internet. Árvore salva na fila offline.');
            } else {
                toast.success('Árvore criada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error: any) => {
            handleMutationError(error, { 
              actionName: 'criar árvore',
              onRetry: () => createTree.mutate()
            });
        }
    });

    const updateTree = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: TreeFormData }) => {
            const { id: _, created_at, updated_at, ...updateLoad } = data;

            const allowedFields = [
                'especie', 'data', 'dap', 'altura', 'pontuacao', 'risco', 'observacoes',
                'latitude', 'longitude', 'easting', 'northing', 'utmzonenum', 'utmzoneletter',
                'risco_falha', 'fator_impacto', 'categoria_alvo', 'risco_residual', 'fatores_risco'
            ];

            const sanitizedData = Object.keys(updateLoad)
                .filter(key => allowedFields.includes(key))
                .reduce((obj: Partial<TreeFormData>, key) => {
                    obj[key as keyof TreeFormData] = updateLoad[key as keyof TreeFormData];
                    return obj;
                }, {} as Partial<TreeFormData>);

            console.log('[useTreeMutations] Payload to update:', sanitizedData);

            if (Object.keys(sanitizedData).length === 0) {
                console.warn('[useTreeMutations] No valid fields to update');
                return { id } as const;
            }

            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing UPDATE_TREE');
                addAction({
                    type: 'UPDATE_TREE',
                    payload: { id, data: sanitizedData },
                });
                return { id, status: 'queued' } as const;
            }

            const { data: updated, error } = await supabase
                .from('arvores')
                .update(sanitizedData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('[useTreeMutations] Supabase Update Error:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
            return updated as Tree;
        },
        onSuccess: (data, variables) => {
            const id = data?.id || variables.id;
            if (data?.status === 'queued') {
                toast.info('Sem internet. Edição salva na fila offline.');
            } else {
                toast.success('Árvore atualizada com sucesso!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['tree', id] });
            }
        },
        onError: (error: any) => {
            handleMutationError(error, { 
              actionName: 'atualizar árvore',
              onRetry: () => updateTree.mutate(variables)
            });
        }
    });

    const deleteTree = useMutation({
        mutationFn: async (id: string) => {
            if (!isOnline()) {
                console.log('[useTreeMutations] Offline: Queueing DELETE_TREE');
                addAction({
                    type: 'DELETE_TREE',
                    payload: { id }
                });
                return { id, status: 'queued' } as const;
            }

            const { error } = await supabase
                .from('arvores')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { id } as const;
        },
        onSuccess: (data) => {
            if (data?.status === 'queued') {
                toast.info('Sem internet. Exclusão salva na fila offline.');
            } else {
                toast.success('Árvore removida!');
            }
            queryClient.invalidateQueries({ queryKey: ['trees'] });
        },
        onError: (error: any) => {
            handleMutationError(error, { 
              actionName: 'remover árvore',
              onRetry: () => deleteTree.mutate(id)
            });
        }
    });

    return {
        createTree,
        updateTree,
        deleteTree
    };
};
```

## Implementation Steps

### Phase 1: Error Handling Improvements (Week 1)
1. Replace all `window.alert()` calls with toast notifications
2. Create standardized error handling utilities
3. Update `useTreeMutations.ts` with proper error handling

### Phase 2: Type Safety Enhancements (Week 2)
1. Create comprehensive type definitions
2. Replace `as any` with proper types
3. Update all hooks with proper typing

### Phase 3: Code Organization (Week 3)
1. Extract shared utilities for coordinates and photo processing
2. Create standardized mutation error handling
3. Refactor duplicate code into reusable functions

### Phase 4: Testing and Validation (Week 4)
1. Add unit tests for new utilities
2. Verify all mutations work correctly with new error handling
3. Test offline functionality remains intact

## Expected Benefits

1. **Improved User Experience**: Better error notifications without blocking the UI
2. **Enhanced Type Safety**: Reduced runtime errors through proper TypeScript usage
3. **Better Maintainability**: DRY code with shared utilities
4. **Consistent Error Handling**: Standardized approach across the application
5. **Improved Debugging**: Better error information and context

This plan addresses all the identified issues while maintaining the existing functionality and offline capabilities of the application.