import proj4 from 'proj4';

/**
 * Coordinate Conversion Utilities
 * Converts between UTM and Lat/Lon coordinate systems
 * Based on legacy ArborIA coordinate service
 */

const DEFAULT_UTM_ZONE = 23; // São Paulo, Brasil
const DEFAULT_UTM_LETTER = 'K'; // Hemisfério Sul

/**
 * Validates UTM coordinates
 */
export function isValidUTM(easting: number, northing: number, zoneNum: number): boolean {
    // Easting: 166,000 to 834,000 meters (for most zones)
    if (easting < 100000 || easting > 900000) {
        return false;
    }

    // Northing: 0 to 10,000,000 meters
    if (northing < 0 || northing > 10000000) {
        return false;
    }

    // Zone: 1 to 60
    if (zoneNum < 1 || zoneNum > 60) {
        return false;
    }

    return true;
}

/**
 * Lista de zonas UTM disponíveis (para Brasil: 18-25)
 */
export const UTM_ZONES_BRAZIL = [
    { num: 18, label: '18' },
    { num: 19, label: '19' },
    { num: 20, label: '20' },
    { num: 21, label: '21' },
    { num: 22, label: '22' },
    { num: 23, label: '23' },
    { num: 24, label: '24' },
    { num: 25, label: '25' }
];

/**
 * Letras de zona UTM comuns no Brasil
 */
export const UTM_ZONE_LETTERS = ['K', 'L', 'M', 'H'];

export interface UTMCoordinates {
    easting: number;
    northing: number;
    utmZoneNum: number;
    utmZoneLetter: string;
}

export interface LatLonCoordinates {
    latitude: number;
    longitude: number;
}

/**
 * Convert UTM coordinates to Latitude/Longitude
 * @param easting - UTM Easting coordinate
 * @param northing - UTM Northing coordinate
 * @param zoneNum - UTM zone number (1-60)
 * @param zoneLetter - UTM zone letter (C-X, excluding I and O)
 * @returns Lat/Lon coordinates or null if conversion fails
 */
export function utmToLatLon(
    easting: number,
    northing: number,
    zoneNum: number = DEFAULT_UTM_ZONE,
    zoneLetter: string = DEFAULT_UTM_LETTER
): LatLonCoordinates | null {
    try {
        const zone = parseInt(zoneNum.toString(), 10);
        const letter = zoneLetter.toUpperCase();

        // Determine hemisphere based on zone letter
        // Letters N-X are northern hemisphere, C-M are southern hemisphere
        const hemisphere = letter >= 'N' ? '+north' : '+south';

        // Define projections
        const utmProj = `+proj=utm +zone=${zone} ${hemisphere} +datum=WGS84 +units=m +no_defs`;
        const wgs84Proj = 'EPSG:4326';

        // Convert
        const [longitude, latitude] = proj4(utmProj, wgs84Proj, [easting, northing]);

        return {
            latitude: parseFloat(latitude.toFixed(7)),
            longitude: parseFloat(longitude.toFixed(7)),
        };
    } catch (error) {
        console.error('[CoordinateUtils] Error converting UTM to Lat/Lon:', error);
        return null;
    }
}

/**
 * Convert Latitude/Longitude to UTM coordinates
 * @param latitude - Latitude (-90 to 90)
 * @param longitude - Longitude (-180 to 180)
 * @returns UTM coordinates or null if conversion fails
 */
export function latLonToUTM(
    latitude: number,
    longitude: number
): UTMCoordinates | null {
    try {
        // Calculate UTM zone based on longitude
        const zoneNum = Math.floor((longitude + 180) / 6) + 1;

        // Determine hemisphere
        const zoneLetter = latitude >= 0 ? 'N' : 'K';
        const hemisphere = latitude >= 0 ? '+north' : '+south';

        // Define projections
        const utmProj = `+proj=utm +zone=${zoneNum} ${hemisphere} +datum=WGS84 +units=m +no_defs`;
        const wgs84Proj = 'EPSG:4326';

        // Convert
        const [easting, northing] = proj4(wgs84Proj, utmProj, [longitude, latitude]);

        return {
            easting: parseFloat(easting.toFixed(2)),
            northing: parseFloat(northing.toFixed(2)),
            utmZoneNum: zoneNum,
            utmZoneLetter: zoneLetter,
        };
    } catch (error) {
        console.error('[CoordinateUtils] Error converting Lat/Lon to UTM:', error);
        return null;
    }
}

/**
 * Check if coordinates are valid
 */
export function hasValidCoordinates(easting?: number | null, northing?: number | null): boolean {
    return !!(easting && northing && easting !== 0 && northing !== 0);
}

/**
 * Gets the UTM zone letter based on latitude
 * Simplified version compatible with original system
 */
export function getZoneLetter(lat: number): string {
    if (lat < -32) return 'H'; // Far South
    if (lat < 0) return 'K';   // Central/South Brazil
    if (lat >= 0) return 'M';  // North of Equator
    return 'N'; // Default
}

/**
 * Formats UTM coordinates as a readable string
 */
export function formatUTM(utm: UTMCoordinates): string {
    return `${utm.utmZoneNum}${utm.utmZoneLetter} ${utm.easting}E ${utm.northing}N`;
}

/**
 * Validates if coordinates are within reasonable bounds
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
