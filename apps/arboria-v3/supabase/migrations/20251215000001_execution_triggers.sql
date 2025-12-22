-- =====================================================
-- EXECUTION MODULE - Triggers and Functions
-- Epic 1: Automated workflows and statistics
-- Created: 2025-12-15
-- =====================================================

-- =====================================================
-- 1. AUTO-UPDATE WORK ORDER STATUS
-- =====================================================

-- Function to automatically update work_order status based on tasks
CREATE OR REPLACE FUNCTION public.update_work_order_status()
RETURNS TRIGGER AS $$
DECLARE
  v_total_tasks integer;
  v_completed_tasks integer;
  v_in_progress_tasks integer;
  v_new_status text;
BEGIN
  -- Count tasks for this work order
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'COMPLETED'),
    COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')
  INTO v_total_tasks, v_completed_tasks, v_in_progress_tasks
  FROM public.tasks
  WHERE work_order_id = COALESCE(NEW.work_order_id, OLD.work_order_id);
  
  -- Determine new status
  IF v_total_tasks = 0 THEN
    v_new_status := 'OPEN';
  ELSIF v_completed_tasks = v_total_tasks THEN
    v_new_status := 'COMPLETED';
  ELSIF v_in_progress_tasks > 0 OR v_completed_tasks > 0 THEN
    v_new_status := 'IN_PROGRESS';
  ELSE
    v_new_status := 'OPEN';
  END IF;
  
  -- Update work order if status changed
  UPDATE public.work_orders
  SET 
    status = v_new_status,
    updated_at = now()
  WHERE id = COALESCE(NEW.work_order_id, OLD.work_order_id)
  AND status != v_new_status;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on task INSERT/UPDATE/DELETE
CREATE TRIGGER task_status_update_trigger
AFTER INSERT OR UPDATE OF status OR DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_work_order_status();

COMMENT ON FUNCTION public.update_work_order_status IS 'Auto-updates work order status based on task statuses';

-- =====================================================
-- 2. AUTO-UPDATE TASK EVIDENCE STAGE
-- =====================================================

-- Function to update task evidence_stage when evidence is uploaded
CREATE OR REPLACE FUNCTION public.update_task_evidence_stage()
RETURNS TRIGGER AS $$
DECLARE
  v_has_before boolean;
  v_has_during boolean;
  v_has_after boolean;
  v_has_completion boolean;
  v_new_stage text;
BEGIN
  -- Check which stages have evidence
  SELECT 
    EXISTS(SELECT 1 FROM public.task_evidence WHERE task_id = NEW.task_id AND stage = 'before'),
    EXISTS(SELECT 1 FROM public.task_evidence WHERE task_id = NEW.task_id AND stage IN ('during_1', 'during_2')),
    EXISTS(SELECT 1 FROM public.task_evidence WHERE task_id = NEW.task_id AND stage = 'after'),
    EXISTS(SELECT 1 FROM public.task_evidence WHERE task_id = NEW.task_id AND stage = 'completion')
  INTO v_has_before, v_has_during, v_has_after, v_has_completion;
  
  -- Determine evidence stage
  IF v_has_completion THEN
    v_new_stage := 'completed';
  ELSIF v_has_after THEN
    v_new_stage := 'after';
  ELSIF v_has_during THEN
    v_new_stage := 'during';
  ELSIF v_has_before THEN
    v_new_stage := 'before';
  ELSE
    v_new_stage := 'none';
  END IF;
  
  -- Update task
  UPDATE public.tasks
  SET evidence_stage = v_new_stage
  WHERE id = NEW.task_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on evidence INSERT
CREATE TRIGGER task_evidence_stage_update_trigger
AFTER INSERT ON public.task_evidence
FOR EACH ROW
EXECUTE FUNCTION public.update_task_evidence_stage();

COMMENT ON FUNCTION public.update_task_evidence_stage IS 'Auto-updates task evidence_stage field when evidence is uploaded';

-- =====================================================
-- 3. AUTO-START TASK ON FIRST PROGRESS LOG
-- =====================================================

