
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Map, { NavigationControl, Popup, Marker, type MapRef, Source, Layer, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTrees } from '../../hooks/useTrees';
import { useTreePhotos } from '../../hooks/useTreePhotos';
import { useMapLayers } from '../../hooks/useMapLayers';
import { useUserLocation } from '../../hooks/useUserLocation';
import { getTreeSymbol, MAP_RISK_COLORS } from '../../lib/map/mapSymbology';
import { satelliteStyle, osmStyle } from '../../lib/map/mapStyles';
import MapControls from './MapControls';
import type { Tree } from '../../types/tree';
import { usePresence } from '../../hooks/usePresence';
import { Badge } from '../ui/badge';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ClusteredMapComponentProps {
    selectedTreeId?: string | null;
    onSelectTree?: (id: string | null) => void;
    activeFilters?: string[];
    onToggleFilter?: (risk: string) => void;
}

// Layer Definitions (Static)
const clusterLayer: any = {
    id: 'clusters',
    type: 'circle',
    filter: ['has', 'point_count'],
    paint: {
        'circle-color': [
            'case',
            ['>=', ['/', ['get', 'sumRiskScore'], ['get', 'count']], 9], MAP_RISK_COLORS.HIGH,
            ['>=', ['/', ['get', 'sumRiskScore'], ['get', 'count']], 5], MAP_RISK_COLORS.MEDIUM,
            MAP_RISK_COLORS.LOW
        ],
        'circle-radius': [
            'step', ['get', 'point_count'],
            20, 100, 30, 750, 40
        ],
        'circle-opacity': 0.8
    }
};

const clusterCountLayer: any = {
    id: 'cluster-count',
    type: 'symbol',
    filter: ['has', 'point_count'],
    layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12
    },
    paint: {
        'text-color': '#ffffff'
    }
};

const unclusteredPointLayer: any = {
    id: 'unclustered-point',
    type: 'circle',
    filter: ['!', ['has', 'point_count']],
    paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': ['get', 'radius'],
        'circle-opacity': 0.8,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1
    }
};

const unclusteredLabelLayer: any = {
    id: 'unclustered-point-label',
    type: 'symbol',
    filter: ['!', ['has', 'point_count']],
    layout: {
        'text-field': ['get', 'species'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
        'text-radial-offset': 0.8,
        'text-justify': 'auto'
    },
    paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5
    }
};

