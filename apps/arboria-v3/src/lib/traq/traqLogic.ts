/**
 * TRAQ Risk Assessment Logic
 * Implementa a metodologia Tree Risk Assessment Qualification (ISA/TRAQ)
 */

export type FailureProbability = 'Improvável' | 'Possível' | 'Provável' | 'Iminente';
export type ImpactProbability = 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto';
export type EventLikelihood = 'Muito Improvável' | 'Improvável' | 'Provável' | 'Muito Provável';
export type Consequence = 'Mínima' | 'Menor' | 'Significante' | 'Severa';
export type RiskLevel = 'Baixo' | 'Moderado' | 'Alto' | 'Extremo';

/**
 * Determina a Probabilidade de Falha baseada na metodologia científica (Maior Severidade)
 */
export function getScientificFailureProb(
    selectedRiskFactors: { failure_prob?: FailureProbability; criterio: string }[]
): { probability: FailureProbability; drivingFactor?: string } {
    if (!selectedRiskFactors || selectedRiskFactors.length === 0) {
        return { probability: 'Improvável' };
    }

    const severityOrder: FailureProbability[] = ['Iminente', 'Provável', 'Possível', 'Improvável'];

    for (const severity of severityOrder) {
        const factor = selectedRiskFactors.find(f => f.failure_prob === severity);
        if (factor) {
            return {
                probability: severity,
                drivingFactor: factor.criterio
            };
        }
    }

    return { probability: 'Improvável' };
}

/**
 * Mapeia categoria do alvo para probabilidade de impacto (Tabela 4 TRAQ)
 */
export function getImpactProb(targetCategory: number): ImpactProbability {
    const map: Record<number, ImpactProbability> = {
        1: 'Muito Baixo',
        2: 'Baixo',
        3: 'Médio',
        4: 'Alto'
    };
    return map[targetCategory] || 'Muito Baixo';
}

/**
 * Matriz de Probabilidade do Evento (Event Likelihood Matrix)
 */
function getEventLikelihood(
    failureProb: FailureProbability,
    impactProb: ImpactProbability
): EventLikelihood {
    const impactIndex: Record<ImpactProbability, number> = {
        'Muito Baixo': 0,
        'Baixo': 1,
        'Médio': 2,
        'Alto': 3
    };

    const matrix: Record<FailureProbability, EventLikelihood[]> = {
        'Improvável': ['Muito Improvável', 'Muito Improvável', 'Improvável', 'Improvável'],
        'Possível': ['Muito Improvável', 'Improvável', 'Provável', 'Provável'],
        'Provável': ['Improvável', 'Provável', 'Muito Provável', 'Muito Provável'],
        'Iminente': ['Improvável', 'Muito Provável', 'Muito Provável', 'Muito Provável']
    };

    return matrix[failureProb][impactIndex[impactProb]];
}

/**
 * Determina a consequência baseada na categoria do alvo
 */
function getConsequence(targetCategory: number): Consequence {
    return targetCategory === 4 ? 'Severa' : 'Significante';
}

/**
 * Matriz de Classificação de Risco Final (Risk Rating Matrix)
 */
export function runTraqMatrices(
    failureProb: FailureProbability,
    impactProb: ImpactProbability,
    targetCategory: number
): RiskLevel {
    const eventLikelihood = getEventLikelihood(failureProb, impactProb);
    const consequence = getConsequence(targetCategory);

    const consequenceIndex: Record<Consequence, number> = {
        'Mínima': 0,
        'Menor': 1,
        'Significante': 2,
        'Severa': 3
    };

    const riskMatrix: Record<EventLikelihood, RiskLevel[]> = {
        'Muito Provável': ['Moderado', 'Alto', 'Extremo', 'Extremo'],
        'Provável': ['Baixo', 'Moderado', 'Alto', 'Extremo'],
        'Improvável': ['Baixo', 'Baixo', 'Moderado', 'Alto'],
        'Muito Improvável': ['Baixo', 'Baixo', 'Baixo', 'Moderado']
    };

    return riskMatrix[eventLikelihood][consequenceIndex[consequence]];
}

/**
 * Mapeia quais mitigações são permitidas para cada categoria de defeito
 */
export const ALLOWED_MITIGATIONS_BY_CATEGORY: Record<string, string[]> = {
    'Copa e Galhos': ['poda_leve', 'poda_pesada', 'remocao_galhos', 'monitoramento', 'nenhuma'],
    'Tronco': ['remocao_arvore', 'instalacao_cabos', 'monitoramento', 'nenhuma'],
    'Estrutura': ['remocao_arvore', 'instalacao_cabos', 'monitoramento', 'nenhuma'],
    'Estabilidade': ['remocao_arvore', 'instalacao_cabos', 'monitoramento', 'nenhuma'],
    'Raízes': ['remocao_arvore', 'monitoramento', 'nenhuma'],
    'Conflitos': ['poda_leve', 'poda_pesada', 'monitoramento', 'nenhuma'],
    'Outros': ['poda_leve', 'remocao_arvore', 'monitoramento', 'nenhuma']
};

/**
 * Reduz a probabilidade de falha baseada na ação (v2.0)
 * Ações diferentes de 'monitoramento' ou 'nenhuma' neutralizam o risco do fator.
 */