-- Function to auto-start task when first progress is logged
CREATE OR REPLACE FUNCTION public.auto_start_task_on_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- If task not started yet, mark as started
  UPDATE public.tasks
  SET 
    status = 'IN_PROGRESS',
    started_at = COALESCE(started_at, now())
  WHERE id = NEW.task_id
  AND status = 'NOT_STARTED';
  
  -- Also update progress_percent on task
  UPDATE public.tasks
  SET progress_percent = NEW.progress_percent
  WHERE id = NEW.task_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on progress log INSERT
CREATE TRIGGER auto_start_task_trigger
AFTER INSERT ON public.task_progress_log
FOR EACH ROW
EXECUTE FUNCTION public.auto_start_task_on_progress();

COMMENT ON FUNCTION public.auto_start_task_on_progress IS 'Auto-starts task when first progress is logged';

-- =====================================================
-- 4. SOS ALERT NOTIFICATIONS
-- =====================================================

-- Function to notify Gestores when SOS alert is created
CREATE OR REPLACE FUNCTION public.notify_gestores_on_sos()
RETURNS TRIGGER AS $$
DECLARE
  v_instalacao_id uuid;
  v_task_description text;
BEGIN
  -- Get instalacao_id from task (or NULL if alert is not task-specific)
  IF NEW.task_id IS NOT NULL THEN
    SELECT instalacao_id, description
    INTO v_instalacao_id, v_task_description
    FROM public.tasks
    WHERE id = NEW.task_id;
  END IF;
  
  -- If we have an instalacao, notify all Gestores/Mestre
  IF v_instalacao_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data, read)
    SELECT 
      im.user_id,
      'ALERT',
      'ALERTA ' || NEW.alert_type || ' - Executante em Campo',
      CASE 
        WHEN NEW.alert_type = 'SOS' THEN 'Um executante acionou SOS. Verifique imediatamente!'
        WHEN NEW.alert_type = 'HELP' THEN 'Um executante precisa de ajuda.'
        WHEN NEW.alert_type = 'EQUIPMENT_FAILURE' THEN 'Falha de equipamento reportada.'
        WHEN NEW.alert_type = 'SAFETY_ISSUE' THEN 'Problema de segurança reportado.'
      END,
      jsonb_build_object(
        'alert_id', NEW.id,
        'alert_type', NEW.alert_type,
        'task_id', NEW.task_id,
        'task_description', v_task_description,
        'location', jsonb_build_object('lat', NEW.location_lat, 'lng', NEW.location_lng),
        'message', NEW.message,
        'user_id', NEW.user_id
      ),
      false
    FROM public.instalacao_membros im
    WHERE im.instalacao_id = v_instalacao_id
    AND EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = ANY(im.perfis) 
      AND p.nome IN ('Gestor', 'Mestre')
    )
    AND im.user_id != NEW.user_id; -- Don't notify the alerter
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on alert INSERT
CREATE TRIGGER sos_alert_notification_trigger
AFTER INSERT ON public.task_alerts
FOR EACH ROW
EXECUTE FUNCTION public.notify_gestores_on_sos();

COMMENT ON FUNCTION public.notify_gestores_on_sos IS 'Sends notifications to Gestores/Mestre when any alert is created';

-- =====================================================
-- 5. EXECUTION STATISTICS FUNCTION
-- =====================================================

