/**
 * MapControls - Control panel for map layer toggle, filters, and zoom
 * Based on legacy map.ui.js controls
 */

import { Button } from '../ui/button';
import { Map, Satellite, ZoomIn, Check } from 'lucide-react';
import { LocationButton } from './LocationButton';
import { cn } from '../../lib/utils';

interface MapControlsProps {
    currentLayer: 'osm' | 'satellite';
    onToggleLayer: () => void;
    activeFilters: string[];
    onToggleFilter: (risk: string) => void;
    onZoomAll: () => void;
    className?: string;
}

export default function MapControls({
    currentLayer,
    onToggleLayer,
    activeFilters,
    onToggleFilter,
    onZoomAll,
    className
}: MapControlsProps) {
    const riskCategories = ['Alto', 'Médio', 'Baixo'];

    return (
        <div className={cn("space-y-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-800 transition-all", className)}>
            {/* Layer Toggle */}
            <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Visualização</p>
                <div className="grid grid-cols-2 gap-2">
                    <Button
                        onClick={() => currentLayer === 'satellite' && onToggleLayer()}
                        variant={currentLayer === 'osm' ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-xl font-bold h-9"
                    >
                        <Map className="h-4 w-4 mr-2" />
                        Mapa
                    </Button>
                    <Button
                        onClick={() => currentLayer === 'osm' && onToggleLayer()}
                        variant={currentLayer === 'satellite' ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-xl font-bold h-9"
                    >
                        <Satellite className="h-4 w-4 mr-2" />
                        Satélite
                    </Button>
                </div>
            </div>

            {/* Risk Toggles (Interactive Legend) */}
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between px-1">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Níveis de Risco</p>
                </div>
                
                <div className="grid grid-cols-1 gap-1.5">
                    {riskCategories.map(risk => {
                        const isActive = activeFilters.includes(risk);
                        const riskColors = {
                            'Alto': 'bg-red-500 text-white border-red-500 shadow-red-500/30',
                            'Médio': 'bg-orange-500 text-white border-orange-500 shadow-orange-500/30',
                            'Baixo': 'bg-green-500 text-white border-green-500 shadow-green-500/30',
                        };
                        const activeStyle = riskColors[risk as keyof typeof riskColors];

                        return (
                            <button
                                key={risk}
                                onClick={() => onToggleFilter(risk)}
                                className={cn(
                                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 shadow-sm",
                                    isActive 
                                        ? cn(activeStyle, "border-transparent shadow-lg scale-[1.02]") 
                                        : "bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gray-200 dark:hover:border-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full",
                                        risk === 'Alto' ? "bg-red-500" : 
                                        risk === 'Médio' ? "bg-orange-500" : "bg-green-500",
                                        isActive && "bg-white"
                                    )} />
                                    <span>{risk}</span>
                                </div>
                                {isActive && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-slate-800">
                <Button
                    onClick={onZoomAll}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 h-9"
                >
                    <ZoomIn className="h-4 w-4 mr-2" />
                    Focar Todas as Árvores
                </Button>

                <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-1">Localização</p>
                    <LocationButton className="w-full rounded-xl h-9 shadow-sm" />
                </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic px-1 pt-2">
                * O tamanho do marcador representa a zona de queda estimada.
            </p>
        </div>
    );
}

