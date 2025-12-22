/**
 * Coordinate Validation Utilities
 * Validates and sanitizes geographic coordinates for map display
 */

export interface CoordinateValidationResult {
    isValid: boolean;
    latitude?: number;
    longitude?: number;
    errors: string[];
}

/**
 * Validates latitude and longitude values
 * Latitude must be between -90 and 90
 * Longitude must be between -180 and 180
 */
export function validateLatLon(
    latitude: number | null | undefined,
    longitude: number | null | undefined
): CoordinateValidationResult {
    const errors: string[] = [];

    if (latitude === null || latitude === undefined) {
        errors.push('Latitude is null or undefined');
        return { isValid: false, errors };
    }

    if (longitude === null || longitude === undefined) {
        errors.push('Longitude is null or undefined');
        return { isValid: false, errors };
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (isNaN(lat)) {
        errors.push(`Invalid latitude: ${latitude} is not a number`);
    }

    if (isNaN(lon)) {
        errors.push(`Invalid longitude: ${longitude} is not a number`);
    }

    if (errors.length > 0) {
        return { isValid: false, errors };
    }

    // Check latitude bounds
    if (lat < -90 || lat > 90) {
        errors.push(`Latitude ${lat} is out of range [-90, 90]`);
    }

    // Check longitude bounds
    if (lon < -180 || lon > 180) {
        errors.push(`Longitude ${lon} is out of range [-180, 180]`);
    }

    // Check for exactly zero (might indicate missing data)
    if (lat === 0 && lon === 0) {
        errors.push('Coordinates are (0, 0) - likely missing data');
    }

    return {
        isValid: errors.length === 0,
        latitude: lat,
        longitude: lon,
        errors,
    };
}

/**
 * Validates UTM coordinates
 */
export function validateUTM(
    easting: number | null | undefined,
    northing: number | null | undefined,
    zoneNum?: number | null,
    _zoneLetter?: string | null
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (easting === null || easting === undefined) {
        errors.push('Easting is null or undefined');
    }

    if (northing === null || northing === undefined) {
        errors.push('Northing is null or undefined');
    }

    if (errors.length > 0) {
        return { isValid: false, errors };
    }

    const e = Number(easting);
    const n = Number(northing);

    if (isNaN(e)) {
        errors.push(`Invalid easting: ${easting} is not a number`);
    }

    if (isNaN(n)) {
        errors.push(`Invalid northing: ${northing} is not a number`);
    }

    // UTM easting typically 100,000 - 900,000
    if (e < 100000 || e > 900000) {
        errors.push(`Easting ${e} is outside typical UTM range [100000-900000]`);
    }

    // UTM northing typically 0 - 10,000,000
    if (n < 0 || n > 10000000) {
        errors.push(`Northing ${n} is outside typical UTM range [0-10000000]`);
    }

    // Validate zone number (1-60)
    if (zoneNum !== null && zoneNum !== undefined) {
        if (zoneNum < 1 || zoneNum > 60) {
            errors.push(`Zone number ${zoneNum} is outside valid range [1-60]`);
        }
    }

    return { isValid: errors.length === 0, errors };
}

/**
 * Checks if coordinates are within Brazil's approximate bounds
 * Helpful for sanity checking
 */
export function isInBrazil(latitude: number, longitude: number): boolean {
    // Brazil approximate bounding box
    const MIN_LAT = -33.7;  // Southern tip
    const MAX_LAT = 5.3;    // Northern tip
    const MIN_LON = -73.9;  // Western tip
    const MAX_LON = -34.8;  // Eastern tip

    return (
        latitude >= MIN_LAT &&
        latitude <= MAX_LAT &&
        longitude >= MIN_LON &&
        longitude <= MAX_LON
    );
}

/**
 * Comprehensive coordinate diagnostic
 */
export function diagnoseCoordinates(tree: {
    id: string;
    latitude?: number | null;
    longitude?: number | null;
    easting?: number | null;
    northing?: number | null;
    utmzonenum?: number | null;
    utmzoneletter?: string | null;
}): {
    canDisplay: boolean;
    hasLatLon: boolean;
    hasUTM: boolean;
    latLonValid: boolean;
    utmValid: boolean;
    inBrazil: boolean;
    issues: string[];
} {
    const issues: string[] = [];

    // Check for lat/lon
    const hasLatLon = !!(tree.latitude !== null && tree.longitude !== null);
    const latLonValidation = hasLatLon
        ? validateLatLon(tree.latitude, tree.longitude)
        : { isValid: false, errors: ['No latitude/longitude'] };

    if (!latLonValidation.isValid) {
        issues.push(...latLonValidation.errors);
    }

    // Check for UTM
    const hasUTM = !!(tree.easting && tree.northing);
    const utmValidation = hasUTM
        ? validateUTM(tree.easting, tree.northing, tree.utmzonenum, tree.utmzoneletter)
        : { isValid: false, errors: ['No UTM coordinates'] };

    if (!utmValidation.isValid) {
        issues.push(...utmValidation.errors);
    }

    // Check Brazil bounds
    const inBrazil = latLonValidation.isValid && latLonValidation.latitude && latLonValidation.longitude
        ? isInBrazil(latLonValidation.latitude, latLonValidation.longitude)
        : false;

    if (hasLatLon && !inBrazil) {
        issues.push('Coordinates are outside Brazil bounds - possible error');
    }

    return {
        canDisplay: latLonValidation.isValid,
        hasLatLon,
        hasUTM,
        latLonValid: latLonValidation.isValid,
        utmValid: utmValidation.isValid,
        inBrazil,
        issues,
    };
}
