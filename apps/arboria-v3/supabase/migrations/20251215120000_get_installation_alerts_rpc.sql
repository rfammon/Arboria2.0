-- Function to get alerts for a specific installation
-- Bypasses complex RLS joins by checking permissions explicitly or relying on simple RLS
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
) AS $$
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
        p.full_name as reporter_name,
        p.email as reporter_email,
        t.intervention_type as task_type
    FROM task_alerts ta
    LEFT JOIN perfis p ON p.id = ta.user_id
    LEFT JOIN tasks t ON t.id = ta.task_id
    WHERE 
        t.instalacao_id = p_instalacao_id
    ORDER BY ta.created_at DESC;
END;
$$ LANGUAGE plpgsql;
