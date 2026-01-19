const mbgl = require('@maplibre/maplibre-gl-native');
const sharp = require('sharp');

/**
 * Calculate bounds from GeoJSON tree data
 */
function calculateBounds(trees) {
    if (!trees || trees.length === 0) {
        // Default bounds (fallback)
        return [-180, -85, 180, 85];
    }

    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    trees.forEach(tree => {
        if (tree.longitude && tree.latitude) {
            minLng = Math.min(minLng, tree.longitude);
            minLat = Math.min(minLat, tree.latitude);
            maxLng = Math.max(maxLng, tree.longitude);
            maxLat = Math.max(maxLat, tree.latitude);
        }
    });

    // Add 10% padding
    const lngPadding = (maxLng - minLng) * 0.1;
    const latPadding = (maxLat - minLat) * 0.1;

    return [
        minLng - lngPadding,
        minLat - latPadding,
        maxLng + lngPadding,
        maxLat + latPadding
    ];
}

/**
 * Create MapLibre style with tree markers
 */
function createMapStyle(trees) {
    const geojsonFeatures = trees
        .filter(tree => tree.longitude && tree.latitude)
        .map(tree => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [tree.longitude, tree.latitude]
            },
            properties: {
                risco: tree.risco || 'Baixo'
            }
        }));

    // Risk color mapping
    const riskColors = {
        'Alto': '#ef4444',
        'Médio': '#f59e0b',
        'Baixo': '#22c55e'
    };

    return {
        version: 8,
        sources: {
            'osm': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
            },
            'trees': {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: geojsonFeatures
                }
            }
        },
        layers: [
            {
                id: 'osm-tiles',
                type: 'raster',
                source: 'osm',
                minzoom: 0,
                maxzoom: 22
            },
            {
                id: 'tree-circles',
                type: 'circle',
                source: 'trees',
                paint: {
                    'circle-radius': 8,
                    'circle-color': [
                        'match',
                        ['get', 'risco'],
                        'Alto', riskColors['Alto'],
                        'Médio', riskColors['Médio'],
                        'Baixo', riskColors['Baixo'],
                        '#999999'
                    ],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            }
        ]
    };
}

/**
 * Render map to PNG buffer using MapLibre GL Native
 * @param {Array} trees - Array of tree objects with latitude/longitude
 * @param {Object} options - Rendering options
 * @returns {Promise<Buffer>} - PNG image buffer
 */
async function renderMapImage(trees, options = {}) {
    const {
        width = 800,
        height = 600,
        pixelRatio = 2
    } = options;

    return new Promise((resolve, reject) => {
        try {
            // Calculate bounds
            const bounds = calculateBounds(trees);

            // Create map style
            const style = createMapStyle(trees);

            // Create map options
            const mapOptions = {
                request: (req, callback) => {
                    // Simple tile fetcher
                    const https = require('https');
                    const http = require('http');

                    const protocol = req.url.startsWith('https') ? https : http;

                    protocol.get(req.url, (res) => {
                        const data = [];
                        res.on('data', chunk => data.push(chunk));
                        res.on('end', () => {
                            callback(null, {
                                data: Buffer.concat(data)
                            });
                        });
                    }).on('error', (err) => {
                        callback(err);
                    });
                },
                ratio: pixelRatio
            };

            // Create map instance
            const map = new mbgl.Map(mapOptions);
            map.load(style);

            // Fit bounds
            map.fitBounds(bounds, {
                padding: 50
            });

            // Render static image
            map.renderStill({
                width,
                height,
                zoom: 15
            }, (err, buffer) => {
                if (err) {
                    console.error('MapLibre rendering error:', err);
                    reject(err);
                    return;
                }

                // Release map resources
                map.release();

                resolve(buffer);
            });

        } catch (err) {
            console.error('Error creating map:', err);
            reject(err);
        }
    });
}

/**
 * Render map and return as Base64 data URL
 */
async function renderMapAsDataUrl(trees, options = {}) {
    try {
        const buffer = await renderMapImage(trees, options);
        const base64 = buffer.toString('base64');
        return `data:image/png;base64,${base64}`;
    } catch (err) {
        console.error('Failed to render map as data URL:', err);
        throw err;
    }
}

module.exports = {
    renderMapImage,
    renderMapAsDataUrl,
    calculateBounds,
    createMapStyle
};
