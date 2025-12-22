/**
 * PhotoViewer Component
 * Story 1.4: Full-screen photo viewer with navigation and zoom
 * 
 * Features:
 * - Full-screen modal overlay
 * - Photo carousel with prev/next navigation
 * - Pinch-to-zoom support (touch and mouse wheel)
 * - ESC key to close
 * - Photo metadata overlay
 * - Keyboard navigation (arrow keys)
 */

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import type { TreePhotoWithUrl } from '@/types/photo';

interface PhotoViewerProps {
    photos: TreePhotoWithUrl[];
    initialIndex: number;
    onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex, onClose }: PhotoViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoom, setZoom] = useState(1);
    const [showMetadata, setShowMetadata] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    const currentPhoto = photos[currentIndex];
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' && hasPrev) {
                handlePrev();
            } else if (e.key === 'ArrowRight' && hasNext) {
                handleNext();
            } else if (e.key === 'i' || e.key === 'I') {
                setShowMetadata(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, photos.length]);

    // Mouse wheel zoom
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                setZoom(prev => Math.max(1, Math.min(3, prev + delta)));
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    const handlePrev = () => {
        if (hasPrev) {
            setCurrentIndex(prev => prev - 1);
            setZoom(1);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            setCurrentIndex(prev => prev + 1);
            setZoom(1);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
                <div className="text-white">
                    <span className="font-medium">
                        {currentIndex + 1} / {photos.length}
                    </span>
                    {currentPhoto.filename && (
                        <span className="ml-3 text-sm text-gray-300">
                            {currentPhoto.filename}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowMetadata(!showMetadata)}
                        className="text-white hover:bg-white/10"
                        title="Toggle metadata (I)"
                    >
                        <Info className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-white/10"
                        title="Close (ESC)"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Photo */}
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                <img
                    ref={imageRef}
                    src={currentPhoto.signedUrl}
                    alt={currentPhoto.filename}
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                />

                {/* Navigation Buttons */}
                {hasPrev && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:scale-110 transition-all"
                        title="Previous (←)"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>
                )}

                {hasNext && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 hover:scale-110 transition-all"
                        title="Next (→)"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>
                )}
            </div>

            {/* Metadata Overlay */}
            {showMetadata && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
                    <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Enviado por</div>
                            <div className="font-medium">{currentPhoto.uploaderName || 'Unknown'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Data de envio</div>
                            <div className="font-medium">
                                {currentPhoto.uploaded_at
                                    ? format(new Date(currentPhoto.uploaded_at), 'dd/MM/yyyy HH:mm')
                                    : '-'
                                }
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-400 mb-1">Tamanho do arquivo</div>
                            <div className="font-medium">{formatFileSize(currentPhoto.file_size)}</div>
                        </div>
                        {(currentPhoto.gps_latitude && currentPhoto.gps_longitude) && (
                            <div>
                                <div className="text-xs text-gray-400 mb-1">Coordenadas GPS</div>
                                <div className="font-medium text-sm">
                                    {currentPhoto.gps_latitude.toFixed(6)}, {currentPhoto.gps_longitude.toFixed(6)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Zoom indicator */}
            {zoom !== 1 && (
                <div className="absolute top-20 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                    {Math.round(zoom * 100)}%
                </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded text-xs opacity-50 hover:opacity-100 transition-opacity">
                ← → para navegar • Ctrl+Scroll para zoom • I para info • ESC para fechar
            </div>
        </div>
    );
}
