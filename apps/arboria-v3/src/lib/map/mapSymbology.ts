/**
 * Map Symbology - Tree marker colors and sizes
 * Based on legacy map.ui.js risk-based visualization + Fall Zone (radius = tree height)
 */


// import type { Tree } from '../../types/tree';

export const MAP_RISK_COLORS = {
    EXTREME: '#9333ea', // Roxo
    HIGH: '#d32f2f',   // Vermelho
    MEDIUM: '#f57c00', // Laranja
    LOW: '#388e3c'     // Verde
};

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

    // Priority 0: Explicit Extreme Risk
    if (risk.includes('extremo') || risk.includes('extreme')) {
        color = MAP_RISK_COLORS.EXTREME;
        defaultRadius = 12; // Um pouco maior para destaque
        riskLevel = 'Alto';
    }
    // Priority 1: Exact Score
    else if (pontuacao && pontuacao >= 9) {
        color = MAP_RISK_COLORS.HIGH; // Vermelho - Alto Risco
        defaultRadius = 10;
        riskLevel = 'Alto';
    }
    // Priority 2: Risk Level String matching (important for reports)
    else if (risk.includes('alto') || risk.includes('high') || risk.includes('crítico') || risk.includes('critico')) {
        color = MAP_RISK_COLORS.HIGH;
        defaultRadius = 10;
        riskLevel = 'Alto';
    }
    else if ((pontuacao && pontuacao >= 5) || risk.includes('médio') || risk.includes('medio') || risk.includes('medium') || risk.includes('moderado')) {
        color = MAP_RISK_COLORS.MEDIUM; // Laranja - Médio Risco
        defaultRadius = 8;
        riskLevel = 'Médio';
    } else {
        color = MAP_RISK_COLORS.LOW; // Verde - Baixo Risco
        defaultRadius = 6;
        riskLevel = 'Baixo';
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
    if (!risk) return 'Baixo';

    const riskLower = risk.toLowerCase();

    if (riskLower.includes('extremo') || riskLower.includes('extreme')) {
        return 'Alto';
    } else if (riskLower.includes('alto') || riskLower.includes('high') || riskLower.includes('crítico') || riskLower.includes('critico')) {
        return 'Alto';
    } else if (riskLower.includes('médio') || riskLower.includes('moderado') || riskLower === 'medium' || riskLower === 'medio') {
        return 'Médio';
    } else if (riskLower.includes('baixo') || riskLower === 'low') {
        return 'Baixo';
    }

    return 'Baixo'; // Default safe
}
