-- Migration: Add status to intervention_plans and fix reopen_work_order
-- Created: 2025-12-18

-- 1. Add status column to intervention_plans if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'intervention_plans' AND column_name = 'status') THEN
        ALTER TABLE public.intervention_plans ADD COLUMN status text CHECK (status IN ('DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'DRAFT';
    END IF;
END $$;

-- 2. Ensure existing plans have a status (set to APPROVED if they have work orders, or DRAFT)
UPDATE public.intervention_plans
SET status = 'IN_PROGRESS'
WHERE status = 'DRAFT' AND EXISTS (SELECT 1 FROM public.work_orders WHERE plan_id = intervention_plans.id);

UPDATE public.intervention_plans
SET status = 'APPROVED'
WHERE status = 'DRAFT' AND NOT EXISTS (SELECT 1 FROM public.work_orders WHERE plan_id = intervention_plans.id);

-- 3. Update reopen_work_order RPC to be more robust
CREATE OR REPLACE FUNCTION public.reopen_work_order(
  p_work_order_id uuid,
  p_reason text,
  p_new_start_date timestamptz DEFAULT NULL,
  p_new_due_date timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status text;
  v_instalacao_id uuid;
  v_plan_id uuid;
  v_user_id uuid := auth.uid();
  v_is_manager boolean;
BEGIN
  -- 1. Check if Work Order exists and get current details
  SELECT status, instalacao_id, plan_id
  INTO v_current_status, v_instalacao_id, v_plan_id
  FROM public.work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Ordem de Serviço não encontrada.');
  END IF;

  -- 2. Verify User Permission
  SELECT public.check_user_is_manager(v_user_id, v_instalacao_id) INTO v_is_manager;

  IF NOT v_is_manager THEN
     RETURN jsonb_build_object('success', false, 'message', 'Permissão negada. Apenas Gestores e Planejadores podem reabrir O.S.');
  END IF;

  -- 3. Check status
  IF v_current_status NOT IN ('COMPLETED', 'CANCELLED') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Apenas O.S. concluídas ou canceladas podem ser reabertas.');
  END IF;

  -- 4. Update Work Order
  UPDATE public.work_orders
  SET 
    status = 'IN_PROGRESS',
    description = COALESCE(description, '') || E'\n\n[Reabertura ' || to_char(now(), 'DD/MM/YYYY HH24:MI') || '] Motivo: ' || p_reason,
    due_date = COALESCE(p_new_due_date, due_date),
    updated_at = now()
  WHERE id = p_work_order_id;

  -- 5. Update parent Plan if exists
  IF v_plan_id IS NOT NULL THEN
     UPDATE public.intervention_plans
     SET 
        status = 'IN_PROGRESS',
        updated_at = now()
     WHERE id = v_plan_id;
  END IF;

  -- 6. Reset all tasks in this WO
  UPDATE public.tasks
  SET 
    status = 'IN_PROGRESS',
    progress_percent = 0,
    started_at = COALESCE(p_new_start_date, now()),
    completed_at = NULL,
    rejection_reason = NULL,
    updated_at = now()
  WHERE work_order_id = p_work_order_id;

  -- 7. Notify
  -- Assuming notify_assignee_of_task exists and works
  -- (Verified in previous migration 20251217_reopen_work_order_rpc.sql)
  PERFORM public.notify_assignee_of_task(
    (SELECT id FROM public.tasks WHERE work_order_id = p_work_order_id LIMIT 1), 
    'WARNING', 
    'Ordem de Serviço Reaberta', 
    'A O.S. foi reaberta. Motivo: ' || p_reason
  );

  RETURN jsonb_build_object('success', true, 'message', 'Ordem de Serviço reaberta com sucesso.');

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'message', 'Erro ao reabrir O.S: ' || SQLERRM);
END;
$$;
