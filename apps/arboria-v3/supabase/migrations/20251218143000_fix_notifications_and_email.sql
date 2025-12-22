-- Migration: Fix Notifications and Add Email Trigger
-- Story: 9
-- Created: 2025-12-18
-- Description: Updates notification logic for completed tasks and adds trigger to send emails via Edge Function.

-- 1. UPDATE NOTIFICATION LOGIC (Notify Managers on Completion)
CREATE OR REPLACE FUNCTION public.handle_task_status_notification() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    
    -- 3.1 Task Started (Notify Managers)
    IF NEW.status = 'IN_PROGRESS' AND OLD.status = 'NOT_STARTED' THEN
      PERFORM public.notify_managers_of_task(NEW.id, 'INFO', 'Tarefa Iniciada', 'A tarefa ' || NEW.intervention_type || ' foi iniciada.');
    
    -- 3.2 Task Completed (Pending Approval) -> Notify Managers
    ELSIF NEW.status = 'PENDING_APPROVAL' THEN
      PERFORM public.notify_managers_of_task(NEW.id, 'INFO', 'Tarefa Aguardando Aprovação', 'A tarefa ' || NEW.intervention_type || ' foi concluída e aguarda sua aprovação.');
      
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
      
    -- 3.5 Task Finished (Approved/Completed) -> Notify Assignee AND Managers
    ELSIF NEW.status = 'COMPLETED' THEN
       -- Notify Assignee (Success)
       PERFORM public.notify_assignee_of_task(NEW.id, 'SUCCESS', 'Tarefa Aprovada', 'Sua tarefa foi aprovada e concluída.');
       
       -- Notify Managers (Confirmation) - NEW
       -- Usually managers know because they approved, but good to have a permanent record/notification of the final status change.
       -- Also covers cases where it might go straight to completed (if that flow exists)
       PERFORM public.notify_managers_of_task(NEW.id, 'SUCCESS', 'Tarefa Concluída', 'A tarefa ' || NEW.intervention_type || ' foi finalizada com sucesso.');
       
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. EMAIL NOTIFICATION TRIGGER (Call Edge Function)
CREATE OR REPLACE FUNCTION public.send_email_notification_trigger()
RETURNS TRIGGER AS $$
DECLARE
    prefs RECORD;
    service_key text;
    func_url text;
    user_email text;
BEGIN
    -- 1. Get user preferences
    SELECT * INTO prefs FROM user_notification_preferences WHERE user_id = NEW.user_id;
    
    -- 2. Check if email is enabled globally for user (default TRUE if no prefs found?)
    -- relying on Edge Function to check detailed preferences, here we just filter global 'email_enabled' if record exists
    IF prefs IS NOT NULL AND prefs.email_enabled = FALSE THEN
        RETURN NEW;
    END IF;

    -- 3. Check if email was already sent (avoid recursion if updated)
    IF NEW.email_sent = TRUE THEN
        RETURN NEW;
    END IF;

    -- Prepare variables
    -- In production, key should be a secret. For now using the existing pattern.
    -- Service Role Key for invoking functions
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';
    func_url := 'https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-notification-email';

    -- 4. Call Edge Function via pg_net
    -- We send the whole notification payload
    PERFORM net.http_post(
        url := func_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object(
            'notification_id', NEW.id,
            'user_id', NEW.user_id,
            'type', NEW.type,
            'message', NEW.message,
            'task_id', (NEW.data->>'task_id'),
            'metadata', NEW.data
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE TRIGGER FOR EMAIL
DROP TRIGGER IF EXISTS on_notification_created_email ON public.notifications;
CREATE TRIGGER on_notification_created_email
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.send_email_notification_trigger();

COMMENT ON FUNCTION public.send_email_notification_trigger IS 'Triggers Email Edge Function on new notification';
