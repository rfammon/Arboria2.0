import { useMemo } from 'react';
import Map from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getTreeSymbol } from '../../../lib/map/mapSymbology';
import { satelliteStyle } from '../../../lib/map/mapStyles';

interface TreeData {
    id: string;
    especie: string;
    dap: number;
    altura: number;
    risco: string;
    latitude?: number;
    longitude?: number;
}

interface ReportMapProps {
    trees: TreeData[];
    onLoad: (map: maplibregl.Map) => void;
    id?: string;
}

export function ReportMap({ trees, onLoad, id }: ReportMapProps) {
    // Calculate bounds
    const bounds = useMemo(() => {
        const validTrees = trees.filter(t => t.latitude && t.longitude);
        if (validTrees.length === 0) return null;

        const b = new maplibregl.LngLatBounds(
            [validTrees[0].longitude!, validTrees[0].latitude!],
            [validTrees[0].longitude!, validTrees[0].latitude!]
        );

        validTrees.forEach(t => {
            b.extend([t.longitude!, t.latitude!]);
        });
        return b;
    }, [trees]);

    // GeoJSON for layers
    const geoJson = useMemo(() => {
        const features = trees
            .filter(t => t.latitude && t.longitude)
            .map(t => {
                const symbol = getTreeSymbol(t as any); // Cast because TreeData matches minimal Tree interface
                return {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'Point' as const,
                        coordinates: [t.longitude!, t.latitude!]
                    },
                    properties: {
                        id: t.id,
                        color: symbol.color,
                        radius: symbol.radius
                    }
                };
            });

        return {
            type: 'FeatureCollection' as const,
            features
        };
    }, [trees]);

    // Add source and layers on load
    const onMapLoad = (evt: any) => {
        const map = evt.target;

        // Add Source
        if (!map.getSource('trees')) {
            map.addSource('trees', {
                type: 'geojson',
                data: geoJson
            });

            // Add circle layer
            map.addLayer({
                id: 'tree-circles',
                type: 'circle',
                source: 'trees',
                paint: {
                    'circle-radius': ['get', 'radius'],
                    'circle-color': ['get', 'color'],
                    'circle-opacity': 0.8,
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 1
                }
            });
        }

        // Fit bounds with more padding and max zoom limit
        if (bounds) {
            map.fitBounds(bounds, {
                padding: 100, // Increased padding to zoom out more
                maxZoom: 18,  // Cap maximum zoom to ensure satellite tiles exist
                duration: 0
            });
        }

        // Notify parent when map is truly idle (tiles loaded)
        map.once('idle', () => {
            console.log("Map reported IDLE - ready for capture");
            onLoad(map);
        });

        // Fallback in case idle takes too long (e.g. tile error)
        setTimeout(() => {
            if (!map.loaded()) {
                console.log("Map idle timeout fallback trigger");
                onLoad(map);
            }
        }, 8000);
    };

    return (
        <div id={id} className="relative w-full h-full bg-slate-100">
            <Map
                initialViewState={{
                    longitude: -46.6333,
                    latitude: -23.5505,
                    zoom: 12
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle={satelliteStyle as any}
                onLoad={onMapLoad}
                // @ts-ignore - Valid prop for MapLibre but missing in React types
                preserveDrawingBuffer={true}
                attributionControl={false}
            />

            {/* Legend Overlay */}
            <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded text-xs shadow-md backdrop-blur-sm z-10">
                <div className="font-semibold mb-1">Legenda de Risco</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 border border-white"></span> Alto</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 border border-white"></span> Médio</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 border border-white"></span> Baixo/Nenhum</div>
            </div>
        </div>
    );
}
