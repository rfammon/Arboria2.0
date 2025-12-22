-- Function to get alerts for a specific installation
-- Correctly joins with auth.users AND intervention_plans (via work_orders)
-- "Prepare the midfield" for future AI lessons learned
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
    task_type text,
    plan_id uuid,
    plan_title text
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
        t.intervention_type as task_type,
        ip.id as plan_id,
        ip.title as plan_title
    FROM public.task_alerts ta
    LEFT JOIN auth.users u ON u.id = ta.user_id
    LEFT JOIN public.tasks t ON t.id = ta.task_id
    LEFT JOIN public.work_orders wo ON wo.id = t.work_order_id
    LEFT JOIN public.intervention_plans ip ON ip.id = wo.plan_id
    WHERE 
        t.instalacao_id = p_instalacao_id
    ORDER BY ta.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION get_installation_alerts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_installation_alerts(uuid) TO service_role;
