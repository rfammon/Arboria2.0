import { supabase } from '../lib/supabase';
import type {
    Task,
    TaskEvidence,
    TaskProgressLog,
    TaskAlert,
    TaskFilters,
    EvidenceStage,
    AlertType,
    ExecutionStatistics,
    GeolocationPosition
} from '../types/execution';

export const executionService = {
    /**
     * Fetch tasks for the current user or based on filters
     */
    async getTasks(filters?: TaskFilters) {
        let query = supabase
            .from('tasks')
            .select(`
        *,
        tree:arvores(*),
        work_order:work_orders(id, title, status, due_date, description)
      `)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        if (filters?.assigned_to) {
            query = query.eq('assigned_to', filters.assigned_to);
        }

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters?.priority && filters.priority !== 'all') {
            query = query.eq('priority', filters.priority);
        }

        if (filters?.work_order_id) {
            query = query.eq('work_order_id', filters.work_order_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Task[];
    },

    /**
     * Fetch a single task with all details
     */
    async getTaskById(taskId: string) {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        tree:arvores(*),
        work_order:work_orders(*),
        evidence:task_evidence(*),
        progress_logs:task_progress_log(*),
        alerts:task_alerts(*)
      `)
            .eq('id', taskId)
            .single();

        if (error) throw error;

        return data as Task & {
            evidence: TaskEvidence[],
            progress_logs: TaskProgressLog[],
            alerts: TaskAlert[]
        };
    },

    /**
     * Start a task execution
     */
    async startTask(taskId: string, _location?: GeolocationPosition) {
        const updates: any = {
            status: 'IN_PROGRESS',
            started_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;
        return data as Task;
    },

    /**
     * Update task progress
     */
    async logProgress(taskId: string, userId: string, percent: number, notes?: string, _location?: GeolocationPosition) {
        // 1. Insert progress log
        const { data: log, error: logError } = await supabase
            .from('task_progress_log')
            .insert({
                task_id: taskId,
                user_id: userId,
                progress_percent: percent,
                notes: notes
            })
            .select()
            .single();

        if (logError) throw logError;

        return log as TaskProgressLog;
    },

    /**
     * Upload evidence photo
     */
    async addEvidence(
        taskId: string,
        stage: EvidenceStage,
        photoUrl: string,
        metadata?: any,
        notes?: string,
        location?: GeolocationPosition
    ) {
        const { data, error } = await supabase
            .from('task_evidence')
            .insert({
                task_id: taskId,
                stage,
                photo_url: photoUrl,
                photo_metadata: metadata || {},
                notes,
                capture_lat: location?.latitude,
                capture_lng: location?.longitude
            })
            .select()
            .single();

        if (error) throw error;
        return data as TaskEvidence;
    },

    /**
     * Create an alert/SOS
     */
    async createAlert(
        taskId: string | null,
        userId: string,
        type: AlertType,
        message: string,
        location?: GeolocationPosition
    ) {
        const { data, error } = await supabase
            .from('task_alerts')
            .insert({
                task_id: taskId,
                user_id: userId,
                alert_type: type,
                message,
                location_lat: location?.latitude,
                location_lng: location?.longitude
            })
            .select()
            .single();

        if (error) throw error;
        return data as TaskAlert;
    },

    /**
     * Complete a task (Executor)
     * Sets status to PENDING_APPROVAL and records the completion timestamp/progress.
     */
    async completeTask(taskId: string, completionData: { notes?: string, progress?: number }) {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: 'PENDING_APPROVAL',
                completed_at: new Date().toISOString(),
                progress_percent: completionData.progress ?? 100,
                notes: completionData.notes
            })
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;
        return data as Task;
    },

    /**
     * Block a task
     */
    async blockTask(taskId: string, reason: string) {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: 'BLOCKED',
                notes: reason
            })
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;
        return data as Task;
    },

    /**
     * Get execution statistics for dashboard
     */
    async getStatistics(instalacaoId: string) {
        const { data, error } = await supabase
            .rpc('get_execution_statistics', { p_instalacao_id: instalacaoId });

        if (error) throw error;
        return data as ExecutionStatistics;
    },

    /**
     * Get my tasks with full details (RPC optimized)
     */
    async getMyTasks(userId: string, instalacaoId: string) {
        const { data, error } = await supabase
            .rpc('get_my_tasks', {
                p_user_id: userId,
                p_instalacao_id: instalacaoId
            });

        if (error) throw error;
        return (data || []).map((d: any) => d.task_data || d) as Task[];
    },

    /**
     * Create a Work Order (and Task) from an Intervention Plan
     */
    async createWorkOrderFromPlan(planId: string, userId: string, assignedTo?: string) {
        const { data, error } = await supabase
            .rpc('create_work_order_from_plan', {
                p_plan_uuid: planId,
                p_user_id: userId,
                p_assigned_to: assignedTo || null
            });

        if (error) throw error;
        return data as { work_order_id: string; task_id: string };
    },

    async cancelTask(taskId: string, reason: string, userId: string) {
        const { error } = await supabase.rpc('cancel_work_order', {
            p_task_id: taskId,
            p_reason: reason,
            p_user_id: userId
        });

        if (error) throw error;
    },

    /**
     * Reopen a closed/cancelled Work Order
     */
    async reopenWorkOrder(workOrderId: string, reason: string, newStartDate?: Date, newDueDate?: Date) {
        const { data, error } = await supabase.rpc('reopen_work_order', {
            p_work_order_id: workOrderId,
            p_reason: reason,
            p_new_start_date: newStartDate?.toISOString(),
            p_new_due_date: newDueDate?.toISOString()
        });

        if (error) throw error;
        return data as { success: boolean; message: string };
    },

    /**
     * Approve a task (Manager only)
     */
    async approveTask(taskId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .rpc('approve_task', {
                p_task_id: taskId,
                p_user_id: userId
            });

        if (error) throw error;
    },

    /**
     * Reject a task (Manager only)
     */
    async rejectTask(taskId: string, userId: string, reason: string): Promise<void> {
        const { error } = await supabase
            .rpc('reject_task', {
                p_task_id: taskId,
                p_user_id: userId,
                p_reason: reason
            });

        if (error) throw error;
    }
};
