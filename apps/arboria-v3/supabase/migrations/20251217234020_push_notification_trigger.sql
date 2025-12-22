-- Migration: Add push notification trigger
-- Created: 2025-12-18

-- Function to send push notification via Edge Function
CREATE OR REPLACE FUNCTION public.send_push_notification_trigger()
RETURNS TRIGGER AS $$
DECLARE
    prefs RECORD;
    service_key text;
    func_url text;
    user_tokens_count int;
BEGIN
    -- 1. Get user preferences
    SELECT * INTO prefs FROM user_notification_preferences WHERE user_id = NEW.user_id;
    
    -- 2. Check if push is enabled globally for user
    IF prefs IS NULL OR prefs.push_enabled = FALSE THEN
        RETURN NEW;
    END IF;

    -- 3. Check if user has any device tokens
    SELECT count(*) INTO user_tokens_count FROM user_device_tokens WHERE user_id = NEW.user_id;
    IF user_tokens_count = 0 THEN
        RETURN NEW;
    END IF;

    -- 4. Filter by notification type if needed
    -- For now, we'll send push for most types if push_enabled is TRUE.
    -- We can add more granular checks (like prefs.push_task_completion) based on NEW.type
    
    IF NEW.type = 'SUCCESS' AND prefs.push_task_completion = FALSE THEN
        RETURN NEW;
    END IF;

    -- Prepare variables (Usually these should be in vault or config, but following the established pattern in 20251216_fix_auth_emails.sql)
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';
    func_url := 'https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-push-notification';

    -- 5. Call Edge Function
    PERFORM net.http_post(
        url := func_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object(
            'user_id', NEW.user_id,
            'title', NEW.title,
            'message', NEW.message,
            'link', NEW.action_link,
            'metadata', NEW.metadata
        )
    );

    -- Update notification as push sent
    -- Note: Updating row in the same table in AFTER trigger might cause recursion if not careful.
    -- Better to do it in a way that doesn't re-trigger or just skip update for now.
    -- If we use a separate column 'push_sent', we can update it.
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on notifications table
DROP TRIGGER IF EXISTS on_notification_created_push ON public.notifications;
CREATE TRIGGER on_notification_created_push
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.send_push_notification_trigger();
