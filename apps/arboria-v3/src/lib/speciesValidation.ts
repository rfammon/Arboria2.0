export interface SpeciesStat {
    avgDap: number; // cm
    stdDevDap: number; // cm
    avgHeight?: number; // m
    stdDevHeight?: number; // m
}

// Mock database of species statistics
// In a real app, this would be fetched from Supabase or cached locally
export const SPECIES_STATS: Record<string, SpeciesStat> = {
    'Ipê Amarelo': { avgDap: 45, stdDevDap: 15, avgHeight: 12, stdDevHeight: 4 },
    'Pau-Brasil': { avgDap: 30, stdDevDap: 8, avgHeight: 10, stdDevHeight: 3 },
    'Jacarandá': { avgDap: 50, stdDevDap: 20, avgHeight: 15, stdDevHeight: 5 },
    'Mangueira': { avgDap: 60, stdDevDap: 25, avgHeight: 10, stdDevHeight: 6 },
    'Eucalipto': { avgDap: 40, stdDevDap: 10, avgHeight: 25, stdDevHeight: 8 },
};

export function getSpeciesStat(speciesName: string): SpeciesStat | null {
    // Simple normalize for partial matching
    const normalized = speciesName.trim().toLowerCase();

    // Find closest match (simple includes check for now)
    const key = Object.keys(SPECIES_STATS).find(k =>
        k.toLowerCase() === normalized || k.toLowerCase().includes(normalized) || normalized.includes(k.toLowerCase())
    );

    return key ? SPECIES_STATS[key] : null;
}

export function isOutlier(value: number, avg: number, stdDev: number, thresholdSigma = 2): boolean {
    const diff = Math.abs(value - avg);
    return diff > (stdDev * thresholdSigma);
}
