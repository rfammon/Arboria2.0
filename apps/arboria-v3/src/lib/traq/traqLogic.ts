/**
 * TRAQ Risk Assessment Logic
 * Implementa a metodologia Tree Risk Assessment Qualification (ISA/TRAQ)
 * Baseado no código original do sistema deprecated
 */

export type FailureProbability = 'Improvável' | 'Possível' | 'Provável' | 'Iminente';
export type ImpactProbability = 'Muito Baixo' | 'Baixo' | 'Médio' | 'Alto';
export type EventLikelihood = 'Muito Improvável' | 'Improvável' | 'Provável' | 'Muito Provável';
export type Consequence = 'Mínima' | 'Menor' | 'Significante' | 'Severa';
export type RiskLevel = 'Baixo' | 'Moderado' | 'Alto' | 'Extremo';

/**
 * Determina a Probabilidade de Falha baseada na metodologia científica (Maior Severidade)
 * Em vez de somar pesos, identifica o defeito mais grave presente.
 * 
 * @param selectedRiskFactors - Array de objetos contendo a failure_prob de cada fator marcado
 * @returns A maior probabilidade de falha encontrada e o fator determinante
 */
export function getScientificFailureProb(
    selectedRiskFactors: { failure_prob?: FailureProbability; criterio: string }[]
): { probability: FailureProbability; drivingFactor?: string } {
    if (!selectedRiskFactors || selectedRiskFactors.length === 0) {
        return { probability: 'Improvável' };
    }

    const severityOrder = ['Iminente', 'Provável', 'Possível', 'Improvável'];

    for (const severity of severityOrder) {
        const factor = selectedRiskFactors.find(f => f.failure_prob === severity);
        if (factor) {
            return {
                probability: severity as FailureProbability,
                drivingFactor: factor.criterio
            };
        }
    }

    return { probability: 'Improvável' };
}

/**
 * Converte pontuação do checklist em probabilidade de falha (LEGADO - Mantido para compatibilidade)
 * @deprecated Use getScientificFailureProb
 */
export function getFailureProb(score: number): FailureProbability {
    if (score >= 30) return 'Iminente';
    if (score >= 20) return 'Provável';
    if (score >= 10) return 'Possível';
    return 'Improvável';
}

/**
 * Mapeia categoria do alvo para probabilidade de impacto (Tabela 4 TRAQ)
 * @param targetCategory - 1=Raro, 2=Ocasional, 3=Frequente, 4=Constante
 * @returns Probabilidade de impacto no alvo
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
 * Combina Probabilidade de Falha x Probabilidade de Impacto
 * Conforme metodologia TRAQ oficial
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
 * Categoria 4 (Constante) = Severa, outras = Significante
 */
function getConsequence(targetCategory: number): Consequence {
    return targetCategory === 4 ? 'Severa' : 'Significante';
}

/**
 * Matriz de Classificação de Risco Final (Risk Rating Matrix)
 * Combina Event Likelihood x Consequence
 * Esta é a matriz principal que determina o nível de risco TRAQ
 * 
 * @param failureProb - Probabilidade de falha da árvore
 * @param impactProb - Probabilidade de impacto no alvo
 * @param targetCategory - Categoria de ocupação do alvo (1-4)
 * @returns Nível de risco final: Baixo, Moderado, Alto ou Extremo
 */
