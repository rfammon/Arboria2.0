export interface Tree {
    id: string;
    especie: string | null;
    data: string | null;
    dap: number | null;
    altura: number | null;
    observacoes: string | null;
    local: string | null;
    // Geographic coordinates (converted from UTM for map display)
    latitude: number | null;
    longitude: number | null;
    // UTM coordinates (stored in database)
    easting?: number | null;
    northing?: number | null;
    codigo?: string | null;
    utmzonenum?: number | null;
    utmzoneletter?: string | null;
    pontuacao: number | null;
    risklevel: string | null;
    user_id: string | null;
    instalacao_id: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    // TRAQ fields
    failure_prob?: string;
    target_category?: string;
    mitigation?: string;
    residual_risk?: string;
    risk_factors?: string[];
    risk_score?: number | null;
    health?: 'Good' | 'Fair' | 'Poor' | 'Dead' | null;
};
