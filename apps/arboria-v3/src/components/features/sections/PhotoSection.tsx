import { useState, useEffect } from 'react';
import { Camera as CameraIcon, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

interface PhotoSectionProps {
    onPhotosUpdated: (files: File[]) => void;
    existingPhotos?: string[]; // URLs of already uploaded photos (for edit mode)
}

interface PhotoItem {
    id: string;
    url: string;
    file?: File; // Only for new photos
    isExisting?: boolean;
}

export function PhotoSection({ onPhotosUpdated, existingPhotos = [] }: PhotoSectionProps) {
    const [photos, setPhotos] = useState<PhotoItem[]>([]);

    // Initialize with existing photos if provided
    useEffect(() => {
        if (existingPhotos && existingPhotos.length > 0) {
            setPhotos(existingPhotos.map(url => ({
                id: url, // Use URL as ID for existing
                url: url,
                isExisting: true
            })));
        }
    }, [existingPhotos]);

    const takePhoto = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 80,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera,
                saveToGallery: true
            });

            if (image.webPath) {
                const response = await fetch(image.webPath);
                const blob = await response.blob();
                const file = new File([blob], `tree_photo_${Date.now()}.${image.format}`, { type: blob.type });

                const newPhoto: PhotoItem = {
                    id: Date.now().toString(),
                    url: image.webPath,
                    file: file
                };

                const updatedPhotos = [...photos, newPhoto];
                setPhotos(updatedPhotos);

                // Notify parent only about NEW files to upload
                const newFiles = updatedPhotos
                    .filter(p => !p.isExisting && p.file)
                    .map(p => p.file!);
                onPhotosUpdated(newFiles);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            if (String(error).includes('User cancelled')) return;
            toast.error('Não foi possível abrir a câmera.');
        }
    };

    const removePhoto = (id: string) => {
        const updatedPhotos = photos.filter(p => p.id !== id);
        setPhotos(updatedPhotos);

        // Notify parent
        const newFiles = updatedPhotos
            .filter(p => !p.isExisting && p.file)
            .map(p => p.file!);
        onPhotosUpdated(newFiles);
    };

    return (
        <div className="space-y-4 pt-6 border-t border-border/50">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <CameraIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                            Fotos
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Registro visual ({photos.length} fotos)
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={takePhoto}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
                {photos.map((photo) => (
                    <div key={photo.id} className="relative group bg-muted/20 rounded-xl border border-border/50 overflow-hidden">
                        <div className="aspect-square relative">
                            <img
                                src={photo.url}
                                alt="Tree"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-2 bg-background/80 backdrop-blur-sm border-t border-border/50 flex justify-end">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removePhoto(photo.id)}
                                className="h-8 px-3 text-xs"
                            >
                                <Trash2 className="w-3 h-3 mr-2" />
                                Remover
                            </Button>
                        </div>
                    </div>
                ))}

                {/* Empty State / Add Placeholders if list is empty */}
                {photos.length === 0 && (
                    <div
                        onClick={takePhoto}
                        className="col-span-2 flex flex-col items-center justify-center py-8 border-2 border-dashed border-border/50 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">Nenhuma foto adicionada</p>
                        <p className="text-xs text-muted-foreground">Toque para adicionar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
