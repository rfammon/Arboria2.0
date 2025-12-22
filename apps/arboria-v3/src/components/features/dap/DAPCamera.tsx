import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface DAPCameraProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (imageData: string, width: number, height: number) => void;
    children?: React.ReactNode;
}

export function DAPCamera({ isOpen, onClose, onCapture, children }: DAPCameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            stopStream();
            return;
        }

        startCamera();

        return () => {
            stopStream();
        };
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment', // Use rear camera
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);
            setPermissionDenied(false);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('[DAPCamera] Error accessing camera:', error);
            setPermissionDenied(true);
            toast.error('Erro ao acessar a câmera. Verifique as permissões.');
        }
    };

    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg');
                onCapture(imageData, canvas.width, canvas.height);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col">
            <div className="flex justify-between items-center p-4 bg-black/50 absolute top-0 w-full z-10 text-white">
                <h3 className="text-lg font-semibold">Estimador de DAP</h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                    <X className="w-6 h-6" />
                </Button>
            </div>

            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {permissionDenied ? (
                    <div className="text-white text-center p-6">
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Acesso à câmera negado ou indisponível.</p>
                        <Button variant="outline" onClick={startCamera} className="mt-4">
                            Tentar Novamente
                        </Button>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                )}
                {/* Overlay Component will be injected here via children */}
                {children}
            </div>

            {/* Controls only shown if children not provided (simple capture mode) */}
            {!children && !permissionDenied && (
                <div className="p-6 bg-black/50 flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleCapture}
                        className="rounded-full w-16 h-16 p-0 border-4 border-white bg-transparent hover:bg-white/20"
                    >
                        <div className="w-12 h-12 rounded-full bg-white" />
                    </Button>
                </div>
            )}
        </div>
    );
}
