const https = require('https');
const http = require('http');

/**
 * Calculate bounds from GeoJSON tree data
 */
function calculateBounds(trees) {
    if (!trees || trees.length === 0) {
        return { center: [0, 0], bounds: [-180, -85, 180, 85] };
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

    // Calculate center
    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Add 10% padding to bounds
    const lngPadding = (maxLng - minLng) * 0.1;
    const latPadding = (maxLat - minLat) * 0.1;

    return {
        center: [centerLng, centerLat],
        bounds: [
            minLng - lngPadding,
            minLat - latPadding,
            maxLng + lngPadding,
            maxLat + latPadding
        ]
    };
}

/**
 * Calculate appropriate zoom level based on bounds
 */
function calculateZoom(bounds, width, height) {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 18;

    function latRad(lat) {
        const sin = Math.sin(lat * Math.PI / 180);
        const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const [west, south, east, north] = bounds;

    const latFraction = (latRad(north) - latRad(south)) / Math.PI;
    const lngDiff = east - west;
    const lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

    const latZoom = zoom(height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

/**
 * Fetch image from URL and return as buffer
 */
function fetchImage(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;

        protocol.get(url, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Build marker parameters for trees
 */
function buildMarkers(trees) {
    // Group trees by risk level
    const riskColors = {
        'Alto': 'red',
        'Médio': 'orange',
        'Baixo': 'green'
    };

    const markers = [];

    trees.forEach(tree => {
        if (tree.longitude && tree.latitude) {
            const risco = tree.risco || 'Baixo';
            const color = riskColors[risco] || 'gray';
            markers.push({
                lonlat: `${tree.longitude},${tree.latitude}`,
                color: color,
                size: 'small'
            });
        }
    });

    return markers;
}

/**
 * Render map using OSM Static Map service
 * Uses staticmap.openstreetmap.de which is free and requires no API key
 */
async function renderMapImage(trees, options = {}) {
    const {
        width = 800,
        height = 400
    } = options;

    try {
        const { center, bounds } = calculateBounds(trees);
        const zoom = calculateZoom(bounds, width, height);

        // Build markers
        const markers = buildMarkers(trees);

        // Build URL for staticmap.openstreetmap.de
        // Format: http://staticmap.openstreetmap.de/staticmap.php?center=LAT,LON&zoom=ZOOM&size=WIDTHxHEIGHT&markers=LAT,LON,COLOR,SIZE
        const baseUrl = 'http://staticmap.openstreetmap.de/staticmap.php';
        const params = new URLSearchParams({
            center: `${center[1]},${center[0]}`, // lat,lon
            zoom: Math.max(zoom - 1, 1), // Slightly zoomed out for better context
            size: `${width}x${height}`,
            maptype: 'mapnik'
        });

        // Add markers
        markers.forEach((marker, index) => {
            const [lon, lat] = marker.lonlat.split(',');
            params.append('markers', `${lat},${lon},ol-marker-${marker.color}`);
        });

        const url = `${baseUrl}?${params.toString()}`;
        console.log('[MapRenderer] Fetching static map from:', url.substring(0, 100) + '...');

        const imageBuffer = await fetchImage(url);
        console.log('[MapRenderer] Successfully fetched map image, size:', imageBuffer.length, 'bytes');

        return imageBuffer;

    } catch (error) {
        console.error('[MapRenderer] Error generating map:', error.message);
        throw error;
    }
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
    calculateBounds
};
