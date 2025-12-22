-- Migration: Add email notification support
-- Created: 2025-12-16

-- Enable pg_net extension for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- User notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    email_access_requests BOOLEAN DEFAULT TRUE,
    email_approvals BOOLEAN DEFAULT TRUE,
    email_invites BOOLEAN DEFAULT TRUE,
    email_task_completion BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add email tracking to notifications table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' 
                   AND column_name = 'email_sent') THEN
        ALTER TABLE notifications ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' 
                   AND column_name = 'email_sent_at') THEN
        ALTER TABLE notifications ADD COLUMN email_sent_at TIMESTAMPTZ;
    END IF;
END $$;

-- RLS Policies for notification preferences
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own preferences
CREATE POLICY "Users can view own notification preferences"
    ON user_notification_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
    ON user_notification_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
    ON user_notification_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to auto-create preferences on first access
CREATE OR REPLACE FUNCTION ensure_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when user is created
DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_prefs
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_notification_preferences();

-- Index for faster email queries
CREATE INDEX IF NOT EXISTS idx_notifications_email_pending 
    ON notifications(user_id) 
    WHERE email_sent = FALSE;

COMMENT ON TABLE user_notification_preferences IS 'User preferences for email notifications (RF5.2)';
