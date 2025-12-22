// Intervention Planning Module - Utility Functions

import type {
    PlanSchedule,
    UrgencyConfig,
    InterventionPlan,
    PlanStatistics,
    InterventionType,
    PlanDurations
} from '../types/plan';

// ============================================
// CONSTANTS
// ============================================

export const WASTE_DESTINATIONS = [
    'Trituração para Compostagem (Interna)',
    'Aterro Sanitário Licenciado',
    'Doação para Biomassa',
    'Pátio de Resíduos Orgânicos',
    'Outro'
];

export const INTERVENTION_ICONS: Record<InterventionType, string> = {
    poda: '✂️',
    supressao: '🪓',
    transplante: '🌱',
    tratamento: '💊',
    monitoramento: '👁️'
};

export const RISK_LABELS = [
    "1. Galhos Mortos > 5cm", "2. Rachaduras/Fendas", "3. Sinais de Apodrecimento",
    "4. Casca Inclusa (União em V)", "5. Galhos Cruzados", "6. Copa Assimétrica",
    "7. Inclinação Anormal", "8. Próxima a Vias Públicas", "9. Risco de Queda sobre Alvos",
    "10. Interferência em Redes", "11. Espécie com Histórico de Falhas", "12. Poda Drástica/Brotação",
    "13. Calçadas Rachadas", "14. Perda de Raízes", "15. Compactação/Asfixia", "16. Apodrecimento Raízes"
];

export const INTERVENTION_COLORS: Record<InterventionType, string> = {
    poda: '#4caf50',        // Green
    supressao: '#d32f2f',   // Red
    transplante: '#ff9800', // Orange
    tratamento: '#2196f3',  // Blue
    monitoramento: '#9c27b0' // Purple
};

export const INTERVENTION_LABELS: Record<InterventionType, string> = {
    poda: 'Poda',
    supressao: 'Supressão',
    transplante: 'Transplante',
    tratamento: 'Tratamento',
    monitoramento: 'Monitoramento'
};

export const TOOLS_LIST = [
    'Motosserra',
    'Motopoda',
    'Podador de Haste (Podão)',
    'Tesoura de Poda',
    'Serrote de Poda',
    'Hipsômetro',
    'Corda de Escalada',
    'Cinto de Segurança',
    'Escaleira',
    'Caminhão Cesto'
];

export const EPIS_LIST = [
    'Capacete com Jugular',
    'Óculos de Proteção/Viseira',
    'Protetor Auricular',
    'Luvas de Vaqueta/Pigmentada',
    'Calça de Motosserrista (Anticorte)',
    'Botas de Segurança',
    'Perneira',
    'Colete Refletivo',
    'Protetor Solar',
    'Cinto Paraquedista (Trabalho em Altura)'
];

