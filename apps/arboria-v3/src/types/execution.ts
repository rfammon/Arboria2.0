import type { Tree } from './tree';

// =====================================================
// TASK STATUS & PRIORITY
// =====================================================

/**
 * Task execution status
 * - NOT_STARTED: Task not yet begun
 * - IN_PROGRESS: Task being executed
 * - COMPLETED: Task finished
 * - BLOCKED: Task blocked by external factors
 * - CANCELLED: Task cancelled
 * - PENDING_APPROVAL: Task finished by executante, waiting for manager approval
 */
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'CANCELLED' | 'PENDING_APPROVAL';

/**
 * Task priority level
 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Evidence collection stage (5-stage photo system)
 * - none: No evidence collected yet
 * - before: "Before" photo captured
 * - during: "During" photos captured
 * - after: "After" photo captured
 * - completed: Final completion photo captured
 */
export type EvidenceStage = 'none' | 'before' | 'during' | 'during_1' | 'during_2' | 'after' | 'completed' | 'completion';

/**
 * Individual evidence photo stage
 */
export type EvidencePhotoStage = 'before' | 'during_1' | 'during_2' | 'after' | 'completion';

/**
 * Alert types for safety and incidents
 */
export type AlertType = 'SOS' | 'HELP' | 'EQUIPMENT_FAILURE' | 'SAFETY_ISSUE' | 'BLOCKAGE' | 'OTHER' | 'ENVIRONMENTAL' | 'TECHNICAL' | 'OPERATIONAL';

/**
 * Intervention type (matches plan module)
 */
export type InterventionType =
    | 'poda'           // Pruning
    | 'supressao'      // Removal
    | 'transplante'    // Transplant
    | 'tratamento'     // Treatment
    | 'monitoramento'; // Monitoring

// =====================================================
// WORK ORDER
// =====================================================

/**
 * Work Order - Groups multiple tasks for execution
 */
export interface WorkOrder {
    id: string;
    instalacao_id: string;
    plan_id?: string; // Link to intervention plan
    title: string;
    description?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    assigned_to?: string; // Primary executante
    due_date?: string; // ISO date
    created_at: string;
    updated_at: string;
    created_by?: string;

    // Hydrated relations (when joined)
    tasks?: Task[];
}

// =====================================================
// TASK
// =====================================================

/**
 * Execution Task - Individual field work item
 */
export interface Task {
    id: string;
    instalacao_id: string;
    work_order_id: string;
    tree_id: string;

    // Task details
    intervention_type: InterventionType;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    rejection_reason?: string;

    // Assignment
    assigned_to?: string;
    assignee_name?: string; // Hydrated name
    team_members?: string[]; // User IDs for team mode

    // GPS & Location
    tree_lat?: number;
    tree_lng?: number;

    // Progress tracking
    progress_percent: number; // 0-100
    started_at?: string; // ISO timestamp
    completed_at?: string; // ISO timestamp

    // Evidence
    evidence_stage: EvidenceStage;

    // Notes
    notes?: string;

    // Timestamps
    created_at: string;
    updated_at: string;

    // Hydrated relations (when joined)
    tree?: Tree;
    work_order?: WorkOrder;
    evidence?: TaskEvidence[];
    progress_log?: TaskProgressLog[];
}

// =====================================================
// TASK EVIDENCE
// =====================================================

/**
 * Photo metadata captured with each evidence photo
 */
export interface PhotoMetadata {
    lat?: number;
    lng?: number;
    timestamp: string; // ISO timestamp
    device?: string;
    resolution?: string; // e.g. "1920x1080"
    file_size_kb?: number;
    compressed?: boolean;
}

/**
 * Task Evidence - Photographic evidence for execution
 */
export interface TaskEvidence {
    id: string;
    task_id: string;
    stage: EvidencePhotoStage;

    // Photo storage
    photo_url: string; // Supabase Storage URL
    photo_thumbnail_url?: string;

    // Metadata
    photo_metadata?: PhotoMetadata;
    notes?: string;

    // Timestamps
    captured_at: string;
    uploaded_at?: string; // Set when synced from offline
    captured_by?: string; // User ID

    // Location at capture
    capture_lat?: number;
    capture_lng?: number;
}

// =====================================================
// TASK PROGRESS LOG
// =====================================================

/**
 * Historical log of task progress updates
 */
export interface TaskProgressLog {
    id: string;
    task_id: string;
    user_id: string;
    progress_percent: number;
    notes?: string;
    logged_at: string;
}

// =====================================================
// TASK ALERT
// =====================================================

/**
 * Safety alert or incident report
 */
export interface TaskAlert {
    id: string;
    task_id?: string; // Optional - may be general alert
    user_id: string;
    alert_type: AlertType;
    message: string;

    // Location
    location_lat?: number;
    location_lng?: number;

    // Resolution
    resolved: boolean;
    resolved_at?: string;
    resolved_by?: string;
    resolution_notes?: string;

    created_at: string;
}

// =====================================================
// FILTERS & QUERIES
// =====================================================

/**
 * Filters for task list queries
 */
export interface TaskFilters {
    status?: TaskStatus | 'all';
    priority?: TaskPriority | 'all';
    intervention_type?: InterventionType | 'all';
    assigned_to?: string;
    date_from?: string; // ISO date
    date_to?: string; // ISO date
    search?: string; // Search in description/notes
    work_order_id?: string;
}

/**
 * Sorting options for task list
 */
export interface TaskSort {
    field: 'priority' | 'created_at' | 'due_date' | 'progress' | 'distance';
    direction: 'asc' | 'desc';
}

/**
 * Geolocation position
 */
export interface GeolocationPosition {
    latitude: number;
    longitude: number;
    accuracy?: number; // meters
    timestamp: number;
}

// =====================================================
// FORM DATA
// =====================================================

/**
 * Form data for creating/updating a task
 */
export interface TaskFormData {
    work_order_id: string;
    tree_id: string;
    intervention_type: InterventionType;
    description?: string;
    priority: TaskPriority;
    assigned_to?: string;
    team_members?: string[];
    tree_lat?: number;
    tree_lng?: number;
}

/**
 * Form data for task execution (evidence + notes)
 */
export interface TaskExecutionData {
    task_id: string;
    evidence: EvidenceData[];
    progress_updates: ProgressUpdateData[];
    final_notes?: string;
}

/**
 * Evidence data for submission
 */
export interface EvidenceData {
    stage: EvidencePhotoStage;
    photo: Blob | File;
    notes?: string;
    metadata?: Partial<PhotoMetadata>;
}

/**
 * Progress update data
 */
export interface ProgressUpdateData {
    progress_percent: number;
    notes?: string;
    timestamp: string;
}

// =====================================================
// STATISTICS
// =====================================================

/**
 * Execution statistics for dashboard
 */
export interface ExecutionStatistics {
    total_tasks: number;
    not_started: number;
    in_progress: number;
    completed: number;
    blocked: number;
    completed_today: number;
    completed_this_week: number;
    completed_this_month: number;
    average_completion_hours?: number;
    active_alerts: number;
    by_priority: Record<TaskPriority, number>;
    by_intervention_type: Record<InterventionType, number>;
}

/**
 * Real-time execution status (for dashboard)
 */
export interface ExecutionStatus {
    active_executantes: number;
    tasks_in_progress: number;
    tasks_completed_today: number;
    pending_alerts: number;
    last_activity?: string; // ISO timestamp
}

