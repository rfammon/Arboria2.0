import { Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface ResponsibleSectionProps {
    register: any;
}

export function ResponsibleSection({
    register
}: ResponsibleSectionProps) {
    return (
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
    );
}
