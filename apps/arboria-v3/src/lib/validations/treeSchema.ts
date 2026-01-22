import { z } from 'zod';

export const treeSchema = z.object({
    id: z.string().optional(),
    nome: z.string().optional().nullable().or(z.literal('')),
    especie: z.string().min(1, 'Espécie é obrigatória'),
    data: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Data inválida',
    }),
    dap: z.coerce.number().min(0, 'DAP deve ser positivo').optional().nullable(),
    altura: z.coerce.number().min(0, 'Altura deve ser positiva').optional().nullable(),
    pontuacao: z.coerce.number().min(0).max(12).optional().nullable().or(z.nan()),
    risco: z.enum(['Baixo', 'Moderado', 'Alto', 'Extremo', 'Crítico']).optional().nullable(),
    observacoes: z.string().optional().nullable(),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    easting: z.coerce.number().optional().nullable(),
    northing: z.coerce.number().optional().nullable(),
    utmzonenum: z.coerce.number().optional().nullable(),
    utmzoneletter: z.string().optional().nullable(),
    // DAP Estimation fields
    dap_estimated: z.boolean().optional().nullable(),
    estimated_error_margin: z.string().optional().nullable(),

    // TRAQ Fields
    failure_prob: z.string().optional().nullable(),
    impact_prob: z.string().optional().nullable(),
    target_category: z.coerce.number().optional().nullable(),
    residual_risk: z.string().optional().nullable(),
    risk_factors: z.array(z.union([z.number(), z.string()])).optional().nullable(),
    mitigation: z.string().optional().nullable(),
});

// Schema for updates (excludes auto-managed fields)
export const treeUpdateSchema = treeSchema.omit({
    id: true
});

export type TreeFormData = z.infer<typeof treeSchema>;

/**
 * Sanitizes tree update data by removing read-only fields and keeping only schema-defined fields
 * 
 * @param data - Raw update data that may contain extra fields
 * @returns Sanitized object with only allowed update fields
 */
export function sanitizeTreeUpdate(data: any): Partial<TreeFormData> {
    // Remove read-only fields
    const { id: _, created_at, updated_at, user_id, instalacao_id, ...rest } = data;
    
    // Get allowed field names from schema
    const allowedFields = Object.keys(treeUpdateSchema.shape);
    
    // Filter to only allowed fields
    return Object.keys(rest)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
            obj[key] = rest[key];
            return obj;
        }, {});
}
