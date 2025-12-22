import { useState } from 'react';
import { FileText, FileBarChart2, Calendar, TreeDeciduous } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { usePlans } from '../../hooks/usePlans';
import { useTrees } from '../../hooks/useTrees';
// import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export type ReportType = 'intervention-plan' | 'risk-inventory' | 'schedule' | 'tree-individual';

interface ReportOption {
    type: ReportType;
    title: string;
    description: string;
    icon: typeof FileText;
    selectionType?: 'plan' | 'tree' | 'none';
}

const REPORT_OPTIONS: ReportOption[] = [
    {
        type: 'intervention-plan',
        title: 'Plano de Intervenção',
        description: 'Relatório completo com Gantt, EPIs, procedimentos e equipe',
        icon: FileBarChart2,
        selectionType: 'plan'
    },
    {
        type: 'risk-inventory',
        title: 'Inventário de Risco',
        description: 'Estatísticas gerais, mapa e tabela de árvores',
        icon: FileText,
        selectionType: 'none'
    },
    {
        type: 'schedule',
        title: 'Cronograma de Intervenções',
        description: 'Timeline com todas as intervenções programadas',
        icon: Calendar,
        selectionType: 'none'
    },
    {
        type: 'tree-individual',
        title: 'Ficha Individual de Árvore',
        description: 'Dados completos, foto, mapa e avaliação de risco',
        icon: TreeDeciduous,
        selectionType: 'tree'
    }
];

interface ReportSelectorProps {
    onGenerate: (type: ReportType, selectedId?: string) => void;
}

export function ReportSelector({ onGenerate }: ReportSelectorProps) {
    const { plans } = usePlans();
    const { data: trees = [] } = useTrees();
    const [selectedType, setSelectedType] = useState<ReportType | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string>('');

    const handleGenerate = () => {
        if (!selectedType) {
            toast.error('Selecione um tipo de relatório');
            return;
        }

        const option = REPORT_OPTIONS.find(opt => opt.type === selectedType);

        if (option?.selectionType && option.selectionType !== 'none' && !selectedItemId) {
            toast.error(`Selecione ${option.selectionType === 'plan' ? 'um plano' : 'uma árvore'}`);
            return;
        }

        onGenerate(selectedType, selectedItemId || undefined);
    };

    const selectedOption = REPORT_OPTIONS.find(opt => opt.type === selectedType);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold mb-4">Selecione o Tipo de Relatório</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REPORT_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedType === option.type;

                        return (
                            <Card
                                key={option.type}
                                className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-primary border-2' : ''
                                    }`}
                                onClick={() => {
                                    setSelectedType(option.type);
                                    setSelectedItemId('');
                                }}
                            >
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-base">{option.title}</CardTitle>
                                            <CardDescription className="text-sm mt-1">
                                                {option.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Selection Section */}
            {selectedOption && selectedOption.selectionType && selectedOption.selectionType !== 'none' && (
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Selecione {selectedOption.selectionType === 'plan' ? 'o Plano' : 'a Árvore'}
                    </label>
                    <Select
                        value={selectedItemId}
                        onValueChange={setSelectedItemId}
                        displayValue={
                            selectedOption.selectionType === 'plan'
                                ? plans.find(p => p.id === selectedItemId)?.plan_id || selectedItemId
                                : trees.find(t => t.id === selectedItemId)?.codigo || selectedItemId
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={`Escolha ${selectedOption.selectionType === 'plan' ? 'um plano' : 'uma árvore'}...`} />
                        </SelectTrigger>
                        <SelectContent>
                            {selectedOption.selectionType === 'plan' ? (
                                plans.length > 0 ? (
                                    plans.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            {plan.plan_id || plan.id} - {plan.intervention_type}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Nenhum plano disponível
                                    </SelectItem>
                                )
                            ) : (
                                trees?.length > 0 ? (
                                    trees.map(tree => (
                                        <SelectItem key={tree.id} value={tree.id}>
                                            {tree.codigo || tree.id} - {tree.especie}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Nenhuma árvore disponível
                                    </SelectItem>
                                )
                            )}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Generate Button */}
            {selectedType && (
                <div className="flex justify-end">
                    <Button onClick={handleGenerate} size="lg">
                        Gerar Relatório PDF
                    </Button>
                </div>
            )}
        </div>
    );
}
