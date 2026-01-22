// Intervention Planning Module - Type Definitions

import type { WorkOrder } from './execution';

/**
 * Type of intervention that can be performed on trees
 */
export type InterventionType =
    | 'poda'           // Pruning
    | 'supressao'      // Removal/Suppression
    | 'transplante'    // Transplant
    | 'tratamento'     // Treatment
    | 'monitoramento'; // Monitoring

/**
 * Status of the intervention plan
 */
export type PlanStatus = 'DRAFT' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Dependency type for task scheduling (MS Project style)
 * - FS: Finish-to-Start (successor starts after predecessor finishes)
 * - SS: Start-to-Start (successor starts when predecessor starts)
 * - FF: Finish-to-Finish (successor finishes when predecessor finishes)
 * - SF: Start-to-Finish (successor finishes when predecessor starts)
 */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

/**
 * Schedule structure for intervention plans
 * Supports multiple date field formats for backward compatibility
 */
export interface PlanSchedule {
    start?: string;      // ISO date string (YYYY-MM-DD)
    startDate?: string;  // Alternative format
    end?: string;        // ISO date string (YYYY-MM-DD)
    endDate?: string;    // Alternative format
}

/**
 * Duration breakdown for intervention execution
 */
export interface PlanDurations {
    mobilization?: number;    // Days needed for team/equipment mobilization
    execution?: number;       // Days needed for actual execution
    demobilization?: number;  // Days needed for cleanup/demobilization
}

/**
 * Team composition for resource planning
 */
export interface TeamComposition {
    helpers: number;        // Auxiliares
    supervisors: number;    // Encarregados
    chainsaw_operators: number; // Motosserristas
}

/**
 * Main intervention plan interface
 */
export interface InterventionPlan {
    id: string;                           // UUID
    plan_id: string;                      // Human-readable ID (PI-YYYY-NNN)
    instalacao_id: string;                // Installation/tenant UUID
    user_id: string;                      // Creator user UUID
    status: PlanStatus;                   // Current plan status

    // Core plan data
    intervention_type: InterventionType;
    schedule: PlanSchedule;
    justification?: string;
    responsible?: string;                 // Person responsible for execution
    responsible_title?: string;           // Job title/role

    // Relations
    tree_id?: string;                     // Associated tree UUID
    tree?: {                              // Joined tree data
        id: string;
        especie?: string;
        codigo?: string; // fallback if needed
        local?: string;
        risklevel?: string;
        latitude?: number;
        longitude?: number;
    };

    // Resources
    techniques?: string[];                // Array of techniques to apply
    tools?: string[];                     // Required tools
    epis?: string[];                      // Personal Protective Equipment

    // Team & timing
    team_composition?: TeamComposition;
    durations?: PlanDurations;

    // Execution & Closing
    waste_destination?: string;           // Destination of organic waste
    custom_waste?: string;                // Specific destination if 'Outro'

    // Metadata
    created_at: string;                   // ISO timestamp
    updated_at: string;                   // ISO timestamp

    // Scheduling
    dependencies?: string[];              // Array of plan_ids this plan depends on

    // Execution Data (Joined)
    work_orders?: WorkOrder[];

    // Computed Progress (Optional)
    progress?: number;
}

/**
 * Plan dependency relationship
 */
export interface PlanDependency {
    id: string;
    instalacao_id: string;
    from_plan_id: string;                 // Predecessor plan UUID
    to_plan_id: string;                   // Successor plan UUID
    dependency_type: DependencyType;
    lag_days: number;                     // Lag/lead time in days (can be negative)
    created_at: string;
}

/**
 * Statistics calculated from plans
 */
export interface PlanStatistics {
    totalPlans: number;
    pendingInterventions: number;         // Future interventions
    thisWeek: number;                     // Interventions scheduled this week
    thisMonth: number;                    // Interventions scheduled this month
    byType: Record<InterventionType, number>;
}

/**
 * Urgency configuration for UI badges
 */
export interface UrgencyConfig {
    color: string;                        // Hex color code
    cssClass: string;                     // CSS class name
    label: string;                        // Display label
}

/**
 * Form data for creating/editing a plan
 */
export interface PlanFormData {
    intervention_type: InterventionType;
    tree_id: string; // Required now
    schedule: PlanSchedule;
    justification?: string;
    responsible?: string;
    responsible_title?: string;
    security_procedures?: string;
    techniques?: string[];
    tools?: string[];
    epis?: string[];
    team_composition?: TeamComposition;
    durations?: PlanDurations;
    waste_destination?: string;
    custom_waste?: string;
}


/**
 * Filter options for plan list
 */
export interface PlanFilters {
    interventionType?: InterventionType | 'all';
    dateFrom?: string;
    dateTo?: string;
    responsible?: string;
    searchTerm?: string;
}

/**
 * Gantt chart task representation
 */
export interface GanttTask {
    id: string;
    text: string;
    start_date: Date;
    end_date: Date;
    progress: number;                     // 0-1 (0% to 100%)
    color: string;
    type: 'task' | 'milestone';
    parent: string | null;
    plan: InterventionPlan;
}
