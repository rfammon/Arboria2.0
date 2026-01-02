import { Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Alert, AlertDescription } from '../../ui/alert';

interface ScheduleSectionProps {
    register: any;
    watch: any;
    setValue: any;
    errors: any;
    conflictWarning: string | null;
}

export function ScheduleSection({
    register,
    watch,
    setValue,
    errors,
    conflictWarning
}: ScheduleSectionProps) {
    const handleDateChange = (type: 'start' | 'end') => {
        const start = watch('schedule.start');
        const end = watch('schedule.end');
        const mobil = watch('durations.mobilization') || 0;
        const exec = watch('durations.execution') || 0;
        const demobil = watch('durations.demobilization') || 0;

        if (type === 'start' && start) {
            const totalDays = mobil + exec + demobil;
            const startDate = new Date(start);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + Math.max(0, totalDays - 1));
            setValue('schedule.end', endDate.toISOString().split('T')[0]);
        } else if (type === 'end' && start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diffTime = endDate.getTime() - startDate.getTime();
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            if (totalDays > 0) {
                const newExecution = Math.max(1, totalDays - mobil - demobil);
                setValue('durations.execution', newExecution);
            }
        }
    };

    const handleDurationChange = () => {
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
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Cronograma de Intervenção
                </CardTitle>
                <CardDescription>Defina as datas e durações previstas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {conflictWarning && (
                    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                        <AlertDescription className="font-medium">
                            {conflictWarning}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="start_date">Data de Início *</Label>
                        <Input
                            id="start_date"
                            type="date"
                            {...register('schedule.start', {
                                required: 'Data de início é obrigatória',
                                onChange: () => handleDateChange('start')
                            })}
                        />
                        {errors.schedule?.start && (
                            <p className="text-sm text-destructive">{errors.schedule.start.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="end_date">Data de Término Estimada</Label>
                        <Input
                            id="end_date"
                            type="date"
                            {...register('schedule.end', {
                                onChange: () => handleDateChange('end')
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
                                    onChange: handleDurationChange
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
                                    onChange: handleDurationChange
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
                                    onChange: handleDurationChange
                                })}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
