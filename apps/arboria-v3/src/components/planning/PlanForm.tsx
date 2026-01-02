// Plan Form Component - Create/Edit Intervention Plans

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Wrench, ShieldCheck, TreeDeciduous } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { InterventionPlan, PlanFormData, InterventionType } from '../../types/plan';
import { INTERVENTION_LABELS, TOOLS_LIST, EPIS_LIST, SAFETY_PROCEDURES } from '../../lib/planUtils';
import { usePlans } from '../../hooks/usePlans';
import { usePlanConflicts } from '../../hooks/usePlanConflicts';
import { useTrees } from '../../hooks/useTrees';
import { useTreePhotos } from '../../hooks/useTreePhotos';
import { useToast } from '../../hooks/use-toast';
import { InterventionGantt } from './schedule/InterventionGantt';
import { ArrayFieldSection } from './sections/ArrayFieldSection';
import { TreeSelectorField } from './sections/TreeSelectorField';
import { ScheduleSection } from './sections/ScheduleSection';
import { ResponsibleSection } from './sections/ResponsibleSection';
import { ConclusionSection } from './sections/ConclusionSection';

interface PlanFormProps {
    plan?: InterventionPlan | null;
    initialTreeId?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

export function PlanForm({ plan, initialTreeId, onCancel, onSuccess }: PlanFormProps) {
    const { createPlan, updatePlan, plans: existingPlans } = usePlans();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Simplified: Tree selection state handled by sub-component

    // Fetch trees for selection
    // We pass empty filters to get all trees for the current installation
    const { data: trees = [] } = useTrees();

    const isEdit = !!plan;

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PlanFormData>({
        defaultValues: {
            intervention_type: plan?.intervention_type || 'poda',
            tree_id: plan?.tree_id || initialTreeId || '', // Initialize with existing tree_id or passed initial ID
            schedule: plan?.schedule || { start: '', end: '' },
            justification: plan?.justification || '',
            responsible: plan?.responsible || '',
            responsible_title: plan?.responsible_title || '',
            techniques: plan?.techniques || [],
            tools: plan?.tools || [],
            epis: plan?.epis || [],
            durations: plan?.durations || { mobilization: 0, execution: 1, demobilization: 0 },
            waste_destination: plan?.waste_destination || '',
            custom_waste: plan?.custom_waste || ''
        }
    });

    // Watch values
    const interventionType = watch('intervention_type');
    const selectedTreeId = watch('tree_id');
    const scheduleStart = watch('schedule.start');
    const responsibleName = watch('responsible');

    // Fetch photos for selected tree
    const { data: treePhotos = [] } = useTreePhotos(selectedTreeId, { limit: 5 });

    // Conflict detection using custom hook
    const conflictWarning = usePlanConflicts(
        scheduleStart,
        responsibleName,
        selectedTreeId,
        existingPlans,
        isEdit,
        plan?.id
    );

    // Handle form submission
    const onSubmit = async (data: PlanFormData) => {
        setIsSubmitting(true);

        if (!data.tree_id) {
            toast({
                title: 'Erro de validação',
                description: 'Por favor, selecione uma árvore alvo.',
                variant: 'destructive'
            });
            setIsSubmitting(false);
            return;
        }

        try {
            // Ensure schedule has proper format
            const scheduleData = {
                start: data.schedule.start || data.schedule.startDate || '',
                end: data.schedule.end || data.schedule.endDate || ''
            };

            const formData: PlanFormData = {
                ...data,
                schedule: scheduleData
            };

            let result;
            if (isEdit && plan) {
                result = await updatePlan(plan.id, formData);
            } else {
                result = await createPlan(formData);
            }

            if (result) {
                toast({
                    title: isEdit ? 'Plano atualizado!' : 'Plano criado!',
                    description: `Plano ${result.plan_id} foi ${isEdit ? 'atualizado' : 'criado'} com sucesso.`,
                });
                onSuccess();
            } else {
                throw new Error('Falha ao salvar plano');
            }
        } catch (error) {
            toast({
                title: 'Erro ao salvar',
                description: error instanceof Error ? error.message : 'Erro desconhecido',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Simplified: No more local state for array inputs


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">
                        {isEdit ? 'Editar Plano de Intervenção' : 'Novo Plano de Intervenção'}
                    </h1>
                    {isEdit && plan && (
                        <p className="text-sm text-muted-foreground mt-1">
                            {plan.plan_id}
                        </p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Tree Selection - FIRST STEP */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TreeDeciduous className="w-5 h-5 text-green-600" />
                            Árvore Alvo
                        </CardTitle>
                        <CardDescription>
                            Selecione a árvore que receberá a intervenção (obrigatório)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <TreeSelectorField
                                trees={trees}
                                selectedTreeId={selectedTreeId}
                                onSelect={(id) => setValue('tree_id', id, { shouldValidate: true, shouldDirty: true })}
                                treePhotos={treePhotos}
                                error={errors.tree_id}
                                isEdit={isEdit}
                            />
                        </div>
                    </CardContent>
                </Card>



                {conflictWarning && (
                    <Alert variant="destructive" className="mt-4 mb-4">
                        <AlertTitle>Conflito de Agendamento</AlertTitle>
                        <AlertDescription>
                            {conflictWarning}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações Básicas</CardTitle>

                        <CardDescription>Tipo e justificativa da intervenção</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Intervention Type */}
                        <div className="space-y-2">
                            <Label htmlFor="intervention_type">Tipo de Intervenção *</Label>
                            <Select
                                value={interventionType}
                                onValueChange={(value) => setValue('intervention_type', value as InterventionType)}
                                displayValue={interventionType ? INTERVENTION_LABELS[interventionType as InterventionType] : undefined}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(INTERVENTION_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.intervention_type && (
                                <p className="text-sm text-destructive">{errors.intervention_type.message}</p>
                            )}
                        </div>

                        {/* Justification */}
                        <div className="space-y-2">
                            <Label htmlFor="justification">Justificativa</Label>
                            <Textarea
                                id="justification"
                                rows={4}
                                placeholder="Descreva a justificativa técnica para esta intervenção..."
                                {...register('justification')}
                            />
                            {errors.justification && (
                                <p className="text-sm text-destructive">{errors.justification.message}</p>
                            )}
                        </div>


                        {/* Safety Procedures Alert */}
                        {interventionType && SAFETY_PROCEDURES[interventionType] && (
                            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 mt-4">
                                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold mb-2">Procedimentos de Segurança ({INTERVENTION_LABELS[interventionType]})</AlertTitle>
                                <AlertDescription className="text-blue-700 dark:text-blue-400 text-xs whitespace-pre-line">
                                    {SAFETY_PROCEDURES[interventionType]}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* Gantt Chart Overview */}
                {existingPlans && existingPlans.length > 0 && (
                    <div className="mb-6">
                        <InterventionGantt plans={existingPlans} />
                    </div>
                )}

                {/* Schedule & Duration */}
                <ScheduleSection
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    conflictWarning={conflictWarning}
                />

                {/* Team & Responsible */}
                <ResponsibleSection
                    register={register}
                />

                <ArrayFieldSection
                    title="Técnicas Previstas"
                    description="Técnicas que serão aplicadas na intervenção"
                    icon={Wrench}
                    placeholder="Ex: Poda de formação"
                    selectedValues={watch('techniques') || []}
                    onValueChange={(vals) => setValue('techniques', vals, { shouldDirty: true })}
                />

                <ArrayFieldSection
                    title="Ferramentas Necessárias"
                    description="Selecione os equipamentos para execução"
                    options={TOOLS_LIST}
                    columns={3}
                    placeholder="Ex: Guincho, Caminhão Munck"
                    selectedValues={watch('tools') || []}
                    onValueChange={(vals) => setValue('tools', vals, { shouldDirty: true })}
                />

                <ArrayFieldSection
                    title="EPIs Necessários"
                    description="Equipamentos de Proteção Individual obrigatórios"
                    icon={ShieldCheck}
                    options={EPIS_LIST}
                    placeholder="Ex: Luvas de alta tensão"
                    selectedValues={watch('epis') || []}
                    onValueChange={(vals) => setValue('epis', vals, { shouldDirty: true })}
                />

                <ConclusionSection
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    errors={errors}
                    interventionType={interventionType}
                />

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                {isEdit ? 'Atualizar Plano' : 'Criar Plano'}
                            </>
                        )}
                    </Button>
                </div>
            </form >
        </div >
    );
}
