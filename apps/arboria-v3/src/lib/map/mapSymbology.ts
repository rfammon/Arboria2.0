/**
 * Map Symbology - Tree marker colors and sizes
 * Based on legacy map.ui.js risk-based visualization + Fall Zone (radius = tree height)
 */


// import type { Tree } from '../../types/tree';

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
export function getTreeSymbol(tree: any): TreeSymbol {
    const { pontuacao, altura, risklevel } = tree;

    // Determinar cor e raio padrão baseado em pontuação TRAQ ou risklevel
    let color: string;
    let defaultRadius: number;
    let riskLevel: string;

    const risk = risklevel?.toLowerCase() || '';

    // Priority 1: Exact Score
    if (pontuacao && pontuacao >= 9) {
        color = '#d32f2f'; // Vermelho - Alto Risco
        defaultRadius = 10;
        riskLevel = 'Alto Risco';
    }
    // Priority 2: Risk Level String matching (important for reports)
    else if (risk.includes('alto') || risk.includes('high')) {
        color = '#d32f2f';
        defaultRadius = 10;
        riskLevel = 'Alto Risco';
    }
    else if ((pontuacao && pontuacao >= 5) || risk.includes('médio') || risk.includes('medio') || risk.includes('medium')) {
        color = '#f57c00'; // Laranja - Médio Risco
        defaultRadius = 8;
        riskLevel = 'Médio Risco';
    } else {
        color = '#388e3c'; // Verde - Baixo Risco
        defaultRadius = 6;
        riskLevel = 'Baixo Risco';
    }

    // FALL ZONE VISUALIZATION
    const treeHeight = parseFloat(altura?.toString() || '0');
    // For individual reports, we want the marker to be prominent
    const radius = treeHeight > 0 ? Math.max(treeHeight, defaultRadius) : defaultRadius;
    const finalRadius = Math.min(radius, 40); // Cap at 40px

    return { color, radius: finalRadius, riskLevel };
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
