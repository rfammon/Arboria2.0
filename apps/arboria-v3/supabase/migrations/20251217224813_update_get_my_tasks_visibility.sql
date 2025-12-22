-- Migration: Allow Gestor/Planejador/Mestre to see all tasks in their installation
-- Supersedes previous get_my_tasks logic

CREATE OR REPLACE FUNCTION public.get_my_tasks(p_user_id uuid, p_instalacao_id uuid)
 RETURNS TABLE(task_data jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_is_manager boolean;
BEGIN
  -- If installation_id not provided, return empty
  IF p_instalacao_id IS NULL THEN
    RETURN;
  END IF;

  -- Check if user is Manager (Gestor, Mestre, Planejador)
  SELECT EXISTS (
    SELECT 1 FROM public.instalacao_membros im
    WHERE im.instalacao_id = p_instalacao_id
    AND im.user_id = p_user_id
    AND EXISTS (
        SELECT 1 FROM public.perfis p
        WHERE p.id = ANY(im.perfis)
        AND p.nome IN ('Gestor', 'Mestre', 'Planejador')
    )
  ) INTO v_is_manager;

  RETURN QUERY
  SELECT 
    jsonb_build_object(
      'id', t.id,
      'instalacao_id', t.instalacao_id,
      'work_order_id', t.work_order_id,
      'tree_id', t.tree_id,
      'intervention_type', t.intervention_type,
      'description', t.description,
      'status', t.status,
      'priority', t.priority,
      'assigned_to', t.assigned_to,
      'assignee_name', (
          SELECT up.nome 
          FROM public.user_profiles up 
          WHERE up.id = t.assigned_to
          LIMIT 1
      ),
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
          'due_date', wo.due_date,
          'description', wo.description
        )
        FROM public.work_orders wo
        WHERE wo.id = t.work_order_id
      ),
      'evidence_count', (
        SELECT COUNT(*) FROM public.task_evidence te WHERE te.task_id = t.id
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
    )::jsonb
  FROM public.tasks t
  WHERE t.instalacao_id = p_instalacao_id
    AND (
        v_is_manager = true
        OR t.assigned_to = p_user_id 
        OR p_user_id = ANY(t.team_members)
        OR (t.assigned_to IS NULL AND v_is_manager = true)
    )
  ORDER BY 
    CASE t.priority
      WHEN 'CRITICAL' THEN 1
      WHEN 'HIGH' THEN 2
      WHEN 'MEDIUM' THEN 3
      WHEN 'LOW' THEN 4
    END,
    t.created_at DESC;
END;
$function$;
