import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PhotoWithMetadata } from '@/types/photo';

interface PhotoGalleryProps {
    photos: PhotoWithMetadata[];
    onPhotosChange: (photos: PhotoWithMetadata[]) => void;
    onPhotoRemove?: (photo: PhotoWithMetadata) => void;
    readOnly?: boolean;
}

/**
 * PhotoGallery Component
 * Story 1.2: Photo Preview and Management
 * 
 * Features:
 * - AC1: Thumbnail grid display
 * - AC1: Delete individual photos
 * - AC1: Drag-and-drop reorder
 * - AC1: Sync status indicators
 */
export function PhotoGallery({ photos, onPhotosChange, onPhotoRemove, readOnly = false }: PhotoGalleryProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = photos.findIndex(p => p.id === active.id);
            const newIndex = photos.findIndex(p => p.id === over.id);

            // AC1: Reorder photos by drag-and-drop
            const newPhotos = arrayMove(photos, oldIndex, newIndex);
            onPhotosChange(newPhotos);
        }
    };

    const handleDelete = (photoId: string) => {
        const photoToRemove = photos.find(p => p.id === photoId);

        // AC1: Remove individual photos
        const newPhotos = photos.filter(p => p.id !== photoId);
        onPhotosChange(newPhotos);

        // Notify parent for side-effects (like backend delete)
        if (onPhotoRemove && photoToRemove) {
            onPhotoRemove(photoToRemove);
        }
    };

    if (photos.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground text-sm">
                No photos attached. Click \"Add Photo\" to capture photos.
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={photos.map(p => p.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {photos.map((photo) => (
                        <PhotoThumbnail
                            key={photo.id}
                            photo={photo}
                            onDelete={handleDelete}
                            readOnly={readOnly}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

/**
 * Individual photo thumbnail with sync status and delete
 * Story 1.2: Photo thumbnail with management controls
 */
function PhotoThumbnail({
    photo,
    onDelete,
    readOnly,
}: {
    photo: PhotoWithMetadata;
    onDelete: (id: string) => void;
    readOnly: boolean;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: photo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [preview, setPreview] = useState<string>(photo.url || photo.preview || '');

    useEffect(() => {
        if (photo.file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(photo.file);
        } else if (photo.url) {
            setPreview(photo.url);
        }

        return () => {
            if (preview && !photo.url && !photo.preview) {
                // Only revoke if it's a blob URL we created inside (actually FileReader result is base64 string usually, but good practice if we employed URL.createObjectURL)
                // In this case, FileReader result is string, so revoke not needed for it, but if we used createObjectURL...
                // Keeping clean for now.
            }
        };
    }, [photo.file, photo.url]);

    // AC1: Sync status indicators
    const getSyncStatusIcon = () => {
        switch (photo.syncStatus) {
            case 'synced':
                return <Check className="h-3 w-3 text-green-600 dark:text-green-400" />;
            case 'pending':
                return <AlertCircle className="h-3 w-3 text-orange-500 dark:text-orange-400" />;
            case 'failed':
                return <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />;
        }
    };

    const getSyncStatusLabel = () => {
        switch (photo.syncStatus) {
            case 'synced':
                return '✓';
            case 'pending':
                return '⚠️';
            case 'failed':
                return '✗';
        }
    };

    const getSyncStatusColor = () => {
        switch (photo.syncStatus) {
            case 'synced':
                return 'text-green-600 dark:text-green-400';
            case 'pending':
                return 'text-orange-500 dark:text-orange-400';
            case 'failed':
                return 'text-red-600 dark:text-red-400';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative aspect-square rounded-lg border bg-white dark:bg-gray-800 overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Photo preview */}
            {preview ? (
                <img
                    src={preview}
                    alt={`Photo ${photo.id.slice(0, 8)}`}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <div className="text-sm text-muted-foreground">Loading...</div>
                </div>
            )}

            {/* Drag handle - AC1: drag-and-drop reorder */}
            {!readOnly && (
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute top-1 left-1 p-1.5 bg-black/60 rounded cursor-grab active:cursor-grabbing hover:bg-black/80 transition-colors"
                    title="Drag to reorder"
                >
                    <GripVertical className="h-4 w-4 text-white" />
                </div>
            )}

            {/* Delete button - AC1: remove individual photos */}
            {!readOnly && (
                <Button
                    onClick={() => onDelete(photo.id)}
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 bg-black/60 hover:bg-red-600 text-white transition-colors"
                    title="Delete photo"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}

            {/* Sync status indicator - AC1 & AC2 */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1.5 flex items-center justify-between">
                <span className="font-medium">
                    {(photo.metadata.compressedSize / (1024 * 1024)).toFixed(1)}MB
                </span>
                <div className={`flex items-center gap-1 font-semibold ${getSyncStatusColor()}`}>
                    {getSyncStatusIcon()}
                    <span>{getSyncStatusLabel()}</span>
                </div>
            </div>
        </div>
    );
}
