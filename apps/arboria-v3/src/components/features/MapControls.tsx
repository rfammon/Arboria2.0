/**
 * MapControls - Control panel for map layer toggle, filters, and zoom
 * Based on legacy map.ui.js controls
 */

import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Map, Satellite, ZoomIn } from 'lucide-react';
import { LocationButton } from './LocationButton';
import type { RiskFilter } from '../../lib/map/mapFilters';
import { RISK_LEVELS } from '../../lib/map/mapFilters';

interface MapControlsProps {
    currentLayer: 'osm' | 'satellite';
    onToggleLayer: () => void;
    riskFilter: RiskFilter;
    onFilterChange: (filter: RiskFilter) => void;
    onZoomAll: () => void;
    className?: string;
}

export default function MapControls({
    currentLayer,
    onToggleLayer,
    riskFilter,
    onFilterChange,
    onZoomAll,
    className
}: MapControlsProps) {
    return (
        <div className={`space-y-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className || ''}`}>
            {/* Layer Toggle */}
            <Button
                onClick={onToggleLayer}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                title={currentLayer === 'satellite' ? 'Trocar para Mapa OSM' : 'Trocar para Satélite'}
            >
                {currentLayer === 'satellite' ? (
                    <>
                        <Map className="h-4 w-4 mr-2" />
                        Mapa
                    </>
                ) : (
                    <>
                        <Satellite className="h-4 w-4 mr-2" />
                        Satélite
                    </>
                )}
            </Button>

            {/* Risk Filter */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Filtro de Risco
                </label>
                <Select value={riskFilter} onValueChange={(value) => onFilterChange(value as RiskFilter)}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {RISK_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>
                                {level}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Zoom All Button */}
            <Button
                onClick={onZoomAll}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                title="Focar todas as árvores"
            >
                <ZoomIn className="h-4 w-4 mr-2" />
                Focar Todos
            </Button>

            {/* Epic 8: Location Tracking Button */}
            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Minha Localização
                </label>
                <LocationButton className="w-full" />
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Legenda
                </p>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        <span className="text-gray-700 dark:text-gray-300">Alto Risco</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-600" />
                        <span className="text-gray-700 dark:text-gray-300">Médio Risco</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">Baixo Risco</span>
                    </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    * Tamanho = Altura da árvore (zona de queda)
                </p>
            </div>
        </div>
    );
}
