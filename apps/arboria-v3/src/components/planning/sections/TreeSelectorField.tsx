import { useState } from 'react';
import { Check, ChevronsUpDown, TreeDeciduous } from 'lucide-react';
import { Button } from '../../ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../ui/popover";
import { cn } from '../../../lib/utils';
import { Label } from '../../ui/label';
import { RISK_LABELS } from '../../../lib/planUtils';

interface TreeSelectorFieldProps {
    trees: any[];
    selectedTreeId?: string;
    onSelect: (treeId: string) => void;
    treePhotos: any[];
    error?: any;
    isEdit?: boolean;
}

export function TreeSelectorField({
    trees,
    selectedTreeId,
    onSelect,
    treePhotos,
    error
}: TreeSelectorFieldProps) {
    const [open, setOpen] = useState(false);
    const selectedTree = trees.find(t => t.id === selectedTreeId);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label className="text-base font-semibold">🌳 Árvore Objeto da Intervenção *</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn(
                                "w-full justify-between h-12 text-left font-normal border-2",
                                !selectedTreeId && "text-muted-foreground",
                                error && "border-destructive"
                            )}
                        >
                            <span className="truncate">
                                {selectedTreeId
                                    ? trees.find((tree) => tree.id === selectedTreeId)?.especie || "Árvore selecionada"
                                    : "Selecione uma árvore..."}
                            </span>
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
                                            value={`${tree.especie || ''} ${tree.id} `}
                                            onSelect={() => {
                                                onSelect(tree.id);
                                                setOpen(false);
                                            }}
                                            className="cursor-pointer p-0 !pointer-events-auto"
                                        >
                                            <div className="flex items-center w-full h-full px-2 py-1.5">
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedTreeId === tree.id ? "opacity-100" : "opacity-0"
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
                {error && (
                    <p className="text-sm text-destructive">{error.message || "Selecione uma árvore para continuar"}</p>
                )}
            </div>

            {selectedTree && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-muted p-4 rounded-md flex items-start gap-4">
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

                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate">{selectedTree.especie || 'Espécie Desconhecida'}</h4>
                            <p className="text-sm text-muted-foreground truncate">{selectedTree.local || 'Localização não especificada'}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedTree.dap && <span className="text-xs bg-background px-2 py-1 rounded border font-mono">DAP: {selectedTree.dap}cm</span>}
                                {selectedTree.altura && <span className="text-xs bg-background px-2 py-1 rounded border font-mono">Alt: {selectedTree.altura}m</span>}
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

                    {selectedTree.risk_factors && selectedTree.risk_factors.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-3 rounded-md">
                            <h5 className="text-[10px] font-semibold text-red-800 dark:text-red-300 uppercase mb-2">Fatores de Risco Identificados:</h5>
                            <div className="flex flex-wrap gap-1">
                                {selectedTree.risk_factors.map((factor: any, idx: number) => {
                                    const isRiskPresent = String(factor) === '1';
                                    if (!isRiskPresent) return null;
                                    const label = idx < RISK_LABELS.length ? RISK_LABELS[idx] : `Risco ${idx + 1} `;
                                    return (
                                        <span key={idx} className="text-[10px] bg-white dark:bg-black/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-1.5 py-0.5 rounded leading-none">
                                            {label}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {treePhotos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {treePhotos.slice(1).map((photo: any) => (
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
    );
}
