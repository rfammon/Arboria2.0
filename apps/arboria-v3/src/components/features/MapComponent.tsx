/**
 * MapComponent - Enhanced map with satellite layer, filters, and advanced symbology
 * Migrated from legacy map.ui.js with GeoJSON performance pattern
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Map, { NavigationControl, Popup, Marker, type MapRef, Source, Layer } from 'react-map-gl/maplibre';
import type { MapLayerMouseEvent } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import { useTrees } from '../../hooks/useTrees';
import { useTreePhotos } from '../../hooks/useTreePhotos';
import { useMapLayers } from '../../hooks/useMapLayers';
import { useUserLocation } from '../../hooks/useUserLocation';
import { getTreeSymbol } from '../../lib/map/mapSymbology';
import { satelliteStyle } from '../../lib/map/mapStyles';
import MapControls from './MapControls';
import type { Tree } from '../../types/tree';
import { logger } from '../../lib/logger';

interface MapComponentProps {
    selectedTreeId?: string | null;
}

export default function MapComponent({ selectedTreeId }: MapComponentProps) {
    const mapRef = useRef<MapRef>(null);
    const navigate = useNavigate();
    const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
    const [highlightedTree, setHighlightedTree] = useState<Tree | null>(null);
    const [activeFilters, setActiveFilters] = useState<string[]>(['Alto', 'Médio', 'Baixo']);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const toggleFilter = (filter: string) => {
        setActiveFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter) 
                : [...prev, filter]
        );
    };

    // Epic 8: User Location Tracking
    const { location: userLocation, state: locationState, resetAutoDisableTimer } = useUserLocation();

    const { data: trees } = useTrees();
    const { data: photos = [] } = useTreePhotos(selectedTree?.id || '', { limit: 1, enabled: !!selectedTree });
    const { currentLayer, toggleLayer } = useMapLayers();

    // Zoom to selected tree when selectedTreeId changes
    useEffect(() => {
        if (!selectedTreeId || !trees || !isMapLoaded) return;

        const tree = trees.find(t => t.id === selectedTreeId);

        if (tree && tree.latitude && tree.longitude) {
            const map = mapRef.current?.getMap();

            if (map) {
                map.flyTo({
                    center: [tree.longitude!, tree.latitude!],
                    zoom: 18,
                    duration: 1500
                });

                const timer = setTimeout(() => {
                    setSelectedTree(tree);
                    setHighlightedTree(tree);
                    const highlightTimer = setTimeout(() => setHighlightedTree(null), 3000);
                    return () => clearTimeout(highlightTimer);
                }, 1600);

                return () => clearTimeout(timer);
            }
        }
    }, [selectedTreeId, trees, isMapLoaded]);

    // Create stable tree IDs for deep equality check (only recalculate when tree IDs or timestamps change)
    const treeIds = useMemo(() => 
        trees?.map(t => `${t.id}-${t.updated_at}`).sort().join(',') || '', 
        [trees]
    );

    // Create GeoJSON FeatureCollection from trees (memoized to prevent unnecessary recalculations)
    const geojsonData = useMemo(() => {
        if (!trees) return null;

        logger.debug({ module: 'MapComponent', action: 'createGeoJSON' }, 
            `Creating GeoJSON from ${trees.length} trees`);

        const features = trees
            .filter(tree => {
                if (!tree.latitude || !tree.longitude) return false;

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

                return isMatch;
            })
            .map(tree => {
                const symbol = getTreeSymbol(tree);

                return {
                    type: 'Feature' as const,
                    geometry: {
                        type: 'Point' as const,
                        coordinates: [tree.longitude!, tree.latitude!]
                    },
                    properties: {
                        id: tree.id,
                        species: tree.especie || 'Desconhecida',
                        color: symbol.color,
                        radius: symbol.radius,
                        riskLevel: symbol.riskLevel,
                        altura: tree.altura,
                        pontuacao: tree.pontuacao,
                        dap: tree.dap,
                        data: tree.data
                    }
                };
            });

        return {
            type: 'FeatureCollection' as const,
            features
        };
    }, [treeIds, activeFilters]); // Recalculates when tree IDs/timestamps OR filters change

    // Render or update markers on map
    const renderMarkers = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (!map || !isMapLoaded || !geojsonData) return;

        // Update or create source
        const source = map.getSource('trees');
        if (source && source.type === 'geojson') {
            (source as any).setData(geojsonData);
        } else {
            map.addSource('trees', {
                type: 'geojson',
                data: geojsonData
            });

            // Add circle layer
            map.addLayer({
                id: 'tree-circles',
                type: 'circle',
                source: 'trees',
                paint: {
                    'circle-radius': ['get', 'radius'],
                    'circle-color': ['get', 'color'],
                    'circle-opacity': 0.6,
                    'circle-stroke-color': ['get', 'color'],
                    'circle-stroke-width': 2
                }
            });

            // Add label layer
            map.addLayer({
                id: 'tree-labels',
                type: 'symbol',
                source: 'trees',
                layout: {
                    'text-field': ['get', 'species'],
                    'text-size': 12,
                    'text-anchor': 'top',
                    'text-offset': [0, 1.2]
                },
                paint: {
                    'text-color': '#000000',
                    'text-halo-color': '#ffffff',
                    'text-halo-width': 2,
                    'text-opacity': 0.9
                }
            });

            // Add click handler
            map.on('click', 'tree-circles', handleMarkerClick);

            // Change cursor on hover
            map.on('mouseenter', 'tree-circles', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'tree-circles', () => {
                map.getCanvas().style.cursor = '';
            });

            // Epic 8: Reset auto-disable timer on map interaction
            map.on('move', resetAutoDisableTimer);
            map.on('zoom', resetAutoDisableTimer);
            map.on('click', resetAutoDisableTimer);
        }
    }, [geojsonData, isMapLoaded, resetAutoDisableTimer]);

    // Handle marker click
    const handleMarkerClick = useCallback((e: MapLayerMouseEvent) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const treeId = feature.properties?.id;

        if (treeId && trees) {
            const tree = trees.find(t => t.id === treeId);
            if (tree) {
                setSelectedTree(tree);
            }
        }
    }, [trees]);

    // Render markers when trees change
    useEffect(() => {
        if (isMapLoaded) {
            renderMarkers();
        }
    }, [trees, isMapLoaded, renderMarkers, currentLayer, activeFilters]);

    // Zoom to all trees
    const handleZoomAll = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (!map || !trees || trees.length === 0) return;

        const validTrees = trees.filter(t => t.latitude && t.longitude);
        if (validTrees.length === 0) return;

        const bounds = validTrees.reduce(
            (bounds, tree) => {
                if (tree.latitude && tree.longitude) {
                    logger.debug({ module: 'MapComponent', action: 'fitBounds' }, 
                        `Extending bounds with: lat=${tree.latitude}, lng=${tree.longitude}`);
                    bounds.extend([tree.longitude!, tree.latitude!]);
                }
                return bounds;
            },
            new maplibregl.LngLatBounds(
                [validTrees[0].longitude!, validTrees[0].latitude!],
                [validTrees[0].longitude!, validTrees[0].latitude!]
            )
        );

        map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 18,
            duration: 1000
        });
    }, [trees]);

    return (
        <div className="flex flex-col md:flex-row gap-4 w-full h-[800px] md:h-[600px]">
            <div className="relative flex-1 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 h-full order-1 md:order-1">
                <Map
                    ref={mapRef}
                    initialViewState={{
                        longitude: -46.6333,
                        latitude: -23.5505,
                        zoom: 12
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle={satelliteStyle as any}
                    onLoad={() => {
                        setIsMapLoaded(true);
                        renderMarkers();
                    }}
                >
                    <NavigationControl position="top-right" />

                    {/* Epic 8: User Location Marker */}
                    {userLocation && locationState === 'active' && (
                        <>
                            {/* Accuracy Circle */}
                            <Source
                                type="geojson"
                                data={{
                                    type: 'Feature',
                                    geometry: {
                                        type: 'Point',
                                        coordinates: [userLocation.longitude, userLocation.latitude]
                                    },
                                    properties: {}
                                }}
                            >
                                <Layer
                                    id="user-location-accuracy"
                                    type="circle"
                                    paint={{
                                        'circle-radius': userLocation.accuracy,
                                        'circle-color': '#4285F4',
                                        'circle-opacity': 0.1,
                                        'circle-stroke-color': '#4285F4',
                                        'circle-stroke-width': 1,
                                        'circle-stroke-opacity': 0.3
                                    }}
                                />
                            </Source>

                            {/* User Location Blue Dot */}
                            <Marker
                                longitude={userLocation.longitude}
                                latitude={userLocation.latitude}
                                anchor="center"
                            >
                                <div className="relative flex h-6 w-6 justify-center items-center">
                                    <div className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-pulse"></div>
                                    <div className="relative inline-flex rounded-full h-4 w-4 border-3 border-white bg-blue-600 shadow-lg"></div>
                                </div>
                            </Marker>
                        </>
                    )}

                    {/* Pulse Highlight Marker - Story 2.2 */}
                    {highlightedTree && highlightedTree.latitude && highlightedTree.longitude && (
                        <Marker
                            longitude={highlightedTree.longitude}
                            latitude={highlightedTree.latitude}
                            anchor="center"
                        >
                            <span className="relative flex h-12 w-12 justify-center items-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 border-2 border-white bg-green-500 shadow-lg"></span>
                            </span>
                        </Marker>
                    )}

                    {selectedTree && selectedTree.latitude && selectedTree.longitude && (
                        <Popup
                            longitude={selectedTree.longitude}
                            latitude={selectedTree.latitude}
                            anchor="top"
                            onClose={() => setSelectedTree(null)}
                            closeButton={true}
                            closeOnClick={false}
                        >
                            <div className="p-2 min-w-[200px] max-w-[280px]">
                                {/* Photo Thumbnail - Story 1.4 AC5 */}
                                {photos.length > 0 && (
                                    <button
                                        onClick={() => navigate(`/inventory/${selectedTree.id}`)}
                                        className="w-full mb-3 rounded overflow-hidden hover:opacity-80 transition-opacity border-2 border-transparent hover:border-green-500"
                                        title="Click to view full details"
                                    >
                                        <img
                                            src={photos[0].signedUrl}
                                            alt="Tree photo"
                                            className="w-full h-20 object-cover"
                                        />
                                    </button>
                                )}

                                <div className="font-semibold text-sm text-gray-900 mb-1">
                                    {selectedTree.especie || 'Espécie Desconhecida'}
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div>
                                        <strong>ID:</strong> {selectedTree.id.slice(0, 8)}...
                                    </div>
                                    {selectedTree.altura && (
                                        <div>
                                            <strong>Altura:</strong> {selectedTree.altura}m
                                        </div>
                                    )}
                                    {selectedTree.dap && (
                                        <div>
                                            <strong>DAP:</strong> {selectedTree.dap}cm
                                        </div>
                                    )}
                                    {selectedTree.pontuacao !== undefined && (
                                        <div>
                                            <strong>Pontuação TRAQ:</strong> {selectedTree.pontuacao}
                                        </div>
                                    )}
                                </div>

                                {/* View Details Button */}
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

            <div className="w-full md:w-64 shrink-0 order-2 md:order-2">
                <MapControls
                    currentLayer={currentLayer}
                    onToggleLayer={() => toggleLayer(mapRef.current)}
                    activeFilters={activeFilters}
                    onToggleFilter={toggleFilter}
                    onZoomAll={handleZoomAll}
                    className="h-full"
                />
            </div>
        </div>
    );
}
