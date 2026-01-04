import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { compressPhoto, extractExifData } from '../lib/photoCompression';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { offlineQueue } from '../lib/offlineQueue';
import { uploadService } from '../services/uploadService';

interface UploadOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export const usePhotoUpload = (treeId: string, installationId: string) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // For future progress bar
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const uploadPhoto = async (file: File, options?: UploadOptions) => {
        if (!user) {
            toast.error('Você precisa estar logado para enviar fotos.');
            return;
        }

        if (!treeId || !installationId) {
            toast.error('Dados da árvore ou instalação inválidos.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(10);

        try {
            // 1. Compress Photo
            toast.loading('Processando imagem...');
            const compressionResult = await compressPhoto(file);
            setUploadProgress(30);

            // 2. Extract EXIF Data
            const exifData = await extractExifData(file);
            console.log('[usePhotoUpload] EXIF Data:', exifData);
            setUploadProgress(40);

            // 3. Generate Storage Path
            // Format: {installationId}/trees/{treeId}/{timestamp}_{random}.jpg
            const timestamp = new Date().getTime();
            const random = Math.random().toString(36).substring(7);
            const filename = `${timestamp}_${random}.jpg`;
            const storagePath = `${installationId}/trees/${treeId}/${filename}`;

            // Check online status
            if (!navigator.onLine) {
                toast.info('Sem conexão. Salvando na fila para envio posterior...');
                await offlineQueue.add('SYNC_PHOTO', {
                    file: compressionResult.compressedFile,
                    treeId,
                    installationId,
                    storagePath,
                    filename,
                    metadata: {
                        file_size: compressionResult.compressedSize,
                        mime_type: 'image/jpeg',
                        gps_latitude: exifData?.latitude || null,
                        gps_longitude: exifData?.longitude || null,
                        captured_at: exifData?.timestamp?.toISOString() || new Date().toISOString(),
                        uploaded_by: user.id,
                    }
                });
                setUploadProgress(100);
                toast.dismiss();
                toast.success('Foto salva offline! Será enviada quando houver conexão.');
                options?.onSuccess?.();
                return;
            }

            // 4. Upload using Shared Service
            toast.loading('Enviando para a nuvem...');

            const uploadResult = await uploadService.uploadTreePhoto(
                compressionResult.compressedFile,
                treeId,
                installationId,
                storagePath,
                filename,
                {
                    file_size: compressionResult.compressedSize,
                    mime_type: 'image/jpeg',
                    gps_latitude: exifData?.latitude || null,
                    gps_longitude: exifData?.longitude || null,
                    captured_at: exifData?.timestamp?.toISOString() || new Date().toISOString(),
                    uploaded_by: user.id,
                }
            );

            if (!uploadResult.success) {
                const error = uploadResult.error;
                // If network error, queue it
                if (error?.message?.includes('network') || error?.message?.includes('Valid failure') || !navigator.onLine) {
                    toast.dismiss();
                    toast.info('Falha no envio. Salvando para tentar mais tarde...');
                    await offlineQueue.add('SYNC_PHOTO', {
                        file: compressionResult.compressedFile,
                        treeId,
                        installationId,
                        storagePath,
                        filename,
                        metadata: {
                            file_size: compressionResult.compressedSize,
                            mime_type: 'image/jpeg',
                            gps_latitude: exifData?.latitude || null,
                            gps_longitude: exifData?.longitude || null,
                            captured_at: exifData?.timestamp?.toISOString() || new Date().toISOString(),
                            uploaded_by: user.id,
                        }
                    });
                    setUploadProgress(100);
                    toast.success('Foto salva offline por falha na rede.');
                    options?.onSuccess?.();
                    return;
                }
                throw error;
            }

            setUploadProgress(100);
            toast.dismiss();
            toast.success('Foto enviada com sucesso!');

            queryClient.invalidateQueries({ queryKey: ['tree-photos', treeId] });
            queryClient.invalidateQueries({ queryKey: ['tree-photo-count', treeId] });

            options?.onSuccess?.();

        } catch (error: any) {
            console.error('[usePhotoUpload] Error:', error);
            toast.dismiss();
            toast.error(`Erro ao enviar foto: ${error.message || 'Erro desconhecido'}`);
            options?.onError?.(error);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return {
        uploadPhoto,
        isUploading,
        uploadProgress
    };
};
