-- Migration: Fix Email Trigger Data Field Access
-- Description: Fixes the bug where send_email_notification_trigger tried to access NEW.data instead of NEW.metadata
-- Created: 2025-12-21

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
    
    -- 2. Check if email is enabled globally for user
    IF prefs IS NOT NULL AND prefs.email_enabled = FALSE THEN
        RETURN NEW;
    END IF;

    -- 3. Check if email was already sent
    IF NEW.email_sent = TRUE THEN
        RETURN NEW;
    END IF;

    -- Prepare variables
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';
    func_url := 'https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-notification-email';

    -- 4. Call Edge Function via pg_net
    -- FIXED: Changed NEW.data to NEW.metadata
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
            'task_id', (NEW.metadata->>'task_id'),
            'metadata', NEW.metadata
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
