import { motion } from 'framer-motion';
import { Check, X, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { useTreePhotos } from '../../hooks/useTreePhotos';
import { Skeleton } from '../ui/skeleton';

interface PhotoVerifyOverlayProps {
    treeId: string;
    treeName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function PhotoVerifyOverlay({ treeId, treeName, onConfirm, onCancel }: PhotoVerifyOverlayProps) {
    const { data: photos, isLoading } = useTreePhotos(treeId, { limit: 1 });
    const photoUrl = photos?.[0]?.signedUrl;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background flex flex-col"
        >
            <div className="relative flex-1 bg-muted overflow-hidden">
                {isLoading ? (
                    <Skeleton className="w-full h-full" />
                ) : photoUrl ? (
                    <img
                        src={photoUrl}
                        alt={treeName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <MapPin className="w-16 h-16 mb-4 opacity-20" />
                        <p>Sem foto de referência disponível para esta árvore.</p>
                    </div>
                )}

                {/* Header Info */}
                <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent text-white">
                    <h2 className="text-xl font-bold">{treeName}</h2>
                    <p className="text-sm opacity-80">Verifique se esta é a árvore correta</p>
                </div>
            </div>

            {/* Thumb Zone Actions */}
            <div className="p-6 pb-12 grid grid-cols-2 gap-4 bg-background border-t border-border">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-20 text-lg gap-2"
                    onClick={onCancel}
                >
                    <X className="w-6 h-6" />
                    Pular
                </Button>
                <Button
                    size="lg"
                    className="h-20 text-lg gap-2 bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
                    onClick={onConfirm}
                >
                    <Check className="w-6 h-6" />
                    Confirmar
                </Button>
            </div>
        </motion.div>
    );
}
