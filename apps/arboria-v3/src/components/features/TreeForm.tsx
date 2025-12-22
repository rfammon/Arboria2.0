import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { treeSchema, type TreeFormData } from '../../lib/validations/treeSchema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Camera, Save, X, AlertTriangle } from 'lucide-react';
import { useTRAQCriteria } from '../../hooks/useTRAQCriteria';
import { TRAQChecklistModal } from '../traq/TRAQChecklistModal';
import type { TRAQAssessment } from '../../types/traq';
import { toast } from 'sonner';
import { useTreeMutations } from '../../hooks/useTreeMutations';
import { ClinometerModal } from '../sensors/ClinometerModal';
import { supabase } from '../../lib/supabase';
import { DAPCamera } from './dap/DAPCamera';
import { DAPOverlay } from './dap/DAPOverlay';
import { GPSCapture } from '../sensors/GPSCapture';

interface TreeFormProps {
    onClose: () => void;
    initialData?: Partial<TreeFormData>;
    treeId?: string;
}

export function TreeForm({ onClose, initialData, treeId }: TreeFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingTree, setIsLoadingTree] = useState(false);
    const [showClinometer, setShowClinometer] = useState(false);
    const [showDAPEstimator, setShowDAPEstimator] = useState(false);
    const [showTRAQ, setShowTRAQ] = useState(false);
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

    const handleTRAQComplete = (assessment: TRAQAssessment) => {
        setValue('pontuacao', assessment.totalScore);
        setValue('risco', assessment.initialRisk); // Initial Risk as main risk
        setValue('failure_prob', assessment.failureProb);
        setValue('impact_prob', assessment.impactProb);
        setValue('target_category', assessment.targetCategory || 0);
        setValue('residual_risk', assessment.residualRisk);
        setValue('risk_factors', assessment.riskFactors);
        setValue('mitigation', assessment.mitigationAction);

        toast.success(`Avaliação TRAQ concluída: Risco ${assessment.initialRisk}`);
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

                    {/* CAP and DAP Selection */}
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium leading-none">CAP (cm)</label>
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="Circunferência"
                                onChange={(e) => {
                                    const capValue = parseFloat(e.target.value);
                                    if (!isNaN(capValue)) {
                                        const calculatedDap = (capValue / Math.PI).toFixed(1);
                                        setValue('dap', parseFloat(calculatedDap));
                                    }
                                }}
                                className="h-10"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium leading-none">DAP (cm)</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    step="0.1"
                                    {...register('dap')}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowDAPEstimator(true)}
                                    title="Estimar DAP com câmera"
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Altura */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Altura (m)</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                step="0.1"
                                {...register('altura')}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowClinometer(true)}
                                title="Medir altura com clinômetro"
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Localização GPS */}
                    <div className="space-y-4 pt-4 border-t">
                        <label className="text-sm font-medium">Localização</label>
                        <GPSCapture
                            onCoordinatesCaptured={(coords: any) => {
                                setValue('easting', coords.easting);
                                setValue('northing', coords.northing);
                                setValue('latitude', coords.latitude || null);
                                setValue('longitude', coords.longitude || null);
                                setValue('utmzonenum', coords.zoneNum);
                                setValue('utmzoneletter', coords.zoneLetter);
                            }}
                        />

                        {/* Coordenadas UTM */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">UTM E (Leste)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register('easting')}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">UTM N (Norte)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register('northing')}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* TRAQ Evaluation Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Avaliação de Risco (TRAQ)
                        </label>

                        <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => setShowTRAQ(true)}
                            >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                {treeId ? 'Refazer Avaliação TRAQ' : 'Realizar Avaliação TRAQ'}
                            </Button>

                            {/* Hidden fields are populated via setValue, but we can visualize current state */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2">
                                <div className="border p-2 rounded bg-background">
                                    <span className="block opacity-70">Risco</span>
                                    <span className="font-medium text-foreground text-sm uppercase">
                                        {watch('risco') || '-'}
                                    </span>
                                </div>
                                <div className="border p-2 rounded bg-background">
                                    <span className="block opacity-70">Pontuação</span>
                                    <span className="font-medium text-foreground text-sm">
                                        {watch('pontuacao') || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
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

            {showClinometer && (
                <ClinometerModal
                    isOpen={showClinometer}
                    onClose={() => setShowClinometer(false)}
                    onHeightMeasured={(height: number) => {
                        setValue('altura', height);
                        setShowClinometer(false);
                    }}
                />
            )}

            <DAPCamera
                isOpen={showDAPEstimator}
                onClose={() => setShowDAPEstimator(false)}
                onCapture={() => { }}
            >
                <DAPOverlay
                    onConfirm={(dap) => {
                        setValue('dap', dap);
                        setShowDAPEstimator(false);
                        toast.success('DAP estimado com sucesso!');
                    }}
                />
            </DAPCamera>

            <TRAQChecklistModal
                isOpen={showTRAQ}
                onClose={() => setShowTRAQ(false)}
                onComplete={handleTRAQComplete}
                criteria={criteria}
            />
        </div>
    );
}