export const SAFETY_PROCEDURES: Record<InterventionType, string> = {
    poda: `• ISOLAMENTO: Definir zona de exclusão (raio de 1.5x a altura do trabalho).
• TRABALHO EM ALTURA: Inspeção prévia do SPIQ e pontos de ancoragem.
• TÉCNICA: Obrigatório uso da técnica de 3 cortes para galhos > 5cm.
• POSICIONAMENTO: Nunca operar motosserra acima da linha dos ombros ou em escada instável.
• GERAL: Manter comunicação constante com a equipe de solo (linha livre).`,

    supressao: `• ISOLAMENTO CRÍTICO: Raio de 2.0x a altura total da árvore. Área totalmente evacuada.
• ROTAS DE FUGA: Estabelecer e limpar 2 caminhos a 45º opostos à direção de queda.
• PLANO DE ABATE: Definir entalhe direcional e corte de abate com dobradiça adequada.
• ATENÇÃO: Verificar efeito rebote e tensão de fibras.
• INFRAESTRUTURA: Se houver redes próximas, atuar somente com desligamento ou equipe especializada.`,

    transplante: `• ISOLAMENTO: Área para manobra de máquinas pesadas (guincho/munk).
• ESCAVAÇÃO: Sondagem prévia para evitar rede elétrica/hidráulica subterrânea.
• IÇAMENTO: Utilizar cintas planas (não correntes) para proteger o tronco.
• ERGONOMIA: Revezamento na escavação manual do torrão.
• SINALIZAÇÃO: Cones e fitas no perímetro total da operação.`,

    tratamento: `• QUÍMICOS: Uso de macacão Tyvek e respirador adequado ao produto.
• ISOLAMENTO: Afastar transeuntes durante a aplicação (risco de deriva).
• APLICAÇÃO: Não realizar em dias de vento forte ou chuva iminente.
• DESCARTE: Embalagens devem retornar para logística reversa.
• HIGIENE: Lavagem imediata de mãos e ferramentas após o uso.`,

    monitoramento: `• PERÍMETRO: Avaliar risco de queda de galhos antes de entrar na projeção da copa.
• SOLO: Atenção a buracos, raízes expostas e formigueiros.
• VISUALIZAÇÃO: Uso de binóculos para evitar escalada desnecessária.
• TRÂNSITO: Uso de colete reflexivo se próximo a vias públicas.
• CONDIÇÕES: Suspender vistoria em caso de tempestade ou ventos fortes.`
};

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Extract the start date from a schedule object
 * Handles multiple field formats for backwards compatibility
 */
export function extractScheduleDate(schedule: PlanSchedule | null | undefined): string | null {
    if (!schedule) return null;
    if (typeof schedule === 'string') return schedule;
    return schedule.start || schedule.startDate || null;
}

/**
 * Extract the end date from a schedule object
 */
export function extractScheduleEndDate(schedule: PlanSchedule | null | undefined): string | null {
    if (!schedule) return null;
    if (typeof schedule === 'string') return null;
    return schedule.end || schedule.endDate || null;
}

/**
 * Format ISO date string to Brazilian format (DD/MM/YYYY)
 */
export function formatDate(dateInput: string | PlanSchedule | null | undefined): string {
    if (!dateInput) return 'Não definida';

    let dateStr: string | null = null;

    // Handle JSONB schedule object
    if (typeof dateInput === 'object') {
        dateStr = extractScheduleDate(dateInput);
        if (!dateStr) return 'Formato inválido';
    } else if (typeof dateInput === 'string') {
        dateStr = dateInput;
    } else {
        return 'Formato inválido';
    }

    // Parse YYYY-MM-DD format
    const parts = dateStr.split('-');
    if (parts.length !== 3) return 'Formato inválido';

    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
}

/**
 * Format ISO timestamp to Brazilian datetime
 */
export function formatDateTime(dateTimeStr: string | null | undefined): string {
    if (!dateTimeStr) return 'N/A';

    try {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('pt-BR');
    } catch {
        return 'Data inválida';
    }
}

/**
 * Calculate days until execution date
 * Returns negative number for overdue tasks
 */
