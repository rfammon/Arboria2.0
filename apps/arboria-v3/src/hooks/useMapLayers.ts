/**
 * useMapLayers Hook - Manage map layer toggling (OSM ↔ Satellite)
 * Based on legacy map.ui.js toggleMapLayer functionality
 */

import { useState, useCallback } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { type LayerType } from '../lib/map/mapStyles';

interface UseMapLayersOptions {
    onToggle?: (layer: LayerType) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useMapLayers(_options?: UseMapLayersOptions) {
    const [currentLayer, setCurrentLayer] = useState<LayerType>('satellite');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const toggleLayer = useCallback((_mapRef: MapRef | null) => {
        // Just toggle state, let the component prop handle the style update
        const newLayer: LayerType = currentLayer === 'satellite' ? 'osm' : 'satellite';
        setCurrentLayer(newLayer);
    }, [currentLayer]);

    return {
        currentLayer,
        toggleLayer,
        isSatellite: currentLayer === 'satellite'
    };
}
