-- Refactor Notification System (Epic 4)
-- 1. Create generic function to notify specific users
CREATE OR REPLACE FUNCTION public.notify_user_of_task(
  p_user_id uuid,
  p_task_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
DECLARE
  v_intervention_type text;
BEGIN
  SELECT intervention_type INTO v_intervention_type
  FROM public.tasks WHERE id = p_task_id;
  
  INSERT INTO public.notifications (
    user_id, 
    type, 
    title, 
    message, 
    metadata, 
    is_read,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    jsonb_build_object(
      'task_id', p_task_id,
      'action_link', '/execution',
      'intervention_type', v_intervention_type
    ) || p_metadata,
    false,
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update existing manager notification function to be more flexible or keep as helper
-- Keeping 'notify_managers_of_task' as is for batch notification, but we need 'notify_assignee_of_task'

CREATE OR REPLACE FUNCTION public.notify_assignee_of_task(
  p_task_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
DECLARE
  v_assigned_to uuid;
BEGIN
  SELECT assigned_to INTO v_assigned_to
  FROM public.tasks WHERE id = p_task_id;
  
  IF v_assigned_to IS NOT NULL THEN
    PERFORM public.notify_user_of_task(v_assigned_to, p_task_id, p_type, p_title, p_message, p_metadata);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update Trigger Function
CREATE OR REPLACE FUNCTION public.handle_task_status_notification() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    
    -- 3.1 Task Started (Notify Managers)
    IF NEW.status = 'IN_PROGRESS' AND OLD.status = 'NOT_STARTED' THEN
      PERFORM public.notify_managers_of_task(NEW.id, 'INFO', 'Tarefa Iniciada', 'A tarefa ' || NEW.intervention_type || ' foi iniciada.');
    
    -- 3.2 Task Completed (Pending Approval) -> Notify Managers
    ELSIF NEW.status = 'PENDING_APPROVAL' THEN
      PERFORM public.notify_managers_of_task(NEW.id, 'INFO', 'Tarefa Aguardando Aprovação', 'A tarefa ' || NEW.intervention_type || ' aguarda sua aprovação.');
      
    -- 3.3 Task Rejected (Pending Approval -> In Progress) -> Notify Assignee
    ELSIF NEW.status = 'IN_PROGRESS' AND OLD.status = 'PENDING_APPROVAL' AND NEW.rejection_reason IS NOT NULL THEN
       PERFORM public.notify_assignee_of_task(
         NEW.id, 
         'WARNING', 
         'Tarefa Rejeitada', 
         'Sua tarefa foi rejeitada: ' || NEW.rejection_reason,
         jsonb_build_object('reason', NEW.rejection_reason)
       );
       
    -- 3.4 Task Blocked -> Notify Managers
    ELSIF NEW.status = 'BLOCKED' THEN
      PERFORM public.notify_managers_of_task(NEW.id, 'WARNING', 'Tarefa Bloqueada', 'A tarefa ' || NEW.intervention_type || ' foi bloqueada: ' || COALESCE(NEW.notes, 'Sem motivo'));
      
    -- 3.5 Task Finished (Approved) -> Notify Assignee (Optional, maybe specific feedback?)
    ELSIF NEW.status = 'COMPLETED' THEN
       -- Managers already know they approved it. Assignee might want to know.
       PERFORM public.notify_assignee_of_task(NEW.id, 'SUCCESS', 'Tarefa Aprovada', 'Sua tarefa foi aprovada e concluída.');
       
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Mark Notifications Read RPC
CREATE OR REPLACE FUNCTION public.mark_notifications_read(
  p_notification_ids uuid[] DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF p_notification_ids IS NULL OR array_length(p_notification_ids, 1) IS NULL THEN
    -- Mark all for current user
    UPDATE public.notifications
    SET
      is_read = true,
      read_at = now()
    WHERE user_id = auth.uid() AND is_read = false;
  ELSE
    -- Mark specific
    UPDATE public.notifications
    SET
      is_read = true,
      read_at = now()
    WHERE id = ANY(p_notification_ids) AND user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Updated Reopen Work Order notification
-- This should be called inside reopen_work_order RPC, not a trigger on tasks likely, or the trigger on WO status change.
-- Let's check update_work_order_status trigger if it exists.
-- For now, let's just make sure reopen_work_order RPC calls notification.

-- We will apply this migration first.
