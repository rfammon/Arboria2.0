-- Migration to add read_at column to notifications
-- Fixes RPC 'mark_notifications_read' error

ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Re-apply the RPC just in case, though the previous one was valid SQL, just runtime failed.
-- No need to re-create the function if it's already there, but we can to be safe/idempotent.

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