export function runTraqMatrices(
    failureProb: FailureProbability,
    impactProb: ImpactProbability,
    targetCategory: number
): RiskLevel {
    // Passo 1: Calcular Event Likelihood
    const eventLikelihood = getEventLikelihood(failureProb, impactProb);

    // Passo 2: Determinar Consequence
    const consequence = getConsequence(targetCategory);

    // Passo 3: Aplicar Risk Rating Matrix
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
 * Reduz a probabilidade de falha em um nível
 * Usado para calcular risco residual após mitigação
 */
function getReducedFailureProb(failureProb: FailureProbability, mitigationAction?: string): FailureProbability {
    // Monitoramento e Nenhuma ação não reduzem a probabilidade de falha
    if (!mitigationAction || mitigationAction === 'nenhuma' || mitigationAction === 'monitoramento') {
        return failureProb;
    }

    // Remoção da árvore ou instalação de suporte estrutural reduzem o risco drasticamente
    if (mitigationAction === 'remocao_arvore' || mitigationAction === 'instalacao_cabos') {
        return 'Improvável';
    }

    // Ações de poda reduzem a probabilidade em um nível
    const reductionMap: Record<FailureProbability, FailureProbability> = {
        'Iminente': 'Provável',
        'Provável': 'Possível',
        'Possível': 'Improvável',
        'Improvável': 'Improvável'
    };
    return reductionMap[failureProb];
}

/**
 * Calcula risco residual após mitigação
 * Considera o tipo específico de mitigação para determinar a redução
 * 
 * @param failureProb - Probabilidade de falha inicial
 * @param impactProb - Probabilidade de impacto
 * @param targetCategory - Categoria do alvo
 * @param mitigationAction - Ação de mitigação escolhida (string)
 * @returns Objeto com risco residual e probabilidade de falha reduzida
 */
export function calculateResidualRisk(
    failureProb: FailureProbability,
    impactProb: ImpactProbability,
    targetCategory: number,
    mitigationAction: string | null
): { residualRisk: RiskLevel; reducedFailureProb: FailureProbability } {
    // Se a ação é remoção completa, o risco é eliminado (Baixo)
    if (mitigationAction === 'remocao_arvore') {
        return {
            residualRisk: 'Baixo',
            reducedFailureProb: 'Improvável'
        };
    }

    const reducedFailureProb = getReducedFailureProb(failureProb, mitigationAction || undefined);
    const residualRisk = runTraqMatrices(reducedFailureProb, impactProb, targetCategory);

    return { residualRisk, reducedFailureProb };
}

/**
 * Perfis de risco com cores e classes CSS
 * Usado para styling visual consistente
 */
export const RISK_PROFILES = {
    Baixo: {
        class: 'risk-low',
        color: '#4caf50',
        bgColor: '#e8f5e9',
        icon: '✓'
    },
    Moderado: {
        class: 'risk-medium',
        color: '#ff9800',
        bgColor: '#fff3e0',
        icon: '⚠'
    },
    Alto: {
        class: 'risk-high',
        color: '#f44336',
        bgColor: '#ffebee',
        icon: '!'
    },
    Extremo: {
        class: 'risk-extreme',
        color: '#9c27b0',
        bgColor: '#f3e5f5',
        icon: '‼'
    }
} as const;

/**
 * Descrições das categorias de alvo
 */
export const TARGET_CATEGORIES = [
    {
        value: 1,
        label: '1 - Raro',
        desc: 'Área raramente ocupada (< 1 hora/semana)',
        examples: 'Áreas remotas, trilhas pouco usadas'
    },
    {
        value: 2,
        label: '2 - Ocasional',
        desc: 'Ocupação ocasional (1-4 horas/semana)',
        examples: 'Áreas de manutenção, estacionamentos'
    },
    {
        value: 3,
        label: '3 - Frequente',
        desc: 'Ocupação frequente (5-20 horas/semana)',
        examples: 'Calçadas, áreas de lazer'
    },
    {
        value: 4,
        label: '4 - Constante',
        desc: 'Ocupação constante (> 20 horas/semana)',
        examples: 'Playgrounds, áreas de grande circulação'
    }
] as const;

/**
 * Ações de mitigação disponíveis
 */
export const MITIGATION_ACTIONS = [
    { value: 'nenhuma', label: 'Nenhuma', desc: 'Não requer ação imediata' },
    { value: 'monitoramento', label: 'Monitoramento Periódico', desc: 'Acompanhar evolução do risco' },
    { value: 'poda_leve', label: 'Poda Leve', desc: 'Remoção de galhos pequenos' },
    { value: 'poda_pesada', label: 'Poda Pesada', desc: 'Redução significativa da copa' },
    { value: 'remocao_galhos', label: 'Remoção de Galhos Críticos', desc: 'Eliminar partes específicas de risco' },
    { value: 'instalacao_cabos', label: 'Instalação de Cabos de Suporte', desc: 'Reforço estrutural' },
    { value: 'remocao_arvore', label: 'Remoção da Árvore', desc: 'Eliminação completa do risco' }
] as const;
