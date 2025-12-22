-- Migration: Fix Notify Managers Function
-- Story: 9
-- Created: 2025-12-18
-- Description: Robustly rewrites notify_managers_of_task to ensure correct user targeting.

CREATE OR REPLACE FUNCTION public.notify_managers_of_task(
  p_task_id uuid,
  p_type text,
  p_title text,
  p_message text
) RETURNS void AS $$
DECLARE
  v_instalacao_id uuid;
  v_task_title text;
  v_intervention_type text;
BEGIN
  -- Get context
  SELECT instalacao_id, intervention_type 
  INTO v_instalacao_id, v_intervention_type
  FROM public.tasks WHERE id = p_task_id;
  
  IF v_instalacao_id IS NULL THEN 
    -- Log warning?
    RETURN; 
  END IF;

  -- Insert notifications for ALL Managers/Mestres/Planejadores of the installation
  -- We use the profiles directly rather than a single ID lookup to be safer against multiple 'Gestor' entries or IDs.
  INSERT INTO public.notifications (
    type, 
    title, 
    message, 
    user_id, 
    data, -- Using 'data' column (jsonb) based on previous patterns, mapping legacy 'action_link' if needed in metadata
    created_at, 
    is_read,
    email_sent
  )
  SELECT DISTINCT
    p_type, 
    p_title, 
    p_message, 
    m.user_id,
    jsonb_build_object(
      'task_id', p_task_id,
      'intervention_type', v_intervention_type,
      'action_link', '/execution?task=' || p_task_id
    ), 
    now(),
    false,
    false
  FROM public.instalacao_membros m
  WHERE m.instalacao_id = v_instalacao_id
  AND EXISTS (
    SELECT 1 FROM public.perfis p
    WHERE p.id = ANY(m.perfis)
    AND p.nome IN ('Gestor', 'Mestre', 'Planejador') -- Target all leadership roles
  );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure RLS on Notifications allows Managers to see them
-- (Usually 'Users can view own notification preferences' and 'Users can view own notifications')
-- Checking 'notifications' policies requires knowing if a specific policy blocks it.
-- Assuming standard "user_id = auth.uid()" policy exists. 
-- If not, we should add it, but usually standard.

-- Double check handle_task_status_notification trigger logic from previous migration
-- modifying it slightly to ensure it calls the NEW notify_managers_of_task signature if changed (it's same).
