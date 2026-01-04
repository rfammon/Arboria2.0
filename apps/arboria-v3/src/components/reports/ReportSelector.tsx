import { useState, useMemo } from 'react';
import { FileText, FileBarChart2, Calendar, TreeDeciduous, Search, CheckCircle2 } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { usePlans } from '../../hooks/usePlans';
import { useTrees } from '../../hooks/useTrees';
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
    const { plans, loading: isLoadingPlans } = usePlans();
    const { data: trees = [], isLoading: isLoadingTrees } = useTrees();
    const [selectedType, setSelectedType] = useState<ReportType | null>(null);
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    const selectedOption = REPORT_OPTIONS.find(opt => opt.type === selectedType);

    const filteredItems = useMemo(() => {
        if (!selectedOption?.selectionType || selectedOption.selectionType === 'none') return [];

        const term = searchTerm.toLowerCase();

        if (selectedOption.selectionType === 'plan') {
            return plans.filter(p =>
                (p.plan_id?.toLowerCase().includes(term)) ||
                (p.intervention_type?.toLowerCase().includes(term)) ||
                (p.tree?.especie?.toLowerCase().includes(term)) ||
                (p.id.includes(term))
            );
        } else {
            return trees.filter(t =>
                (t.codigo?.toLowerCase().includes(term)) ||
                (t.especie?.toLowerCase().includes(term)) ||
                (t.local?.toLowerCase().includes(term)) ||
                (t.id.includes(term))
            );
        }
    }, [selectedOption, plans, trees, searchTerm]);

    const handleGenerate = () => {
        if (!selectedType) {
            toast.error('Selecione um tipo de relatório');
            return;
        }

        if (selectedOption?.selectionType && selectedOption.selectionType !== 'none' && !selectedItemId) {
            toast.error(`Selecione ${selectedOption.selectionType === 'plan' ? 'um plano' : 'uma árvore'} na tabela abaixo`);
            return;
        }

        onGenerate(selectedType, selectedItemId || undefined);
    };

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
                                className={`group relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${isSelected ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20' : 'bg-background hover:bg-muted/30 border-white/10'}`}
                                onClick={() => {
                                    setSelectedType(option.type);
                                    setSelectedItemId('');
                                    setSearchTerm('');
                                }}
                            >
                                <CardHeader className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isSelected ? 'bg-primary text-white scale-110' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-base font-bold">{option.title}</CardTitle>
                                            <CardDescription className="text-xs font-medium mt-1 leading-relaxed">
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

            {/* Selection Table Section */}
            {selectedOption && selectedOption.selectionType && selectedOption.selectionType !== 'none' && (
                <div className="space-y-4 pt-4 border-t border-muted/50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <label className="text-sm font-bold flex items-center gap-2">
                            Selecione {selectedOption.selectionType === 'plan' ? 'o Plano' : 'a Árvore'}
                            <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                {filteredItems.length} encontrado(s)
                            </span>
                        </label>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Procurar..."
                                className="pl-9 bg-muted/30 rounded-full h-9 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="border rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm">
                        <div className="max-h-[300px] overflow-y-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="sticky top-0 bg-muted/90 backdrop-blur-md z-10 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">Identificação</th>
                                        <th className="px-4 py-3 font-bold">Destaque / Detalhe</th>
                                        <th className="px-4 py-3 text-right font-bold">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingPlans || isLoadingTrees ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground animate-pulse">
                                                Carregando dados...
                                            </td>
                                        </tr>
                                    ) : filteredItems.length > 0 ? (
                                        filteredItems.map(item => {
                                            const isSelected = selectedItemId === item.id;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={`hover:bg-primary/5 cursor-pointer transition-colors group ${isSelected ? 'bg-primary/10' : ''}`}
                                                    onClick={() => setSelectedItemId(item.id)}
                                                >
                                                    <td className="px-4 py-3 align-top">
                                                        <div className="font-bold text-foreground">
                                                            {selectedOption.selectionType === 'plan'
                                                                ? ((item as any).plan_id || item.id.slice(0, 8))
                                                                : ((item as any).codigo || item.id.slice(0, 8))}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-tighter">
                                                            {item.id}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <div className="font-medium">
                                                            {selectedOption.selectionType === 'plan'
                                                                ? (item as any).intervention_type
                                                                : (item as any).especie}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-0.5 italic">
                                                            {selectedOption.selectionType === 'plan'
                                                                ? ((item as any).tree?.especie || 'N/A')
                                                                : ((item as any).local || 'Sem localização')}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right align-middle">
                                                        {isSelected ? (
                                                            <CheckCircle2 className="w-5 h-5 text-primary ml-auto" />
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-8 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                Selecionar
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground italic">
                                                Nenhum resultado encontrado para "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Button */}
            {selectedType && (
                <div className="flex justify-end pt-4 animate-in slide-in-from-right-4 duration-500">
                    <Button
                        onClick={handleGenerate}
                        size="lg"
                        className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
                        disabled={selectedOption?.selectionType !== 'none' && !selectedItemId}
                    >
                        Gerar Relatório PDF
                    </Button>
                </div>
            )}
        </div>
    );
}