export default function ClusteredMapComponent({ 
    selectedTreeId, 
    onSelectTree, 
    activeFilters: externalActiveFilters,
    onToggleFilter 
}: ClusteredMapComponentProps) {
    const mapRef = useRef<MapRef>(null);
    const hasInitialZoomed = useRef(false);
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
    const [highlightedTree, setHighlightedTree] = useState<Tree | null>(null);
    
    // Default to all risks if empty or undefined
    const activeFilters = useMemo(() => {
        if (!externalActiveFilters || externalActiveFilters.length === 0) {
            return ['Alto', 'Médio', 'Baixo'];
        }
        return externalActiveFilters;
    }, [externalActiveFilters]);

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const { presences } = usePresence(null);
    const occupiedTreeIds = useMemo(() => Object.keys(presences), [presences]);

    // Epic 8: User Location Tracking
    const { location: userLocation, state: locationState } = useUserLocation();

    const { data: trees } = useTrees();
    const { data: photos = [], isLoading: isPhotosLoading } = useTreePhotos(selectedTree?.id || '', { limit: 1, enabled: !!selectedTree });

    const { currentLayer, toggleLayer } = useMapLayers();

    // Prepare points for clustering with risk filter
    const points = useMemo(() => {
        if (!trees) return [];

        return trees.reduce<any[]>((acc, tree) => {
            if (!tree.latitude || !tree.longitude) return acc;

            const symbol = getTreeSymbol(tree);
            const treeRiskRaw = tree.risklevel?.toLowerCase() || '';

            // Map the string "Alto" to the actual data values (Alto, High, Crítico)
            const isMatch = activeFilters.some(filter => {
                const f = filter.toLowerCase();
                const symbolRisk = symbol.riskLevel.toLowerCase();
                
                // Direct match on normalized symbol
                if (symbolRisk.includes(f)) return true;
                
                // Explicit mapping for "Alto"
                if (f === 'alto') {
                    return treeRiskRaw.includes('alto') || 
                           treeRiskRaw.includes('high') || 
                           treeRiskRaw.includes('crítico') ||
                           treeRiskRaw.includes('critico');
                }
                
                // Mapping for "Médio"
                if (f === 'médio' || f === 'medio') {
                    return treeRiskRaw.includes('médio') || 
                           treeRiskRaw.includes('medio') || 
                           treeRiskRaw.includes('medium') ||
                           treeRiskRaw.includes('moderado');
                }

                // Mapping for "Baixo"
                if (f === 'baixo') {
                    return treeRiskRaw.includes('baixo') || 
                           treeRiskRaw.includes('low');
                }
                
                return false;
            });

            if (!isMatch) return acc;

            acc.push({
                type: 'Feature',
                properties: {
                    cluster: false,
                    id: tree.id,
                    species: tree.especie || 'Desconhecida',
                    color: symbol.color,
                    radius: symbol.radius,
                    riskLevel: symbol.riskLevel,
                    pontuacao: tree.pontuacao || 0,
                    altura: tree.altura,
                    dap: tree.dap,
                    data: tree.data,
                    isOccupied: occupiedTreeIds.includes(tree.id)
                },
                geometry: {
                    type: 'Point',
                    coordinates: [tree.longitude, tree.latitude]
                }
            });

            return acc;
        }, []);
    }, [trees, activeFilters, occupiedTreeIds]);

    // Prepare GeoJSON data
    const geoJsonData = useMemo(() => ({
        type: 'FeatureCollection' as const,
        features: points
    }), [points]);

    // Click Handlers
    const onClick = useCallback((event: MapLayerMouseEvent) => {
        const feature = event.features?.[0];
        if (!feature) return;

        const layerId = feature.layer.id;
        const map = mapRef.current?.getMap();
        if (!map) return;

        if (layerId === 'clusters') {
            const clusterId = feature.properties?.cluster_id;
            const source = map.getSource('trees') as any;

            if (source && source.getClusterExpansionZoom) {
                source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
                    if (err) return;
                    map.easeTo({
                        center: (feature.geometry as any).coordinates,
                        zoom: zoom
                    });
                });
            }
        } else if (layerId === 'unclustered-point') {
            const treeId = feature.properties?.id;
            if (treeId && trees) {
                const tree = trees.find(t => t.id === treeId);
                if (tree && tree.longitude && tree.latitude) {
                    setSelectedTree(tree);
                    map.flyTo({
                        center: [tree.longitude, tree.latitude],
                        offset: [0, -150],
                        duration: 1000
                    });
                }
            }
        }
    }, [trees, onSelectTree]);

    const onMouseEnter = useCallback(() => {
        if (mapRef.current) mapRef.current.getCanvas().style.cursor = 'pointer';
    }, []);

    const onMouseLeave = useCallback(() => {
        if (mapRef.current) mapRef.current.getCanvas().style.cursor = '';
    }, []);

    // Zoom to selected tree when selectedTreeId changes
    useEffect(() => {
        if (!selectedTreeId || !trees) return;

        const tree = trees.find(t => t.id === selectedTreeId);

        if (tree && tree.latitude && tree.longitude) {
            const map = mapRef.current?.getMap();
            if (map) {
                map.flyTo({
                    center: [tree.longitude, tree.latitude],
                    zoom: 19,
                    duration: 1500
                });
                setTimeout(() => {
                    setSelectedTree(tree);
                    setHighlightedTree(tree);
                    setTimeout(() => setHighlightedTree(null), 3000);
                }, 1600);
            }
        }
    }, [selectedTreeId, trees]);

    // Zoom to all trees logic
    const handleZoomAll = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (!map || !trees || trees.length === 0) return;

        const validTrees = trees.filter(t => t.latitude && t.longitude);
        if (validTrees.length === 0) return;

        const bounds = validTrees.reduce(
            (b, tree) => b.extend([tree.longitude!, tree.latitude!]),
            new maplibregl.LngLatBounds(
                [validTrees[0].longitude!, validTrees[0].latitude!],
                [validTrees[0].longitude!, validTrees[0].latitude!]
            )
        );

        map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 17, // Respect clusterMaxZoom
            duration: 1000
        });
    }, [trees]);

    // Added: Auto-zoom to trees on initial load
    useEffect(() => {
        if (isMapLoaded && trees && trees.length > 0 && !selectedTreeId && !hasInitialZoomed.current) {
            handleZoomAll();
            hasInitialZoomed.current = true;
        }
    }, [isMapLoaded, trees, selectedTreeId, handleZoomAll]);

    return (
        <div className="flex flex-col md:grid md:grid-cols-[1fr_320px] gap-3 w-full h-auto md:h-[calc(100vh-230px)] min-h-[600px]">
            <div className="relative w-full h-[550px] md:h-full rounded-xl overflow-hidden border border-border shadow-inner">
                <Map
                    ref={mapRef}
                    initialViewState={{
                        longitude: -46.6333,
                        latitude: -23.5505,
                        zoom: 12
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={currentLayer === 'osm' ? osmStyle as any : satelliteStyle as any}
                    onLoad={() => setIsMapLoaded(true)}
                    minZoom={3}
                    maxZoom={22}
                    interactiveLayerIds={['clusters', 'unclustered-point']}
                    onClick={onClick}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                >
                    <NavigationControl position="top-right" />

                    <Source
                        id="trees"
                        type="geojson"
                        data={geoJsonData}
                        cluster={true}
                        clusterMaxZoom={17}
                        clusterRadius={75}
                        clusterProperties={{
                            sumRiskScore: ['+', ['get', 'pontuacao']],
                            count: ['+', ['accumulated'], 1]
                        }}
                    >
                        <Layer {...clusterLayer} />
                        <Layer {...clusterCountLayer} />
                        <Layer {...unclusteredPointLayer} />
                        <Layer {...unclusteredLabelLayer} />
                    </Source>

                    {/* Epic 8: User Location Marker */}
                    {userLocation && locationState === 'active' && (
                        <>
                            <Source type="geojson" data={{
                                type: 'Feature',
                                geometry: { type: 'Point', coordinates: [userLocation.longitude, userLocation.latitude] },
                                properties: {}
                            }}>
                                <Layer id="user-location-accuracy" type="circle" paint={{
                                    'circle-radius': userLocation.accuracy,
                                    'circle-color': '#4285F4',
                                    'circle-opacity': 0.1,
                                    'circle-stroke-color': '#4285F4',
                                    'circle-stroke-width': 1,
                                    'circle-stroke-opacity': 0.3
                                }} />
                            </Source>
                            <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
                                <div className="relative flex h-6 w-6 justify-center items-center">
                                    <div className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-pulse"></div>
                                    <div className="relative inline-flex rounded-full h-4 w-4 border-3 border-white bg-blue-600 shadow-lg"></div>
                                </div>
                            </Marker>
                        </>
                    )}

                    {/* Pulse Highlight Marker (Selected) */}
                    {highlightedTree && highlightedTree.latitude && highlightedTree.longitude && (
                        <Marker longitude={highlightedTree.longitude} latitude={highlightedTree.latitude} anchor="center">
                            <span className="relative flex h-12 w-12 justify-center items-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 border-2 border-white bg-green-500 shadow-lg"></span>
                            </span>
                        </Marker>
                    )}

                    {/* Occupied Pulse indicators for all active trees */}
                    {trees && trees.filter(t => occupiedTreeIds.includes(t.id)).map(tree => (
                        <Marker
                            key={`occupied-${tree.id}`}
                            longitude={tree.longitude!}
                            latitude={tree.latitude!}
                            anchor="center"
                        >
                            <span className="relative flex h-8 w-8 justify-center items-center opacity-60">
                                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-40"></span>
                            </span>
                        </Marker>
                    ))}

                    {selectedTree && selectedTree.latitude && selectedTree.longitude && (
                        <Popup
                            longitude={selectedTree.longitude}
                            latitude={selectedTree.latitude}
                            onClose={() => {
                                setSelectedTree(null);
                            }}
                            closeButton={false}
                            closeOnClick={false}
                            maxWidth="300px"
                            focusAfterOpen={false}
                            className="p-0 bg-transparent border-none shadow-none"
                        >
                            <div className="bg-card/90 backdrop-blur-xl text-card-foreground rounded-2xl overflow-hidden shadow-xl border border-border min-w-[260px] group animate-in fade-in zoom-in duration-300">
                                <div className="relative h-32 w-full overflow-hidden">
                                    {isPhotosLoading ? (
                                        <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                        </div>
                                    ) : photos.length > 0 ? (
                                        <img 
                                            src={photos[0].signedUrl} 
                                            alt="Tree" 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        />
                                    ) : (
                                        <div className={cn(
                                            "w-full h-full bg-gradient-to-br transition-all duration-500",
                                            selectedTree.pontuacao && selectedTree.pontuacao >= 9 ? "from-red-600/40 to-red-900/60" :
                                            selectedTree.pontuacao && selectedTree.pontuacao >= 5 ? "from-orange-600/40 to-orange-900/60" :
                                            "from-green-600/40 to-green-900/60"
                                        )} />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                                    
                                    <Badge 
                                        className={cn(
                                            "absolute top-3 left-3 font-bold backdrop-blur-md border-0 shadow-lg",
                                            selectedTree.pontuacao && selectedTree.pontuacao >= 9 ? "bg-red-500/80 text-white" :
                                            selectedTree.pontuacao && selectedTree.pontuacao >= 5 ? "bg-orange-500/80 text-white" :
                                            "bg-green-500/80 text-white"
                                        )}
                                    >
                                        {selectedTree.pontuacao && selectedTree.pontuacao >= 9 ? 'Alto' : 
                                         selectedTree.pontuacao && selectedTree.pontuacao >= 5 ? 'Médio' : 'Baixo'}
                                    </Badge>

                                    <button 
                                        onClick={() => {
                                            setSelectedTree(null);
                                        }}
                                        className="absolute top-3 right-3 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors backdrop-blur-sm z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight tracking-tight">
                                            {selectedTree.especie || 'Espécie Desconhecida'}
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground font-mono mt-1 flex items-center gap-1">
                                            <span className="opacity-50">ID:</span> {selectedTree.id.slice(0, 8)}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-border/50">
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Altura</p>
                                            <p className="text-sm font-semibold">{selectedTree.altura ? `${selectedTree.altura}m` : 'N/A'}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">DAP</p>
                                            <p className="text-sm font-semibold">{selectedTree.dap ? `${selectedTree.dap}cm` : 'N/A'}</p>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => {
                                            if (onSelectTree) onSelectTree(selectedTree.id);
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-all rounded-xl h-10 group/btn shadow-md"
                                    >
                                        <span className="font-bold">Ver Detalhes</span>
                                        <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                                    </Button>
                                </div>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>

            <div className="w-full md:h-full">
                <MapControls
                    currentLayer={currentLayer}
                    onToggleLayer={() => toggleLayer(mapRef.current)}
                    activeFilters={activeFilters}
                    onToggleFilter={onToggleFilter || (() => {})}
                    onZoomAll={handleZoomAll}
                    className="w-full h-auto md:h-full"
                />
            </div>
        </div>
    );
}