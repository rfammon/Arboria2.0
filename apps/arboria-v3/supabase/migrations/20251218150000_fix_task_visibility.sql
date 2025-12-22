-- Migration: Fix Task Visibility for Managers
-- Story: 9
-- Created: 2025-12-18
-- Description: Updates get_my_tasks RPC to allow managers to see all tasks in their installation.

-- 1. Helper function to get user installations (if not already exists or reliable)
-- Assuming we have check_user_is_manager(user_id, instalacao_id) but get_my_tasks iterates tasks.
-- Efficient way: Get list of installations where user is manager, then select tasks.

CREATE OR REPLACE FUNCTION public.get_user_managed_installations(p_user_id uuid)
RETURNS uuid[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT instalacao_id
    FROM public.instalacao_membros
    WHERE user_id = p_user_id
    AND EXISTS (
      SELECT 1 FROM public.perfis p
      WHERE p.id = ANY(perfis)
      AND p.nome IN ('Gestor', 'Mestre', 'Planejador')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update get_my_tasks RPC
CREATE OR REPLACE FUNCTION public.get_my_tasks(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE (
  task_id uuid,
  task_data jsonb
) AS $$
DECLARE
  v_managed_installations uuid[];
BEGIN
  -- Get installations where user is manager
  v_managed_installations := public.get_user_managed_installations(p_user_id);

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
      'assignee_name', (SELECT nome FROM public.users WHERE id = t.assigned_to), -- Helper for UI
      'team_members', t.team_members,
      'tree_lat', t.tree_lat,
      'tree_lng', t.tree_lng,
      'progress_percent', t.progress_percent,
      'started_at', t.started_at,
      'completed_at', t.completed_at,
      'evidence_stage', t.evidence_stage,
      'notes', t.notes,
      'rejection_reason', t.rejection_reason, -- Added for context
      'created_at', t.created_at,
      'updated_at', t.updated_at,
      'tree', (
        SELECT jsonb_build_object(
          'id', tr.id,
          'especie', tr.especie,
          'codigo', tr.codigo,
          'local', tr.local,
          'risklevel', tr.risklevel,
          'latitude', tr.latitude,
          'longitude', tr.longitude
        )
        FROM public.arvores tr
        WHERE tr.id = t.tree_id
      ),
      'work_order', (
        SELECT jsonb_build_object(
          'id', wo.id,
          'title', wo.title,
          'status', wo.status,
          'due_date', wo.due_date,
          'description', wo.description
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
  WHERE 
    -- 1. Assigned to user
    t.assigned_to = p_user_id
    -- 2. User is team member
    OR p_user_id = ANY(t.team_members)
    -- 3. User is Manager of the installation (NEW)
    OR t.instalacao_id = ANY(v_managed_installations)
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
