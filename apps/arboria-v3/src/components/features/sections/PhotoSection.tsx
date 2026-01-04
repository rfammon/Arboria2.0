import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { toast } from 'sonner';

interface PhotoSectionProps {
    onPhotoCaptured: (file: File | null) => void;
    initialPhotoUrl?: string | null;
}

export function PhotoSection({ onPhotoCaptured, initialPhotoUrl }: PhotoSectionProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialPhotoUrl || null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Stops camera when component unmounts or camera closes
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            setIsCameraOpen(true);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            toast.error('Não foi possível acessar a câmera. Verifique as permissões.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);

            // Convert to Blob/File
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `tree_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    const url = URL.createObjectURL(blob);

                    setPreviewUrl(url);
                    onPhotoCaptured(file);
                    stopCamera();
                }
            }, 'image/jpeg', 0.8);
        }
    };

    const clearPhoto = () => {
        setPreviewUrl(null);
        onPhotoCaptured(null);
    };

    return (
        <div className="space-y-4 pt-6 border-t border-border/50">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Camera className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Fotos
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Registro visual da árvore
                    </p>
                </div>
            </div>

            <div className="bg-muted/20 p-5 rounded-xl border border-border/50">
                {isCameraOpen ? (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            onLoadedMetadata={() => {
                                if (videoRef.current) videoRef.current.play();
                            }}
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={stopCamera}
                                className="rounded-full h-12 w-12"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                size="icon"
                                onClick={capturePhoto}
                                className="rounded-full h-16 w-16 border-4 border-white/50"
                            >
                                <div className="h-12 w-12 bg-white rounded-full" />
                            </Button>
                        </div>
                    </div>
                ) : previewUrl ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video group">
                        <img
                            src={previewUrl}
                            alt="Tree Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    clearPhoto();
                                    startCamera();
                                }}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retirar
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={clearPhoto}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Remover
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border/50 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Button
                            type="button"
                            onClick={startCamera}
                            className="mb-2"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Tirar Foto
                        </Button>
                        <p className="text-xs text-muted-foreground text-center px-4">
                            Use a câmera para registrar a árvore
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
