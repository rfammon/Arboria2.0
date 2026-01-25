/**
 * Map Filters - Risk-based filtering for tree visualization
 * Based on legacy map.ui.js native MapLibre filtering
 */

export type RiskFilter = 'Todos' | 'Alto' | 'Médio' | 'Baixo';

/**
 * Cria expressão de filtro para MapLibre baseada no nível de risco selecionado
 * Usa filtros nativos do MapLibre para máxima performance (GPU-accelerated)
 * 
 * @param riskLevel - Nível de risco para filtrar
 * @returns Expressão de filtro MapLibre ou null (sem filtro)
 */
export function createRiskFilter(riskLevel: RiskFilter): any[] | null {
    if (riskLevel === 'Todos') {
        return null; // Sem filtro - mostra todas as árvores
    }

    // Filtro nativo do MapLibre: ['==', propriedade, valor]
    return ['==', ['get', 'riskLevel'], riskLevel];
}

/**
 * Lista de todos os níveis de risco disponíveis para filtros
 */
export const RISK_LEVELS: RiskFilter[] = [
    'Todos',
    'Alto',
    'Médio',
    'Baixo'
];
