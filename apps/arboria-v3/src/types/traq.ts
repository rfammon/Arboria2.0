/**
 * TRAQ Type Definitions
 * Tipos TypeScript para o sistema de avaliação de risco TRAQ
 */

import type { FailureProbability, RiskLevel } from '../lib/traq/traqLogic';

/**
 * Critério de risco TRAQ (registro do banco de dados)
 */
export interface TRAQRiskCriteria {
    id: number;
    categoria: string;
    criterio: string;
    peso: number; // Mantido para retrocompatibilidade, mas não usado no cálculo novo
    failure_prob?: FailureProbability; // Probabilidade de falha associada a este defeito
    ordem: number;
    tooltip?: string;
    ativo: boolean;
}

/**
 * Avaliação individual de um fator de risco
 */
export interface FactorAssessment {
    criteriaId: number;
    probability: FailureProbability | null;
    mitigation: MitigationAction;
}

/**
 * Assessment completo de risco TRAQ
 * Resultado final da avaliação
 */
export interface TRAQAssessment {
    targetCategory: number | null; // 1-4
    factors: FactorAssessment[]; // Lista detalhada de avaliações por fator
    mitigationAction: string; // JSON das mitigações ou ação principal (legado)
    riskFactors: (0 | 1)[]; // Array de checkboxes (0=não, 1=sim)
    totalScore: number; // Soma dos pesos (legado/auxiliar)
    failureProb: FailureProbability;
    impactProb: string;
    initialRisk: RiskLevel;
    residualRisk: RiskLevel;
    drivingFactor?: string;
}

/**
 * Ações de mitigação disponíveis
 */
export type MitigationAction =
    | 'nenhuma'
    | 'monitoramento'
    | 'poda_leve'
    | 'poda_pesada'
    | 'remocao_galhos'
    | 'instalacao_cabos'
    | 'remocao_arvore';

/**
 * Dados do formulário TRAQ
 */
export interface TRAQFormData {
    targetCategory: number;
    mitigationAction: MitigationAction;
    riskFactors: boolean[];
}

/**
 * Resultado de salvamento TRAQ
 */
export interface TRAQSaveResult {
    success: boolean;
    treeId?: number;
    assessment?: TRAQAssessment;
    error?: string;
}
