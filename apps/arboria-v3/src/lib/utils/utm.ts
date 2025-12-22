/**
 * UTM Coordinate Conversion Utilities
 * Converts Lat/Lon to UTM using Proj4
 */

import proj4 from 'proj4';

export interface UTMCoordinates {
    easting: number;
    northing: number;
    zoneNum: number;
    zoneLetter: string;
}

/**
 * Converts latitude/longitude to UTM coordinates
 * @param lat Latitude in decimal degrees
 * @param lon Longitude in decimal degrees
 * @returns UTM coordinates or null if conversion fails
 */
export function latLonToUTM(lat: number, lon: number): UTMCoordinates | null {
    // Validation
    if (isNaN(lat) || isNaN(lon)) {
        console.error('Invalid coordinates:', { lat, lon });
        return null;
    }

    try {
        // Calculate UTM zone
        const zoneNum = Math.floor((lon + 180) / 6) + 1;
        const hemisphereParam = lat < 0 ? '+south' : '';

        // Define projections
        const wgs84 = 'EPSG:4326';
        const utmDef = `+proj=utm +zone=${zoneNum} ${hemisphereParam} +datum=WGS84 +units=m +no_defs`;

        // Convert
        const [easting, northing] = proj4(wgs84, utmDef, [lon, lat]);

        // Get zone letter (simplified for Brazil, compatible with original)
        const zoneLetter = getZoneLetter(lat);

        return {
            easting: Math.round(easting),
            northing: Math.round(northing),
            zoneNum,
            zoneLetter
        };
    } catch (error) {
        console.error('UTM conversion error:', error);
        return null;
    }
}

/**
 * Gets the UTM zone letter based on latitude
 * Simplified version compatible with original system
 */
function getZoneLetter(lat: number): string {
    if (lat < -32) return 'H'; // Far South
    if (lat < 0) return 'K';   // Central/South Brazil
    if (lat >= 0) return 'M';  // North of Equator
    return 'N'; // Default
}

/**
 * Formats UTM coordinates as a readable string
 */
export function formatUTM(utm: UTMCoordinates): string {
    return `${utm.zoneNum}${utm.zoneLetter} ${utm.easting}E ${utm.northing}N`;
}

/**
 * Validates if coordinates are within reasonable bounds
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
