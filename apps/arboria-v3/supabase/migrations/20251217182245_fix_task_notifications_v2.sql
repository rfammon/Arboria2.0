-- Fix for notify_managers_of_task using correct columns and types
-- Based on error: null value in column "title" of relation "notifications"
-- And recent changes moving from 'action_link' to 'metadata'

-- 1. Redefine notify_managers_of_task to be robust
CREATE OR REPLACE FUNCTION public.notify_managers_of_task(
  p_task_id uuid,
  p_type text,
  p_title text,
  p_message text
) RETURNS void AS $$
DECLARE
  v_instalacao_id uuid;
  v_intervention_type text;
BEGIN
  -- Get context
  SELECT instalacao_id, intervention_type INTO v_instalacao_id, v_intervention_type
  FROM public.tasks WHERE id = p_task_id;
  
  IF v_instalacao_id IS NULL THEN RETURN; END IF;

  -- Insert notifications for all managers of this installation
  -- Using 'metadata' for extra data instead of 'action_link'
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    message, 
    metadata, 
    is_read, -- Ensure we use is_read (not read)
    created_at
  )
  SELECT 
    m.user_id,
    p_type, 
    COALESCE(p_title, 'Atualização da Tarefa'), -- Safety coalescing
    COALESCE(p_message, 'Verifique a tarefa.'),
    jsonb_build_object(
      'task_id', p_task_id,
      'action_link', '/execution',
      'intervention_type', v_intervention_type
    ),
    false,
    now()
  FROM public.instalacao_membros m
  WHERE m.instalacao_id = v_instalacao_id
    AND EXISTS (
      SELECT 1 FROM public.perfis p
      WHERE p.id = ANY(m.perfis)
      AND p.nome IN ('Gestor', 'Mestre')
    );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure triggers use it correctly
-- (Re-applying just to be sure, logic is same but good to ensure pointer is fresh)
CREATE OR REPLACE FUNCTION public.handle_task_status_notification() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'IN_PROGRESS' AND OLD.status = 'NOT_STARTED' THEN
      PERFORM public.notify_managers_of_task(NEW.id, 'INFO', 'Tarefa Iniciada', 'A tarefa ' || NEW.intervention_type || ' foi iniciada.');
    ELSIF NEW.status = 'COMPLETED' THEN
      PERFORM public.notify_managers_of_task(NEW.id, 'SUCCESS', 'Tarefa Concluída', 'A tarefa ' || NEW.intervention_type || ' foi concluída.');
    ELSIF NEW.status = 'BLOCKED' THEN
      PERFORM public.notify_managers_of_task(NEW.id, 'WARNING', 'Tarefa Bloqueada', 'A tarefa ' || NEW.intervention_type || ' foi bloqueada: ' || COALESCE(NEW.notes, 'Sem motivo'));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
