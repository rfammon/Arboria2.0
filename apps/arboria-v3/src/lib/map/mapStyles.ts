/**
 * Map Styles - OSM and Satellite Layer Definitions
 * Based on legacy map.ui.js implementation
 */

export const osmStyle = {
    version: 8,
    sources: {
        'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
        }
    },
    layers: [{
        id: 'osm-layer',
        type: 'raster',
        source: 'osm',
        minzoom: 0,
        maxzoom: 19
    }]
};

// Also make satellite point to OSM for now to guarantee loading ("Clean Slate")
// We can switch back to Satellite later if needed, but priority is WORKING MAP.
export const satelliteStyle = {
    version: 8,
    sources: {
        'satellite': {
            type: 'raster',
            tiles: [
                'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
            ],
            tileSize: 256,
            attribution: '© Google'
        }
    },
    layers: [{
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite',
        minzoom: 0,
        maxzoom: 22
    }]
};

export type LayerType = 'osm' | 'satellite';
