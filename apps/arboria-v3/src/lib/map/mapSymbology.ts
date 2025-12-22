/**
 * Map Symbology - Tree marker colors and sizes
 * Based on legacy map.ui.js risk-based visualization + Fall Zone (radius = tree height)
 */

import type { Tree } from '../../types/tree';

export interface TreeSymbol {
    color: string;
    radius: number; // em pixels para MapLibre
    riskLevel: string;
}

/**
 * Determina cor, tamanho e nível de risco de um marcador de árvore
 * Implementa a mesma lógica do código legado:
 * - Cor baseada em pontuação/risco
 * - Raio = altura da árvore (Fall Zone visualization)
 */
export function getTreeSymbol(tree: Tree): TreeSymbol {
    const { pontuacao, altura } = tree;

    // Determinar cor e raio padrão baseado em pontuação TRAQ
    let color: string;
    let defaultRadius: number;
    let riskLevel: string;

    // Legacy logic: Alto >= 9, Médio >= 5, Baixo < 5
    if (pontuacao && pontuacao >= 9) {
        color = '#d32f2f'; // Vermelho - Alto Risco
        defaultRadius = 8;
        riskLevel = 'Alto Risco';
    } else if (pontuacao && pontuacao >= 5) {
        color = '#f57c00'; // Laranja - Médio Risco
        defaultRadius = 5;
        riskLevel = 'Médio Risco';
    } else {
        color = '#388e3c'; // Verde - Baixo Risco
        defaultRadius = 3;
        riskLevel = 'Baixo Risco';
    }

    // FALL ZONE VISUALIZATION
    // Se a árvore tem altura definida, use-a como raio (zona de queda)
    // Limite máximo de 30 pixels para não ter círculos gigantes no mapa
    const treeHeight = parseFloat(altura?.toString() || '0');
    const radius = treeHeight > 0 ? Math.min(treeHeight, 30) : defaultRadius;

    return { color, radius, riskLevel };
}

/**
 * Normaliza nível de risco para formato consistente
 * Compatibilidade com diferentes formatos do banco de dados
 */
export function normalizeRiskLevel(risk: string | undefined): string {
    if (!risk) return 'Baixo Risco';

    const riskLower = risk.toLowerCase();

    if (riskLower.includes('alto') || riskLower.includes('extremo') || riskLower === 'high') {
        return 'Alto Risco';
    } else if (riskLower.includes('médio') || riskLower.includes('moderado') || riskLower === 'medium') {
        return 'Médio Risco';
    } else if (riskLower.includes('baixo') || riskLower === 'low') {
        return 'Baixo Risco';
    }

    return 'Baixo Risco'; // Default safe
}
