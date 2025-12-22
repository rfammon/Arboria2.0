-- RPC to delete notifications
CREATE OR REPLACE FUNCTION public.delete_notifications(
  p_notification_ids uuid[] DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF p_notification_ids IS NULL OR array_length(p_notification_ids, 1) IS NULL THEN
    -- Delete all for current user
    DELETE FROM public.notifications
    WHERE user_id = auth.uid();
  ELSE
    -- Delete specific
    DELETE FROM public.notifications
    WHERE id = ANY(p_notification_ids) AND user_id = auth.uid();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
