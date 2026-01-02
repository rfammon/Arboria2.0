import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { WASTE_DESTINATIONS } from '../../../lib/planUtils';

interface ConclusionSectionProps {
    register: any;
    watch: any;
    setValue: any;
    errors: any;
    interventionType: string;
}

export function ConclusionSection({
    register,
    watch,
    setValue,
    errors,
    interventionType
}: ConclusionSectionProps) {
    if (interventionType === 'monitoramento') return null;

    const wasteDestination = watch('waste_destination');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span className="text-xl">🏁</span>
                    Encerramento
                </CardTitle>
                <CardDescription>Destinação de resíduos e instruções finais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="waste_destination">Destinação de Resíduos *</Label>
                    <Select
                        value={wasteDestination}
                        onValueChange={(value) => setValue('waste_destination', value, { shouldDirty: true })}
                    >
                        <SelectTrigger id="waste_destination">
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
                    {errors.waste_destination && (
                        <p className="text-sm text-destructive">{errors.waste_destination.message}</p>
                    )}
                </div>

                {wasteDestination === 'Outro' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="custom_waste">Especifique a Destinação *</Label>
                        <Input
                            id="custom_waste"
                            placeholder="Descreva a destinação..."
                            {...register('custom_waste', {
                                required: wasteDestination === 'Outro' ? 'Especifique a destinação' : false
                            })}
                        />
                        {errors.custom_waste && (
                            <p className="text-sm text-destructive">{errors.custom_waste.message}</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