export function getDaysUntilExecution(schedule: PlanSchedule | null | undefined): number | null {
    const scheduleDate = extractScheduleDate(schedule);
    if (!scheduleDate) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Parse YYYY-MM-DD strictly as local time
    // new Date("YYYY-MM-DD") creates UTC, which causes off-by-one errors in western timezones
    const [year, month, day] = scheduleDate.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Get urgency badge configuration based on days until execution
 */
export function getUrgencyBadgeConfig(daysUntil: number | null): UrgencyConfig {
    if (daysUntil === null) {
        return {
            color: '#666',
            cssClass: 'urgency-normal',
            label: 'N/A'
        };
    }

    if (daysUntil < 0) {
        // Overdue
        return {
            color: '#d32f2f',
            cssClass: 'urgency-overdue',
            label: 'Atrasado'
        };
    } else if (daysUntil === 0) {
        // Today
        return {
            color: '#d32f2f',
            cssClass: 'urgency-overdue',
            label: 'Hoje'
        };
    } else if (daysUntil <= 7) {
        // This week
        return {
            color: '#ff9800',
            cssClass: 'urgency-soon',
            label: `${daysUntil}d`
        };
    } else {
        // Normal
        return {
            color: '#4caf50',
            cssClass: 'urgency-normal',
            label: `${daysUntil}d`
        };
    }
}

// ============================================
// STATISTICS CALCULATIONS
// ============================================

/**
 * Calculate statistics from an array of intervention plans
 */
export function calculatePlanStats(plans: InterventionPlan[]): PlanStatistics {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const stats: PlanStatistics = {
        totalPlans: plans.length,
        pendingInterventions: 0,
        thisWeek: 0,
        thisMonth: 0,
        byType: {
            poda: 0,
            supressao: 0,
            transplante: 0,
            tratamento: 0,
            monitoramento: 0
        }
    };

    plans.forEach(plan => {
        // Count by type
        stats.byType[plan.intervention_type]++;

        // Analyze schedule dates
        const scheduleDateStr = extractScheduleDate(plan.schedule);
        if (scheduleDateStr) {
            // Parse strictly as local time
            const [year, month, day] = scheduleDateStr.split('-').map(Number);
            const scheduleDate = new Date(year, month - 1, day);
            scheduleDate.setHours(0, 0, 0, 0);

            // Only count future interventions
            if (scheduleDate >= now) {
                stats.pendingInterventions++;

                if (scheduleDate <= oneWeek) {
                    stats.thisWeek++;
                }

                if (scheduleDate <= oneMonth) {
                    stats.thisMonth++;
                }
            }
        }
    });

    return stats;
}

// ============================================
// DURATION CALCULATIONS
// ============================================

/**
 * Get total duration of a plan in days
 */
export function getPlanDuration(durations: PlanDurations | null | undefined): number {
    if (!durations) return 1; // Default: 1 day

    return (
        (durations.mobilization || 0) +
        (durations.execution || 0) +
        (durations.demobilization || 0)
    ) || 1; // Minimum 1 day
}

/**
 * Calculate end date from start date and duration
 */
export function calculateEndDate(startDate: string, durations: PlanDurations | null | undefined): string {
    const start = new Date(startDate);
    const duration = getPlanDuration(durations);

    const end = new Date(start);
    end.setDate(end.getDate() + duration);

    return end.toISOString().split('T')[0];
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate plan schedule dates
 */
export function isValidSchedule(schedule: PlanSchedule): boolean {
    const startDate = extractScheduleDate(schedule);
    const endDate = extractScheduleEndDate(schedule);

    if (!startDate) return false;

    if (endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return end >= start;
    }

    return true;
}

/**
 * Check if a date string is in the past
 */
export function isDateInPast(dateStr: string): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    return date < now;
}

// ============================================
// SORTING & FILTERING
// ============================================

/**
 * Sort plans by schedule date (ascending)
 */
export function sortPlansByDate(plans: InterventionPlan[]): InterventionPlan[] {
    return [...plans].sort((a, b) => {
        const dateA = extractScheduleDate(a.schedule) || '9999-12-31';
        const dateB = extractScheduleDate(b.schedule) || '9999-12-31';
        return dateA.localeCompare(dateB);
    });
}

/**
 * Filter plans by intervention type
 */
export function filterPlansByType(
    plans: InterventionPlan[],
    type: InterventionType | 'all'
): InterventionPlan[] {
    if (type === 'all') return plans;
    return plans.filter(p => p.intervention_type === type);
}

/**
 * Search plans by text (plan_id, justification, responsible)
 */
export function searchPlans(plans: InterventionPlan[], searchTerm: string): InterventionPlan[] {
    if (!searchTerm) return plans;

    const term = searchTerm.toLowerCase();
    return plans.filter(plan =>
        plan.plan_id.toLowerCase().includes(term) ||
        plan.justification?.toLowerCase().includes(term) ||
        plan.responsible?.toLowerCase().includes(term)
    );
}
