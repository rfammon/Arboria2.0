import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { treeSchema, type TreeFormData } from '../../lib/validations/treeSchema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Save, X } from 'lucide-react';
import { useTRAQCriteria } from '../../hooks/useTRAQCriteria';
import { toast } from 'sonner';
import { useTreeMutations } from '../../hooks/useTreeMutations';
import { supabase } from '../../lib/supabase';
import { DimensionSection } from './sections/DimensionSection';
import { LocationSection } from './sections/LocationSection';
import { RiskAssessmentSection } from './sections/RiskAssessmentSection';

interface TreeFormProps {
    onClose: () => void;
    initialData?: Partial<TreeFormData>;
    treeId?: string;
}

export function TreeForm({ onClose, initialData, treeId }: TreeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingTree, setIsLoadingTree] = useState(false);
    const { criteria } = useTRAQCriteria();

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
            if (treeId) {
                await updateTree.mutateAsync({ id: treeId, data: formData });
                toast.success('Árvore atualizada com sucesso!');
            } else {
                await createTree.mutateAsync(formData);
                toast.success('Árvore cadastrada com sucesso!');
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
        <div className="p-6 h-full flex flex-col overflow-hidden font-inter">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className="text-2xl font-bold">{treeId ? 'Editar Árvore' : 'Cadastrar Nova Árvore'}</h2>
                <Button variant="ghost" size="icon" onClick={onClose} type="button">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit, (errors) => {
                console.error('[TreeForm] Validation errors:', errors);
                toast.error('Verifique os campos obrigatórios');
            })} className="space-y-6 overflow-y-auto flex-1 pr-2">
                <div className="space-y-4">
                    {/* Espécie */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Espécie *</label>
                        <Input
                            placeholder="Nome científico ou comum"
                            {...register('especie')}
                        />
                        {errors.especie && (
                            <p className="text-sm text-destructive">{errors.especie.message}</p>
                        )}
                    </div>

                    {/* Data */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Data *</label>
                        <Input
                            type="date"
                            {...register('data')}
                        />
                        {errors.data && (
                            <p className="text-sm text-destructive">{errors.data.message}</p>
                        )}
                    </div>

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
                </div>

                <div className="flex justify-end pt-4 border-t gap-2 sticky bottom-0 bg-background pb-2 sm:pb-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoadingTree || isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || isLoadingTree}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoadingTree ? 'Carregando...' : isSubmitting ? 'Salvando...' : treeId ? 'Atualizar Árvore' : 'Salvar Árvore'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
