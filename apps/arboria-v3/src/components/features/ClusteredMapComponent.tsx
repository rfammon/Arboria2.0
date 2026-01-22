
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Map, { NavigationControl, Popup, Marker, type MapRef, Source, Layer, type MapLayerMouseEvent } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import { useTrees } from '../../hooks/useTrees';
import { useTreePhotos } from '../../hooks/useTreePhotos';
import { useMapLayers } from '../../hooks/useMapLayers';
import { useUserLocation } from '../../hooks/useUserLocation';
import { getTreeSymbol, MAP_RISK_COLORS } from '../../lib/map/mapSymbology';
import { type RiskFilter } from '../../lib/map/mapFilters';
import { satelliteStyle, osmStyle } from '../../lib/map/mapStyles';
import MapControls from './MapControls';
import type { Tree } from '../../types/tree';
import { usePresence } from '../../hooks/usePresence';

interface ClusteredMapComponentProps {
    selectedTreeId?: string | null;
    onSelectTree?: (id: string | null) => void;
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

export default function ClusteredMapComponent({ selectedTreeId, onSelectTree }: ClusteredMapComponentProps) {
    const mapRef = useRef<MapRef>(null);
    const navigate = useNavigate();
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
    const [highlightedTree, setHighlightedTree] = useState<Tree | null>(null);
    const [riskFilter, setRiskFilter] = useState<RiskFilter>('Todos');
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const { presences } = usePresence(null);
    const occupiedTreeIds = useMemo(() => Object.keys(presences), [presences]);

    // Epic 8: User Location Tracking
    const { location: userLocation, state: locationState } = useUserLocation();

    const { data: trees } = useTrees();
    const { data: photos = [] } = useTreePhotos(selectedTree?.id || '', { limit: 1, enabled: !!selectedTree });

    const { currentLayer, toggleLayer } = useMapLayers();

    // Prepare points for clustering with risk filter
    const points = useMemo(() => {
        if (!trees) return [];

        return trees.reduce<any[]>((acc, tree) => {
            if (!tree.latitude || !tree.longitude) return acc;

            const symbol = getTreeSymbol(tree);

            // Apply risk filter
            if (riskFilter !== 'Todos' && symbol.riskLevel !== riskFilter) {
                return acc;
            }

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
    }, [trees, riskFilter, occupiedTreeIds]);

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
                if (tree) {
                    setSelectedTree(tree);
                    if (onSelectTree) onSelectTree(tree.id);
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
        if (isMapLoaded && trees && trees.length > 0 && !selectedTreeId) {
            handleZoomAll();
        }
    }, [isMapLoaded, trees, selectedTreeId, handleZoomAll]);

    return (
        <div className="flex flex-col md:grid md:grid-cols-[1fr_300px] gap-4 w-full h-auto md:h-[600px]">
            <div className="relative w-full h-[450px] md:h-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
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
                            anchor="top"
                            onClose={() => {
                                setSelectedTree(null);
                                if (onSelectTree) onSelectTree(null);
                            }}
                            closeButton={true}
                            closeOnClick={false}
                        >
                            <div className="p-2 min-w-[200px] max-w-[280px]">
                                {photos.length > 0 && (
                                    <button
                                        onClick={() => navigate(`/inventory/${selectedTree.id}`)}
                                        className="w-full mb-3 rounded overflow-hidden hover:opacity-80 transition-opacity border-2 border-transparent hover:border-green-500"
                                    >
                                        <img src={photos[0].signedUrl} alt="Tree photo" className="w-full h-20 object-cover" />
                                    </button>
                                )}
                                <div className="font-semibold text-sm text-gray-900 mb-1">{selectedTree.especie || 'Espécie Desconhecida'}</div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div><strong>ID:</strong> {selectedTree.id.slice(0, 8)}...</div>
                                    {selectedTree.altura && <div><strong>Altura:</strong> {selectedTree.altura}m</div>}
                                    {selectedTree.dap && <div><strong>DAP:</strong> {selectedTree.dap}cm</div>}
                                    {selectedTree.pontuacao !== undefined && <div><strong>Pontuação TRAQ:</strong> {selectedTree.pontuacao}</div>}
                                </div>
                                <button
                                    onClick={() => navigate(`/inventory/${selectedTree.id}`)}
                                    className="mt-3 w-full text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded transition-colors"
                                >
                                    Ver Detalhes →
                                </button>
                            </div>
                        </Popup>
                    )}
                </Map>
            </div>

            <div className="w-full md:h-full">
                <MapControls
                    currentLayer={currentLayer}
                    onToggleLayer={() => toggleLayer(mapRef.current)}
                    riskFilter={riskFilter}
                    onFilterChange={setRiskFilter}
                    onZoomAll={handleZoomAll}
                    className="w-full h-auto md:h-full"
                />
            </div>
        </div>
    );
}