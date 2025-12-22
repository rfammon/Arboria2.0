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
});

export type TreeFormData = z.infer<typeof treeSchema>;
