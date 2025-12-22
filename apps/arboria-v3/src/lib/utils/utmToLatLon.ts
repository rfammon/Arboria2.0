/**
 * UTM to Lat/Lon Conversion Utilities
 * Reverse conversion from UTM coordinates to Latitude/Longitude
 */

import proj4 from 'proj4';

export interface UTMInput {
    easting: number;
    northing: number;
    zoneNum: number;
    zoneLetter: string;
}

/**
 * Converts UTM coordinates to Latitude/Longitude
 * @param utm UTM coordinates with zone information
 * @returns {lat, lon} or null if conversion fails
 */
export function utmToLatLon(utm: UTMInput): { latitude: number; longitude: number } | null {
    try {
        // Determine hemisphere from zone letter
        const isNorthHemisphere = utm.zoneLetter >= 'N';
        const hemisphereParam = isNorthHemisphere ? '' : '+south';

        // Define projections
        const wgs84 = 'EPSG:4326';
        const utmDef = `+proj=utm +zone=${utm.zoneNum} ${hemisphereParam} +datum=WGS84 +units=m +no_defs`;

        // Convert UTM to Lat/Lon
        const [longitude, latitude] = proj4(utmDef, wgs84, [utm.easting, utm.northing]);

        return { latitude, longitude };
    } catch (error) {
        console.error('UTM to Lat/Lon conversion error:', error);
        return null;
    }
}

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
