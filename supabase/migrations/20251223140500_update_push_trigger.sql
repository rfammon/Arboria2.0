-- Migration: update_push_trigger
-- Date: 2025-12-23
-- Update send_push_notification_trigger to use new Edge Function payload

CREATE OR REPLACE FUNCTION public.send_push_notification_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    service_key text;
    func_url text;
BEGIN
    -- Prepare variables
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';
    func_url := 'https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-push-notification';

    -- Call Edge Function
    -- We send the single user_id in an array as expected by the bulk endpoint
    PERFORM net.http_post(
        url := func_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object(
            'user_ids', jsonb_build_array(NEW.user_id),
            'title', NEW.title,
            'body', NEW.message,
            'category', CASE 
                WHEN NEW.type = 'WARNING' THEN 'urgent_alert'
                WHEN NEW.type = 'SUCCESS' THEN 'task_completed'
                ELSE 'info'
            END,
            'data', jsonb_build_object(
                'notification_id', NEW.id,
                'type', NEW.type,
                'deep_link', NEW.action_link
            )
        )
    );

    RETURN NEW;
END;
$function$;
