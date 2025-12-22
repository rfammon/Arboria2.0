// Plan Form Component - Create/Edit Intervention Plans

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Calendar, Users, Wrench, ShieldCheck, Check, ChevronsUpDown, TreeDeciduous } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import { cn } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { InterventionPlan, PlanFormData, InterventionType } from '../../types/plan';
import { INTERVENTION_LABELS, TOOLS_LIST, EPIS_LIST, SAFETY_PROCEDURES, RISK_LABELS, WASTE_DESTINATIONS } from '../../lib/planUtils';
import { usePlans } from '../../hooks/usePlans';
import { useTrees } from '../../hooks/useTrees';
import { useTreePhotos } from '../../hooks/useTreePhotos';
import { useToast } from '../../hooks/use-toast';
import { InterventionGantt } from './schedule/InterventionGantt';

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

    // Tree selection state
    const [openTreeSelect, setOpenTreeSelect] = useState(false);

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

    // Ensure trees is an array before finding
    const selectedTree = Array.isArray(trees) ? trees.find(t => t.id === selectedTreeId) : undefined;

    // Fetch photos for selected tree
    const { data: treePhotos = [] } = useTreePhotos(selectedTreeId, { limit: 5 });

    // Conflict detection
    const [conflictWarning, setConflictWarning] = useState<string | null>(null);

    useEffect(() => {
        if (!scheduleStart || !existingPlans) {
            setConflictWarning(null);
            return;
        }

        const date = new Date(scheduleStart);
        date.setHours(0, 0, 0, 0);

        // Check for conflicts
        const conflicts = existingPlans.filter(p => {
            // Skip current plan if editing
            if (isEdit && plan && p.id === plan.id) return false;

            const pDateStr = p.schedule.start || p.schedule.startDate;
            if (!pDateStr) return false;

            const pDate = new Date(pDateStr);
            pDate.setHours(0, 0, 0, 0);

            if (pDate.getTime() !== date.getTime()) return false;

            // Check responsible conflict
            if (responsibleName && p.responsible &&
                p.responsible.toLowerCase() === responsibleName.toLowerCase()) {
                return true;
            }

            // Check tree conflict
            if (selectedTreeId && p.tree_id === selectedTreeId) {
                return true;
            }

            return false;
        });

        if (conflicts.length > 0) {
            const conflict = conflicts[0];
            if (conflict.tree_id === selectedTreeId) {
                setConflictWarning(`Atenção: Já existe um plano (${conflict.plan_id}) para esta árvore nesta data.`);
            } else {
                setConflictWarning(`Atenção: O responsável ${conflict.responsible} já tem outro plano (${conflict.plan_id}) nesta data.`);
            }
        } else {
            setConflictWarning(null);
        }

    }, [scheduleStart, responsibleName, selectedTreeId, existingPlans, isEdit, plan]);

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

    // Handle array inputs (techniques, tools, epis)
    const [techniquesInput, setTechniquesInput] = useState('');
    const [toolsInput, setToolsInput] = useState('');
    const [episInput, setEpisInput] = useState('');

    const handleAddTechnique = () => {
        if (techniquesInput.trim()) {
            const current = watch('techniques') || [];
            setValue('techniques', [...current, techniquesInput.trim()]);
            setTechniquesInput('');
        }
    };

    const handleRemoveTechnique = (index: number) => {
        const current = watch('techniques') || [];
        setValue('techniques', current.filter((_, i) => i !== index));
    };

    const handleAddTool = () => {
        if (toolsInput.trim()) {
            const current = watch('tools') || [];
            setValue('tools', [...current, toolsInput.trim()]);
            setToolsInput('');
        }
    };

    const handleAddEpi = () => {
        if (episInput.trim()) {
            const current = watch('epis') || [];
            setValue('epis', [...current, episInput.trim()]);
            setEpisInput('');
        }
    };


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
                            <div className="flex flex-col space-y-2">
                                <Label>Buscar Árvore</Label>
                                <Popover open={openTreeSelect} onOpenChange={setOpenTreeSelect}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openTreeSelect}
                                            className="w-full justify-between"
                                            disabled={isEdit} // Disable tree change on edit to prevent issues
                                        >
                                            {selectedTree
                                                ? `${selectedTree.especie || 'Espécie Desconhecida'} (ID: ${selectedTree.id.slice(0, 8)}...)`
                                                : "Selecione uma árvore..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar por espécie ou ID..." />
                                            <CommandList>
                                                <CommandEmpty>Nenhuma árvore encontrada.</CommandEmpty>
                                                <CommandGroup heading="Árvores Disponíveis" className="max-h-[300px] overflow-auto">
                                                    {trees.map((tree) => (
                                                        <CommandItem
                                                            key={tree.id}
                                                            value={`${tree.especie || ''} ${tree.id}`}
                                                            onSelect={() => {
                                                                setValue('tree_id', tree.id, { shouldValidate: true, shouldDirty: true });
                                                                setOpenTreeSelect(false);
                                                            }}
                                                            className="cursor-pointer p-0 !pointer-events-auto" // Remove padding to let inner div fill space
                                                        >
                                                            <div className="flex items-center w-full h-full px-2 py-1.5">
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        watch('tree_id') === tree.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{tree.especie || 'Espécie Desconhecida'}</span>
                                                                    <span className="text-xs text-muted-foreground">ID: {tree.id}</span>
                                                                </div>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                {errors.tree_id && (
                                    <p className="text-sm text-destructive">Selecione uma árvore para continuar</p>
                                )}
                            </div>

                            {/* Selected Tree Preview */}
                            {selectedTree && (
                                <div className="space-y-3">
                                    <div className="bg-muted p-4 rounded-md flex items-start gap-4">
                                        {/* Tree Photo Preview */}
                                        <div className="w-20 h-20 bg-background rounded border flex-shrink-0 overflow-hidden">
                                            {treePhotos.length > 0 ? (
                                                <img
                                                    src={treePhotos[0].signedUrl}
                                                    alt="Foto da árvore"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <TreeDeciduous className="w-8 h-8 opacity-50" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg">{selectedTree.especie || 'Espécie Desconhecida'}</h4>
                                            <p className="text-sm text-muted-foreground">{selectedTree.local || 'Localização não especificada'}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selectedTree.dap && <span className="text-xs bg-background px-2 py-1 rounded border font-mono">DAP: {selectedTree.dap}cm</span>}
                                                {selectedTree.altura && <span className="text-xs bg-background px-2 py-1 rounded border font-mono">Alt: {selectedTree.altura}m</span>}
                                                {/* Show risk info if available */}
                                                {(selectedTree.pontuacao || selectedTree.risklevel) && (
                                                    <span className={cn(
                                                        "text-xs px-2 py-1 rounded border font-bold",
                                                        selectedTree.risklevel === 'Alto' ? "bg-red-100 text-red-800 border-red-200" :
                                                            selectedTree.risklevel === 'Médio' ? "bg-orange-100 text-orange-800 border-orange-200" :
                                                                "bg-green-100 text-green-800 border-green-200"
                                                    )}>
                                                        Risco: {selectedTree.risklevel || 'N/A'} (TRAQ: {selectedTree.pontuacao || '-'})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk Factors Display */}
                                    {selectedTree.risk_factors && selectedTree.risk_factors.length > 0 && (
                                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-3 rounded-md">
                                            <h5 className="text-xs font-semibold text-red-800 dark:text-red-300 uppercase mb-2">Fatores de Risco Identificados:</h5>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedTree.risk_factors.map((factor, idx) => {
                                                    // Convert binary string/number to boolean check
                                                    const isRiskPresent = String(factor) === '1';
                                                    if (!isRiskPresent) return null;

                                                    const label = idx < RISK_LABELS.length ? RISK_LABELS[idx] : `Risco ${idx + 1}`;

                                                    return (
                                                        <span key={idx} className="text-xs bg-white dark:bg-black/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-2 py-0.5 rounded">
                                                            {label}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Photos Gallery (Mini) */}
                                    {treePhotos.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {treePhotos.slice(1).map((photo) => (
                                                <img
                                                    key={photo.id}
                                                    src={photo.signedUrl}
                                                    alt="Foto adicional"
                                                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
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

                {/* Schedule & Durations - Unified Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Cronograma e Duração
                        </CardTitle>
                        <CardDescription>Defina os prazos e a duração estimada de cada etapa</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Dates Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="schedule_start">Data de Início *</Label>
                                <Input
                                    id="schedule_start"
                                    type="date"
                                    {...register('schedule.start', {
                                        required: 'Data de início é obrigatória',
                                        onChange: (e) => {
                                            // Auto-calculate end date based on start + duration
                                            const start = e.target.value;
                                            const durations = watch('durations');
                                            if (start && durations) {
                                                const totalDays = (durations.mobilization || 0) + (durations.execution || 0) + (durations.demobilization || 0);
                                                if (totalDays > 0) {
                                                    const startDate = new Date(start);
                                                    const endDate = new Date(startDate);
                                                    endDate.setDate(startDate.getDate() + Math.max(0, totalDays - 1)); // -1 because start day counts
                                                    setValue('schedule.end', endDate.toISOString().split('T')[0]);
                                                }
                                            }
                                        }
                                    })}
                                />
                                {errors.schedule?.start && (
                                    <p className="text-sm text-destructive">{errors.schedule.start.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="schedule_end">Data de Término</Label>
                                <Input
                                    id="schedule_end"
                                    type="date"
                                    {...register('schedule.end', {
                                        onChange: (e) => {
                                            // Recalculate execution duration based on end - start - (mob + demob)
                                            const end = e.target.value;
                                            const start = watch('schedule.start');
                                            const mobil = watch('durations.mobilization') || 0;
                                            const demobil = watch('durations.demobilization') || 0;

                                            if (end && start) {
                                                const startDate = new Date(start);
                                                const endDate = new Date(end);
                                                const diffTime = endDate.getTime() - startDate.getTime();
                                                const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start date

                                                if (totalDays > 0) {
                                                    const newExecution = Math.max(1, totalDays - mobil - demobil);
                                                    setValue('durations.execution', newExecution);
                                                }
                                            }
                                        }
                                    })}
                                />
                                <p className="text-xs text-muted-foreground">Calculada automaticamente</p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <Label className="text-sm font-semibold mb-3 block">Detalhamento da Duração (dias)</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="mobilization" className="text-xs">Mobilização</Label>
                                    <Input
                                        id="mobilization"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...register('durations.mobilization', {
                                            valueAsNumber: true,
                                            onChange: () => {
                                                // Update end date when mobilization changes
                                                const start = watch('schedule.start');
                                                const mobil = watch('durations.mobilization') || 0;
                                                const exec = watch('durations.execution') || 0;
                                                const demobil = watch('durations.demobilization') || 0;

                                                if (start) {
                                                    const totalDays = mobil + exec + demobil;
                                                    const startDate = new Date(start);
                                                    const endDate = new Date(startDate);
                                                    endDate.setDate(startDate.getDate() + Math.max(0, totalDays - 1));
                                                    setValue('schedule.end', endDate.toISOString().split('T')[0]);
                                                }
                                            }
                                        })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="execution" className="text-xs">Execução *</Label>
                                    <Input
                                        id="execution"
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        {...register('durations.execution', {
                                            valueAsNumber: true,
                                            required: 'Duração de execução é obrigatória',
                                            min: { value: 1, message: 'Mínimo 1 dia' },
                                            onChange: () => {
                                                // Update end date when execution changes
                                                const start = watch('schedule.start');
                                                const mobil = watch('durations.mobilization') || 0;
                                                const exec = watch('durations.execution') || 0;
                                                const demobil = watch('durations.demobilization') || 0;

                                                if (start) {
                                                    const totalDays = mobil + exec + demobil;
                                                    const startDate = new Date(start);
                                                    const endDate = new Date(startDate);
                                                    endDate.setDate(startDate.getDate() + Math.max(0, totalDays - 1));
                                                    setValue('schedule.end', endDate.toISOString().split('T')[0]);
                                                }
                                            }
                                        })}
                                    />
                                    {errors.durations?.execution && (
                                        <p className="text-sm text-destructive">{errors.durations.execution.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="demobilization" className="text-xs">Desmobilização</Label>
                                    <Input
                                        id="demobilization"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...register('durations.demobilization', {
                                            valueAsNumber: true,
                                            onChange: () => {
                                                // Update end date when demobilization changes
                                                const start = watch('schedule.start');
                                                const mobil = watch('durations.mobilization') || 0;
                                                const exec = watch('durations.execution') || 0;
                                                const demobil = watch('durations.demobilization') || 0;

                                                if (start) {
                                                    const totalDays = mobil + exec + demobil;
                                                    const startDate = new Date(start);
                                                    const endDate = new Date(startDate);
                                                    endDate.setDate(startDate.getDate() + Math.max(0, totalDays - 1));
                                                    setValue('schedule.end', endDate.toISOString().split('T')[0]);
                                                }
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Team & Responsible */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Equipe Responsável
                        </CardTitle>
                        <CardDescription>Pessoa responsável pela execução</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="responsible">Nome do Responsável</Label>
                                <Input
                                    id="responsible"
                                    placeholder="Nome completo"
                                    {...register('responsible')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="responsible_title">Cargo/Função</Label>
                                <Input
                                    id="responsible_title"
                                    placeholder="Ex: Supervisor de Campo"
                                    {...register('responsible_title')}
                                />
                            </div>
                        </div>


                        <div className="pt-2 border-t mt-2">
                            <Label className="text-sm font-semibold mb-2 block">Composição da Equipe</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="team_supervisors" className="text-xs">Encarregados</Label>
                                    <Input
                                        id="team_supervisors"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...register('team_composition.supervisors', { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="team_chainsaw_operators" className="text-xs">Motosserristas</Label>
                                    <Input
                                        id="team_chainsaw_operators"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...register('team_composition.chainsaw_operators', { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="team_helpers" className="text-xs">Auxiliares</Label>
                                    <Input
                                        id="team_helpers"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        {...register('team_composition.helpers', { valueAsNumber: true })}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Techniques */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wrench className="w-5 h-5" />
                            Técnicas Previstas
                        </CardTitle>
                        <CardDescription>Técnicas que serão aplicadas na intervenção</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ex: Poda de formação"
                                value={techniquesInput}
                                onChange={(e) => setTechniquesInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnique())}
                            />
                            <Button type="button" onClick={handleAddTechnique} variant="secondary">
                                Adicionar
                            </Button>
                        </div>

                        {watch('techniques') && watch('techniques')!.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {watch('techniques')!.map((technique, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                                    >
                                        <span>{technique}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTechnique(index)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tools */}
                <Card>
                    <CardHeader>
                        <CardTitle>🛠️ Ferramentas Necessárias</CardTitle>
                        <CardDescription>Selecione os equipamentos para execução</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {TOOLS_LIST.map((tool) => {
                                const tools = watch('tools') || [];
                                const isChecked = tools.includes(tool);
                                return (
                                    <div key={tool} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`tool-${tool}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue('tools', [...tools, tool]);
                                                } else {
                                                    setValue('tools', tools.filter(t => t !== tool));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`tool-${tool}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {tool}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-2 border-t mt-2">
                            <Label className="text-xs text-muted-foreground mb-2 block">Outros equipamentos:</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: Guincho, Caminhão Munck"
                                    value={toolsInput}
                                    onChange={(e) => setToolsInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                                />
                                <Button type="button" onClick={handleAddTool} variant="secondary" size="sm">
                                    Adicionar
                                </Button>
                            </div>
                            {watch('tools') && watch('tools')!.filter(t => !TOOLS_LIST.includes(t)).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {watch('tools')!.filter(t => !TOOLS_LIST.includes(t)).map((tool, index) => (
                                        <div
                                            key={`custom-tool-${index}`}
                                            className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                                        >
                                            <span>{tool}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const current = watch('tools') || [];
                                                    setValue('tools', current.filter(t => t !== tool));
                                                }}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* EPIs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" />
                            EPIs Necessários
                        </CardTitle>
                        <CardDescription>Equipamentos de Proteção Individual obrigatórios</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                            {EPIS_LIST.map((epi) => {
                                const epis = watch('epis') || [];
                                const isChecked = epis.includes(epi);
                                return (
                                    <div key={epi} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`epi-${epi}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue('epis', [...epis, epi]);
                                                } else {
                                                    setValue('epis', epis.filter(e => e !== epi));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`epi-${epi}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {epi}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-2 border-t mt-2">
                            <Label className="text-xs text-muted-foreground mb-2 block">Outros EPIs:</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: Luvas de alta tensão"
                                    value={episInput}
                                    onChange={(e) => setEpisInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEpi())}
                                />
                                <Button type="button" onClick={handleAddEpi} variant="secondary" size="sm">
                                    Adicionar
                                </Button>
                            </div>
                            {watch('epis') && watch('epis')!.filter(e => !EPIS_LIST.includes(e)).length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {watch('epis')!.filter(e => !EPIS_LIST.includes(e)).map((epi, index) => (
                                        <div
                                            key={`custom-epi-${index}`}
                                            className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                                        >
                                            <span>{epi}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const current = watch('epis') || [];
                                                    setValue('epis', current.filter(e => e !== epi));
                                                }}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Waste Destination & Closing */}
                {interventionType !== 'monitoramento' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <span className="">🏁</span>
                                Encerramento
                            </CardTitle>
                            <CardDescription>Destinação de resíduos e instruções finais</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="waste_destination">Destinação de Resíduos *</Label>
                                <Select
                                    value={watch('waste_destination')}
                                    onValueChange={(value) => setValue('waste_destination', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a destinação" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WASTE_DESTINATIONS.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {watch('waste_destination') === 'Outro' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label htmlFor="custom_waste">Especifique a Destinação *</Label>
                                    <Input
                                        id="custom_waste"
                                        placeholder="Descreva a destinação..."
                                        {...register('custom_waste', {
                                            required: watch('waste_destination') === 'Outro' ? 'Especifique a destinação' : false
                                        })}
                                    />
                                    {errors.custom_waste && (
                                        <p className="text-sm text-destructive">{errors.custom_waste.message}</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2 pt-2">
                                <Label className="text-sm font-medium">Orientações de Execução</Label>
                                <Textarea
                                    placeholder="Instruções adicionais para a equipe de campo..."
                                    className="h-24"
                                // Using justification field or adding a new one?
                                // The legacy code used 'executionInstructions'. 
                                // Currently PlanFormData doesn't have it, reusing justification or adding?
                                // PlanFormData has 'justification'. Let's stick to adding it as a separate comment if needed, 
                                // but for now, we only implement what's in PlanFormData.
                                // Waait, 'orietações' usually goes into justification or we add a new field.
                                // The user request was "Final Waste Destination".
                                // I'll leave the Textarea out for now to strictly follow the requirement 
                                // or just reuse justification if appropriate, but justification is already above.
                                // The legacy form had "Orientações de Execução".
                                // I didn't add that to types. I'll skip it to match strict scope.
                                // Just Waste Destination.
                                />
                                <p className="text-xs text-muted-foreground">Utilize o campo de Justificativa para observações gerais.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}



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