-- Function to calculate execution statistics for an installation
CREATE OR REPLACE FUNCTION public.get_execution_statistics(p_instalacao_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_tasks', COUNT(*),
    'not_started', COUNT(*) FILTER (WHERE status = 'NOT_STARTED'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'IN_PROGRESS'),
    'completed', COUNT(*) FILTER (WHERE status = 'COMPLETED'),
    'blocked', COUNT(*) FILTER (WHERE status = 'BLOCKED'),
    'completed_today', COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at::date = CURRENT_DATE),
    'completed_this_week', COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at >= date_trunc('week', CURRENT_DATE)),
    'completed_this_month', COUNT(*) FILTER (WHERE status = 'COMPLETED' AND completed_at >= date_trunc('month', CURRENT_DATE)),
    'average_completion_hours', ROUND(AVG(EXTRACT(epoch FROM (completed_at - started_at)) / 3600)::numeric, 2) FILTER (WHERE completed_at IS NOT NULL AND started_at IS NOT NULL),
    'active_alerts', (
      SELECT COUNT(*) 
      FROM public.task_alerts ta
      JOIN public.tasks t ON t.id = ta.task_id
      WHERE t.instalacao_id = p_instalacao_id
      AND NOT ta.resolved
    ),
    'by_priority', (
      SELECT jsonb_object_agg(priority, count)
      FROM (
        SELECT priority, COUNT(*) as count
        FROM public.tasks
        WHERE instalacao_id = p_instalacao_id
        GROUP BY priority
      ) priority_counts
    ),
    'by_intervention_type', (
      SELECT jsonb_object_agg(intervention_type, count)
      FROM (
        SELECT intervention_type, COUNT(*) as count
        FROM public.tasks
        WHERE instalacao_id = p_instalacao_id
        GROUP BY intervention_type
      ) type_counts
    )
  )
  INTO v_stats
  FROM public.tasks
  WHERE instalacao_id = p_instalacao_id;
  
  RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_execution_statistics IS 'Calculates comprehensive execution statistics for dashboard';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_execution_statistics(uuid) TO authenticated;

-- =====================================================
-- 6. GET TASKS WITH FULL DETAILS
-- =====================================================

-- Function to get tasks with all related data (for executante view)
CREATE OR REPLACE FUNCTION public.get_my_tasks(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  task_id uuid,
  task_data jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as task_id,
    jsonb_build_object(
      'id', t.id,
      'work_order_id', t.work_order_id,
      'tree_id', t.tree_id,
      'intervention_type', t.intervention_type,
      'description', t.description,
      'status', t.status,
      'priority', t.priority,
      'assigned_to', t.assigned_to,
      'team_members', t.team_members,
      'tree_lat', t.tree_lat,
      'tree_lng', t.tree_lng,
      'progress_percent', t.progress_percent,
      'started_at', t.started_at,
      'completed_at', t.completed_at,
      'evidence_stage', t.evidence_stage,
      'notes', t.notes,
      'created_at', t.created_at,
      'updated_at', t.updated_at,
      'tree', (
        SELECT jsonb_build_object(
          'id', tr.id,
          'especie', tr.especie,
          'codigo', tr.codigo,
          'local', tr.local,
          'risklevel', tr.risklevel
        )
        FROM public.arvores tr
        WHERE tr.id = t.tree_id
      ),
      'work_order', (
        SELECT jsonb_build_object(
          'id', wo.id,
          'title', wo.title,
          'status', wo.status,
          'due_date', wo.due_date
        )
        FROM public.work_orders wo
        WHERE wo.id = t.work_order_id
      ),
      'evidence_count', (
        SELECT COUNT(*) FROM public.task_evidence WHERE task_id = t.id
      ),
      'latest_progress', (
        SELECT jsonb_build_object(
          'progress_percent', pl.progress_percent,
          'notes', pl.notes,
          'logged_at', pl.logged_at
        )
        FROM public.task_progress_log pl
        WHERE pl.task_id = t.id
        ORDER BY pl.logged_at DESC
        LIMIT 1
      )
    ) as task_data
  FROM public.tasks t
  WHERE t.assigned_to = p_user_id
  OR p_user_id = ANY(t.team_members)
  ORDER BY 
    CASE t.priority
      WHEN 'CRITICAL' THEN 1
      WHEN 'HIGH' THEN 2
      WHEN 'MEDIUM' THEN 3
      WHEN 'LOW' THEN 4
    END,
    t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_my_tasks IS 'Returns all tasks assigned to user with full details';

GRANT EXECUTE ON FUNCTION public.get_my_tasks(uuid) TO authenticated;

-- =====================================================
-- END OF TRIGGERS AND FUNCTIONS
-- =====================================================
