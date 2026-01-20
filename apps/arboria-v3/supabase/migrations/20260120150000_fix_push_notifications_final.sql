-- Migration: 20260120150000_fix_push_notifications_final.sql
-- Description: Fixes missing database policies, adds missing preference columns, and refines push trigger logic.

-- 1. Fix user_device_tokens Policies (Allow Update for UPSERT)
DROP POLICY IF EXISTS "Users can update own device tokens" ON public.user_device_tokens;
CREATE POLICY "Users can update own device tokens" 
    ON public.user_device_tokens
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- 2. Add Missing Preference Columns to user_notification_preferences
ALTER TABLE public.user_notification_preferences 
ADD COLUMN IF NOT EXISTS push_plan_completion BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_invite_accepted BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_app_update BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS task_assigned BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS plan_updated BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS comment_added BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS system_update BOOLEAN DEFAULT TRUE;

-- 3. Refine Push Notification Trigger Logic
CREATE OR REPLACE FUNCTION public.send_push_notification_trigger()
RETURNS TRIGGER AS $$
DECLARE
    prefs RECORD;
    service_key text;
    func_url text;
    user_tokens_count int;
    v_send_push boolean := FALSE;
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

    -- 4. Determine if we should send based on specific preferences
    -- Categorize high-level types
    IF (NEW.metadata->>'is_release')::boolean = TRUE THEN
        v_send_push := prefs.push_app_update;
    ELSIF NEW.type = 'SUCCESS' THEN
        -- Check if it's a plan or task completion (based on metadata)
        IF NEW.metadata ? 'plan_id' THEN
            v_send_push := prefs.push_plan_completion;
        ELSE
            v_send_push := prefs.push_task_completion;
        END IF;
    ELSIF NEW.type = 'WARNING' THEN
        v_send_push := prefs.push_alerts;
    ELSIF NEW.type = 'INFO' THEN
        -- Default for info is TRUE for now, or we could add more checks
        v_send_push := TRUE;
    ELSE
        -- Default fallback
        v_send_push := TRUE;
    END IF;

    -- 5. If preference is disabled, skip
    IF v_send_push = FALSE THEN
        RETURN NEW;
    END IF;

    -- Prepare variables
    service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';
    func_url := 'https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-push-notification';

    -- 6. Call Edge Function
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
            'link', COALESCE(NEW.action_link, NEW.metadata->>'action_link'),
            'metadata', NEW.metadata
        )
    );

    -- 7. Update notification record to track push status
    -- We use a simple UPDATE but need to be careful with triggers. 
    -- Since this is an AFTER trigger, we'll use a specific condition if we had a trigger-skip mechanism.
    -- For now, we update columns that are NOT used in the trigger condition to avoid recursion.
    UPDATE public.notifications 
    SET push_sent = TRUE, push_sent_at = NOW() 
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-enable triggers (just in case they were disabled or need refreshing)
DROP TRIGGER IF EXISTS on_notification_created_push ON public.notifications;
CREATE TRIGGER on_notification_created_push
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.send_push_notification_trigger();
