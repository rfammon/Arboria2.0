-- Create device_tokens table for push notification management
-- Migration: create_device_tokens
-- Date: 2025-12-23

-- Create table
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios', 'web')),
  enabled BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{
    "task_assigned": true,
    "task_completed": true,
    "plan_updated": true,
    "comment_added": true,
    "urgent_alert": true,
    "system_update": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure one token per user+platform combination
  CONSTRAINT unique_user_platform_token UNIQUE (user_id, platform, token)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_enabled ON device_tokens(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_device_tokens_token ON device_tokens(token);

-- Enable Row Level Security
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own device tokens
CREATE POLICY "Users can view own device tokens"
  ON device_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own device tokens
CREATE POLICY "Users can insert own device tokens"
  ON device_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own device tokens
CREATE POLICY "Users can update own device tokens"
  ON device_tokens FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own device tokens  
CREATE POLICY "Users can delete own device tokens"
  ON device_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all tokens (for cleanup)
CREATE POLICY "Service role can manage all device tokens"
  ON device_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- Create updated_at trigger
CREATE TRIGGER update_device_tokens_updated_at
  BEFORE UPDATE ON device_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to cleanup old/invalid tokens
CREATE OR REPLACE FUNCTION cleanup_invalid_device_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Disable tokens not used in 90 days
  UPDATE device_tokens
  SET enabled = false
  WHERE last_used_at < now() - interval '90 days'
    AND enabled = true;
    
  -- Delete tokens not used in 180 days
  DELETE FROM device_tokens
  WHERE last_used_at < now() - interval '180 days';
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON device_tokens TO authenticated;
GRANT SELECT ON device_tokens TO anon;

-- Add comment
COMMENT ON TABLE device_tokens IS 'Stores device tokens for push notifications (FCM/APNS)';
COMMENT ON COLUMN device_tokens.token IS 'FCM/APNS device token';
COMMENT ON COLUMN device_tokens.platform IS 'Device platform: android, ios, or web';
COMMENT ON COLUMN device_tokens.enabled IS 'Whether push notifications are enabled for this device';
COMMENT ON COLUMN device_tokens.notification_preferences IS 'User preferences for notification types';
COMMENT ON COLUMN device_tokens.last_used_at IS 'Last time this token was used to send a notification';