/**
 * Reduz a probabilidade de falha baseada na ação (v2.0 - Graduado)
 * Remoção: Improvável (risco eliminado)
 * Poda Pesada/Cabos/Remoção Galhos: Reduz em 2 níveis (ex: Iminente -> Possível)
 * Poda Leve: Reduz em 1 nível (ex: Iminente -> Provável)
 * Monitoramento/Nenhuma: Sem redução
 */
function getReducedFailureProbV2(failureProb: FailureProbability, mitigationAction?: string): FailureProbability {
    if (!mitigationAction || mitigationAction === 'nenhuma' || mitigationAction === 'monitoramento') {
        return failureProb;
    }

    if (mitigationAction === 'remocao_arvore') {
        return 'Improvável';
    }

    const order: FailureProbability[] = ['Improvável', 'Possível', 'Provável', 'Iminente'];
    const currentIndex = order.indexOf(failureProb);

    if (mitigationAction === 'poda_pesada' || mitigationAction === 'instalacao_cabos' || mitigationAction === 'remocao_galhos') {
        // Redução de 2 níveis
        const newIndex = Math.max(0, currentIndex - 2);
        return order[newIndex];
    }

    if (mitigationAction === 'poda_leve') {
        // Redução de 1 nível
        const newIndex = Math.max(0, currentIndex - 1);
        return order[newIndex];
    }

    return 'Improvável'; // Fallback para ações drásticas não listadas explicitamente
}

/**
 * Calcula o risco residual baseado em múltiplos fatores (v2.0)
 */
export function calculateCumulativeResidualRisk(
    factorsWithMitigations: { failureProb: FailureProbability; mitigationAction: string | null }[],
    impactProb: ImpactProbability,
    targetCategory: number
): { residualRisk: RiskLevel; maxReducedFailureProb: FailureProbability } {
    if (factorsWithMitigations.length === 0) {
        return {
            residualRisk: runTraqMatrices('Improvável', impactProb, targetCategory),
            maxReducedFailureProb: 'Improvável'
        };
    }

    const reducedProbs = factorsWithMitigations.map(f =>
        getReducedFailureProbV2(f.failureProb, f.mitigationAction || undefined)
    );

    const severityOrder: FailureProbability[] = ['Iminente', 'Provável', 'Possível', 'Improvável'];
    let maxReducedFailureProb: FailureProbability = 'Improvável';

    for (const severity of severityOrder) {
        if (reducedProbs.includes(severity)) {
            maxReducedFailureProb = severity;
            break;
        }
    }

    const residualRisk = runTraqMatrices(maxReducedFailureProb, impactProb, targetCategory);
    return { residualRisk, maxReducedFailureProb };
}

/**
 * Calcula risco residual - compatibilidade retroativa usando lógica v2.0
 */
export function calculateResidualRisk(
    failureProb: FailureProbability,
    impactProb: ImpactProbability,
    targetCategory: number,
    mitigationAction: string | null
): { residualRisk: RiskLevel; reducedFailureProb: FailureProbability } {
    const reducedFailureProb = getReducedFailureProbV2(failureProb, mitigationAction || undefined);
    const residualRisk = runTraqMatrices(reducedFailureProb, impactProb, targetCategory);
    return { residualRisk, reducedFailureProb };
}

/**
 * Perfis de risco com cores e classes CSS
 */
export const RISK_PROFILES = {
    Baixo: {
        class: 'risk-low',
        color: '#4caf50',
        bgColor: '#e8f5e9',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: '✓'
    },
    Moderado: {
        class: 'risk-medium',
        color: '#ff9800',
        bgColor: '#fff3e0',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        icon: '⚠'
    },
    Alto: {
        class: 'risk-high',
        color: '#f44336',
        bgColor: '#ffebee',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: '!'
    },
    Extremo: {
        class: 'risk-extreme',
        color: '#9c27b0',
        bgColor: '#f3e5f5',
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        icon: '‼'
    }
} as const;

/**
 * Descrições das categorias de alvo
 */
export const TARGET_CATEGORIES = [
    { value: 1, label: '1 - Raro', desc: 'Área raramente ocupada (< 1 hora/semana)', examples: 'Áreas remotas, trilhas pouco usadas' },
    { value: 2, label: '2 - Ocasional', desc: 'Ocupação ocasional (1-4 horas/semana)', examples: 'Áreas de manutenção, estacionamentos' },
    { value: 3, label: '3 - Frequente', desc: 'Ocupação frequente (5-20 horas/semana)', examples: 'Calçadas, áreas de lazer' },
    { value: 4, label: '4 - Constante', desc: 'Ocupação constante (> 20 horas/semana)', examples: 'Playgrounds, áreas de grande circulação' }
] as const;

/**
 * Ações de mitigação disponíveis
 */
export const MITIGATION_ACTIONS = [
    { value: 'nenhuma', label: 'Nenhuma', desc: 'Não requer ação imediata' },
    { value: 'monitoramento', label: 'Monitoramento Periódico', desc: 'Acompanhar evolução do risco (Não reduz o nível de risco)' },
    { value: 'poda_leve', label: 'Poda Leve', desc: 'Remoção de galhos pequenos' },
    { value: 'poda_pesada', label: 'Poda Pesada', desc: 'Redução significativa da copa' },
    { value: 'remocao_galhos', label: 'Remoção de Galhos Críticos', desc: 'Eliminar partes específicas de risco' },
    { value: 'instalacao_cabos', label: 'Instalação de Cabos de Suporte', desc: 'Reforço estrutural' },
    { value: 'remocao_arvore', label: 'Remoção da Árvore', desc: 'Eliminação completa do risco' }
] as const;
