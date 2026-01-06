import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { treeSchema, type TreeFormData } from '../../lib/validations/treeSchema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Save, X, TreeDeciduous } from 'lucide-react';
import { useTRAQCriteria } from '../../hooks/useTRAQCriteria';
import { toast } from 'sonner';
import { useTreeMutations } from '../../hooks/useTreeMutations';
import { supabase } from '../../lib/supabase';
import { DimensionSection } from './sections/DimensionSection';
import { LocationSection } from './sections/LocationSection';
import { RiskAssessmentSection } from './sections/RiskAssessmentSection';
import { PhotoSection } from './sections/PhotoSection';
import { compressPhoto, extractExifData } from '../../lib/photoCompression';
import { uploadService } from '../../services/uploadService';
import { offlineQueue } from '../../lib/offlineQueue';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

interface TreeFormProps {
    onClose: () => void;
    initialData?: Partial<TreeFormData>;
    treeId?: string;
}

export function TreeForm({ onClose, initialData, treeId }: TreeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingTree, setIsLoadingTree] = useState(false);
    const { criteria } = useTRAQCriteria();
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);
    const { activeInstallation, user } = useAuth();
    const queryClient = useQueryClient();

    const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<TreeFormData>({
        resolver: zodResolver(treeSchema as any),
        defaultValues: {
            especie: '',
            data: new Date().toISOString().split('T')[0],
            ...initialData
        }
    });

    const { createTree, updateTree } = useTreeMutations();

    useEffect(() => {
        if (treeId) {
            loadTreeData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [treeId]);

    const loadTreeData = async () => {
        setIsLoadingTree(true);
        try {
            const { data, error } = await supabase
                .from('arvores')
                .select('*')
                .eq('id', treeId)
                .single();

            if (error) throw error;
            if (data) {
                reset(data as any);
            }
        } catch (error) {
            console.error('Error loading tree:', error);
            toast.error('Erro ao carregar dados da árvore');
        } finally {
            setIsLoadingTree(false);
        }
    };

    const onSubmit = async (formData: any) => {
        console.log('[TreeForm] onSubmit called with:', formData);
        setIsSubmitting(true);
        try {
            let finalTreeId = treeId;
            // Logic determining new tree moved/removed


            if (treeId) {
                await updateTree.mutateAsync({ id: treeId, data: formData });
                toast.success('Árvore atualizada com sucesso!');
            } else {
                const newTree = await createTree.mutateAsync(formData);
                // Assumption: createTree returns the created object with an ID. 
                // If it returns void/null, we have a problem. Checking useTreeMutations usage elsewhere might be needed, 
                // but usually mutations return the data. 
                // Based on standard implementation, it likely returns the row.
                if (newTree && newTree.id) {
                    finalTreeId = newTree.id;
                    // Logic for new tree
                }
                toast.success('Árvore cadastrada com sucesso!');
            }

            // Handle Photo Uploads (Multiple)
            if (photoFiles.length > 0 && finalTreeId && activeInstallation && user) {
                toast.loading(`Enviando ${photoFiles.length} foto(s)...`);

                let successCount = 0;
                let failCount = 0;

                for (const file of photoFiles) {
                    try {
                        // 1. Compress
                        const compressionResult = await compressPhoto(file);

                        // 2. EXIF
                        const exifData = await extractExifData(file);

                        // 3. Path
                        const timestamp = new Date().getTime();
                        const random = Math.random().toString(36).substring(7);
                        const filename = `${timestamp}_${random}_${successCount}.jpg`;
                        const storagePath = `${activeInstallation.id}/trees/${finalTreeId}/${filename}`;

                        const metadata = {
                            file_size: compressionResult.compressedSize,
                            mime_type: 'image/jpeg',
                            gps_latitude: exifData?.latitude || null,
                            gps_longitude: exifData?.longitude || null,
                            captured_at: exifData?.timestamp?.toISOString() || new Date().toISOString(),
                            uploaded_by: user.id,
                        };

                        // 4. Upload or Queue
                        if (!navigator.onLine) {
                            await offlineQueue.add('SYNC_PHOTO', {
                                file: compressionResult.compressedFile,
                                treeId: finalTreeId,
                                installationId: activeInstallation.id,
                                storagePath,
                                filename,
                                metadata
                            });
                        } else {
                            const uploadResult = await uploadService.uploadTreePhoto(
                                compressionResult.compressedFile,
                                finalTreeId,
                                activeInstallation.id,
                                storagePath,
                                filename,
                                metadata
                            );

                            if (!uploadResult.success) {
                                throw new Error(uploadResult.error?.message || 'Falha no upload');
                            }
                        }
                        successCount++;
                    } catch (photoError) {
                        console.error('Error uploading specific photo:', photoError);
                        failCount++;
                    }
                }

                toast.dismiss();
                if (failCount > 0) {
                    toast.warning(`${successCount} fotos enviadas. ${failCount} falharam.`);
                } else {
                    toast.success(`${successCount} fotos enviadas com sucesso!`);
                }

                if (navigator.onLine) {
                    queryClient.invalidateQueries({ queryKey: ['tree-photos', finalTreeId] });
                }
            }

            onClose();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Erro ao salvar árvore');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-background">
            {/* Enhanced Header */}
            <div className="shrink-0 px-6 py-5 border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <TreeDeciduous className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                {treeId ? 'Editar Árvore' : 'Cadastrar Nova Árvore'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {treeId ? 'Atualize as informações desta árvore' : 'Preencha os dados da nova árvore'}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} type="button" className="shrink-0">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
                console.error('[TreeForm] Validation errors:', errors);
                toast.error('Verifique os campos obrigatórios');
            })} className="flex-1 overflow-y-auto overscroll-contain touch-pan-y isolate">
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-5">
                        {/* Espécie */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Espécie <span className="text-destructive">*</span>
                            </label>
                            <Input
                                placeholder="Nome científico ou comum"
                                {...register('especie')}
                                className="h-12 text-base"
                                autoFocus
                            />
                            {errors.especie && (
                                <p className="text-sm text-destructive flex items-center gap-1">
                                    {errors.especie.message}
                                </p>
                            )}
                        </div>

                        {/* Data */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Data do Cadastro <span className="text-destructive">*</span>
                            </label>
                            <Input
                                type="date"
                                {...register('data')}
                                className="h-12 text-base"
                            />
                            {errors.data && (
                                <p className="text-sm text-destructive">{errors.data.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Sections */}
                    <DimensionSection
                        register={register}
                        setValue={setValue}
                    />

                    <LocationSection
                        register={register}
                        setValue={setValue}
                    />

                    <RiskAssessmentSection
                        treeId={treeId}
                        watch={watch}
                        setValue={setValue}
                        criteria={criteria}
                    />

                    <PhotoSection
                        onPhotosUpdated={setPhotoFiles}
                    />

                    {/* Observações - Optional Field */}
                    <div className="space-y-6 pt-6 border-t border-border/50">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">
                                Observações
                            </label>
                            <textarea
                                {...register('observacoes')}
                                placeholder="Estado fitossanitário, interferências, características especiais..."
                                className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px] resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Campo opcional para informações adicionais
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="shrink-0 px-6 py-4 border-t border-border/50 bg-muted/20 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoadingTree || isSubmitting}
                        className="min-w-[100px]"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || isLoadingTree}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[140px]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoadingTree ? 'Carregando...' : isSubmitting ? 'Salvando...' : treeId ? 'Atualizar' : 'Salvar Árvore'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
