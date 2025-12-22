WITH gestor_data AS (
    SELECT im.user_id, im.instalacao_id 
    FROM public.instalacao_membros im
    JOIN public.perfis p ON p.id = ANY(im.perfis)
    WHERE p.nome = 'Gestor'
    LIMIT 1
),
executante_data AS (
    SELECT im.user_id
    FROM public.instalacao_membros im
    JOIN gestor_data gd ON im.instalacao_id = gd.instalacao_id
    WHERE im.user_id != gd.user_id
    LIMIT 1
),
actual_tasks AS (
    SELECT COUNT(*) as count
    FROM public.tasks t, gestor_data gd, executante_data ed
    WHERE t.instalacao_id = gd.instalacao_id
    AND t.assigned_to = ed.user_id
),
visible_tasks AS (
    SELECT COUNT(*) as count
    FROM gestor_data gd, executante_data ed,
    public.get_my_tasks(gd.user_id, gd.instalacao_id) t
    WHERE (t.task_data->>'assigned_to')::uuid = ed.user_id
)
SELECT 
    gd.user_id as gestor_id,
    ed.user_id as executante_id,
    at.count as actual_count,
    vt.count as visible_count,
    CASE 
        WHEN at.count > 0 AND vt.count = at.count THEN 'SUCCESS'
        WHEN at.count > 0 AND vt.count = 0 THEN 'FAILURE'
        ELSE 'INCONCLUSIVE (No tasks found or partial visibility)' 
    END as result
FROM gestor_data gd, executante_data ed, actual_tasks at, visible_tasks vt;
