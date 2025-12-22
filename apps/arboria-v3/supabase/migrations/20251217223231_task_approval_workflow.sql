-- Migration: Task Approval Workflow (Fix)
-- Epic: 3
-- Description: Adds 'PENDING_APPROVAL' status, 'rejection_reason' column, and RPCs. Fixes constraint.

-- 1. UTILITIES
CREATE OR REPLACE FUNCTION public.check_user_is_manager(p_user_id uuid, p_instalacao_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.instalacao_membros im
    WHERE im.instalacao_id = p_instalacao_id
    AND im.user_id = p_user_id
    AND EXISTS (
      SELECT 1 FROM public.perfis p
      WHERE p.id = ANY(im.perfis)
      AND p.nome IN ('Gestor', 'Mestre', 'Planejador')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. UPDATE TASKS TABLE

-- Drop existing constraints
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS valid_start;

-- Add new column
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Re-add constraints
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check 
  CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED', 'BLOCKED', 'CANCELLED'));

-- Fix: Allow CANCELLED to NOT require started_at
ALTER TABLE public.tasks ADD CONSTRAINT valid_start 
  CHECK (
    (status IN ('IN_PROGRESS', 'PENDING_APPROVAL', 'COMPLETED', 'BLOCKED') AND started_at IS NOT NULL) OR 
    (status IN ('NOT_STARTED', 'CANCELLED'))
  );

-- 3. RPCs
CREATE OR REPLACE FUNCTION public.approve_task(p_task_id uuid, p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_task public.tasks%ROWTYPE;
  v_is_manager boolean;
BEGIN
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Task not found'; END IF;

  v_is_manager := public.check_user_is_manager(p_user_id, v_task.instalacao_id);
  IF NOT v_is_manager THEN RAISE EXCEPTION 'Permission denied'; END IF;

  IF v_task.status != 'PENDING_APPROVAL' THEN RAISE EXCEPTION 'Task not pending approval'; END IF;

  UPDATE public.tasks SET status = 'COMPLETED', rejection_reason = NULL, updated_at = now() WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.reject_task(p_task_id uuid, p_user_id uuid, p_reason text)
RETURNS void AS $$
DECLARE
  v_task public.tasks%ROWTYPE;
  v_is_manager boolean;
BEGIN
  IF p_reason IS NULL OR trim(p_reason) = '' THEN RAISE EXCEPTION 'Reason required'; END IF;

  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Task not found'; END IF;

  v_is_manager := public.check_user_is_manager(p_user_id, v_task.instalacao_id);
  IF NOT v_is_manager THEN RAISE EXCEPTION 'Permission denied'; END IF;

  IF v_task.status NOT IN ('PENDING_APPROVAL', 'COMPLETED') THEN RAISE EXCEPTION 'Cannot reject status %', v_task.status; END IF;

  UPDATE public.tasks 
  SET status = 'IN_PROGRESS', rejection_reason = p_reason, completed_at = NULL, updated_at = now() 
  WHERE id = p_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
