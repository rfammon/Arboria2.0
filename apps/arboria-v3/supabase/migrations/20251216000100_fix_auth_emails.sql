-- Migration: Fix Auth Emails via Edge Function
-- Purpose: Route signup confirmation emails through Outlook SMTP Edge Function
-- Created: 2025-12-16

-- Ensure pg_net is available for HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to send confirmation email via Edge Function
CREATE OR REPLACE FUNCTION send_auth_confirmation_email()
RETURNS TRIGGER AS $$
DECLARE
    -- Using the provided Service Role Key for authentication
    service_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZm91eHJpbnlnZWNieG1qY2tnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQyNDExNSwiZXhwIjoyMDgwMDAwMTE1fQ.BLrQmg4io0yhvcMoFG8rJ4CR6nd9DEI1gOZxwiCXEIE';
    func_url text := 'https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-notification-email';
BEGIN
    -- Only send if not confirmed and email is present
    -- Also check if confirmation_token is present
    IF NEW.email_confirmed_at IS NULL AND NEW.email IS NOT NULL AND NEW.confirmation_token IS NOT NULL THEN
        PERFORM net.http_post(
            url := func_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_key
            ),
            body := jsonb_build_object(
                'notification_id', NULL, -- No DB notification record for this system event
                'user_id', NEW.id,
                'type', 'signup_confirmation',
                'message', 'Please confirm your account',
                'token', NEW.confirmation_token,
                -- Default redirect to app home, or specific page if needed
                'redirect_to', 'https://arboria.app' 
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_send_confirmation ON auth.users;
CREATE TRIGGER on_auth_user_created_send_confirmation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION send_auth_confirmation_email();
