-- Migration to add reopen_work_order RPC function
-- Created: 2025-12-17

-- Function to reopen a closed/cancelled Work Order
-- Only accessible by Gestor, Mestre, or Planejador
CREATE OR REPLACE FUNCTION public.reopen_work_order(
  p_work_order_id uuid,
  p_reason text,
  p_new_start_date timestamptz DEFAULT NULL,
  p_new_due_date timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres) to bypass RLS for checking permissions more easily if needed, but we'll use RLS compatible checks
AS $$
DECLARE
  v_current_status text;
  v_instalacao_id uuid;
  v_user_id uuid := auth.uid();
  v_is_manager boolean;
BEGIN
  -- 1. Check if Work Order exists and get current details
  SELECT status, instalacao_id
  INTO v_current_status, v_instalacao_id
  FROM public.work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ordem de Serviço não encontrada.');
  END IF;

  -- 2. Verify User Permission (Gestor, Mestre, Planejador of the same installation)
  SELECT EXISTS (
    SELECT 1 FROM public.instalacao_membros im
    WHERE im.instalacao_id = v_instalacao_id
    AND im.user_id = v_user_id
    AND EXISTS (
      SELECT 1 FROM public.perfis p
      WHERE p.id = ANY(im.perfis)
      AND p.nome IN ('Gestor', 'Mestre', 'Planejador')
    )
  ) INTO v_is_manager;

  IF NOT v_is_manager THEN
     RETURN jsonb_build_object('success', false, 'message', 'Permissão negada. Apenas Gestores e Planejadores podem reabrir O.S.');
  END IF;

  -- 3. Check if status allows reopening (COMPLETED or CANCELLED)
  IF v_current_status NOT IN ('COMPLETED', 'CANCELLED') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Apenas O.S. concluídas ou canceladas podem ser reabertas.');
  END IF;

  -- 4. Update Work Order
  UPDATE public.work_orders
  SET 
    status = 'IN_PROGRESS',
    description = description || E'\n\n[Reabertura ' || to_char(now(), 'DD/MM/YYYY HH24:MI') || '] Motivo: ' || p_reason, -- Append log to description for simplicity
    due_date = COALESCE(p_new_due_date, due_date),
    updated_at = now()
  WHERE id = p_work_order_id;

  -- 5. (Optional) Reopen Plan Schedule if provided
    -- If dates are provided, we might want to update the Plan schedule too? 
    -- For now, let's just stick to updating the Work Order. 
    -- If the Work Order IS the schedule execution, maybe we should update the plan?
    -- The Plan is the parent. If WO is reopened, Plan is effectively In Progress again.
  
  UPDATE public.intervention_plans
  SET status = 'IN_PROGRESS'
  WHERE id = (SELECT plan_id FROM public.work_orders WHERE id = p_work_order_id)
  AND status IN ('COMPLETED', 'CANCELLED');

  -- 6. Reset associated Tasks to IN_PROGRESS so they appear in execution module
  -- 6. Reset associated Tasks to IN_PROGRESS so they appear in execution module
  UPDATE public.tasks t
  SET 
    status = 'IN_PROGRESS',
    progress_percent = 0,
    started_at = COALESCE(started_at, now()),
    completed_at = NULL,
    rejection_reason = NULL,
    updated_at = now(),
    -- Restore assignee from logs if null (Copied from previous fix)
    assigned_to = COALESCE(
      t.assigned_to,
      (
        SELECT user_id 
        FROM public.task_progress_log 
        WHERE task_id = t.id 
        ORDER BY logged_at DESC 
        LIMIT 1
      )
    )
  WHERE work_order_id = p_work_order_id;

  -- 7. Notify Assignees
  DECLARE
      r_task RECORD;
  BEGIN
      FOR r_task IN SELECT id FROM public.tasks WHERE work_order_id = p_work_order_id LOOP
          PERFORM public.notify_assignee_of_task(
            r_task.id, 
            'WARNING', 
            'Ordem de Serviço Reaberta', 
            'A O.S. foi reaberta. Motivo: ' || p_reason,
            jsonb_build_object('reason', p_reason)
          );
      END LOOP;
  END;

  RETURN jsonb_build_object('success', true, 'message', 'Ordem de Serviço reaberta com sucesso.');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'Erro interno ao reabrir O.S: ' || SQLERRM);
END;
$$;
