-- Migration: Add push notification support
-- Created: 2025-12-18

-- 1. Add push-related columns to user_notification_preferences
ALTER TABLE public.user_notification_preferences 
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_task_completion BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS push_alerts BOOLEAN DEFAULT TRUE;

-- 2. Create user_device_tokens table
CREATE TABLE IF NOT EXISTS public.user_device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform TEXT, -- 'android', 'ios', 'web'
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- 3. Add push tracking to notifications table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' 
                   AND column_name = 'push_sent') THEN
        ALTER TABLE public.notifications ADD COLUMN push_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' 
                   AND column_name = 'push_sent_at') THEN
        ALTER TABLE public.notifications ADD COLUMN push_sent_at TIMESTAMPTZ;
    END IF;
END $$;

-- 4. Enable RLS for user_device_tokens
ALTER TABLE public.user_device_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Policies for user_device_tokens
DROP POLICY IF EXISTS "Users can view own device tokens" ON public.user_device_tokens;
CREATE POLICY "Users can view own device tokens" 
    ON public.user_device_tokens
    FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own device tokens" ON public.user_device_tokens;
CREATE POLICY "Users can insert own device tokens" 
    ON public.user_device_tokens
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own device tokens" ON public.user_device_tokens;
CREATE POLICY "Users can delete own device tokens" 
    ON public.user_device_tokens
    FOR DELETE 
    USING (auth.uid() = user_id);

-- 6. Index for performance
CREATE INDEX IF NOT EXISTS idx_user_device_tokens_user_id ON public.user_device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_push_pending ON public.notifications(user_id) WHERE push_sent = FALSE;

COMMENT ON TABLE public.user_device_tokens IS 'Device tokens for FCM push notifications (RF5.3)';
