-- Function to get alerts for a specific installation
-- Correctly joins with auth.users to get reporter information
CREATE OR REPLACE FUNCTION get_installation_alerts(p_instalacao_id uuid)
RETURNS TABLE (
    id uuid,
    task_id uuid,
    user_id uuid,
    alert_type text,
    message text,
    resolved boolean,
    created_at timestamptz,
    reporter_name text,
    reporter_email text,
    task_type text
) 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ta.id,
        ta.task_id,
        ta.user_id,
        ta.alert_type,
        ta.message,
        ta.resolved,
        ta.created_at,
        COALESCE((u.raw_user_meta_data->>'full_name')::text, 'Usuário sem nome'),
        u.email::text,
        t.intervention_type as task_type
    FROM public.task_alerts ta
    LEFT JOIN auth.users u ON u.id = ta.user_id
    LEFT JOIN public.tasks t ON t.id = ta.task_id
    WHERE 
        t.instalacao_id = p_instalacao_id
    ORDER BY ta.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION get_installation_alerts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_installation_alerts(uuid) TO service_role;
