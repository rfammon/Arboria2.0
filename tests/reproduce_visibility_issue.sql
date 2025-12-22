-- Reproduction: Verify Manager Visibility
-- 1. Create a task assigned to someone else
-- 2. Try to fetch it as a Manager using get_my_tasks

DO $$
DECLARE
    v_gestor_id UUID;
    v_executante_id UUID;
    v_instalacao_id UUID;
    v_work_order_id UUID;
    v_tree_id UUID;
    v_task_id UUID;
    v_count INTEGER;
BEGIN
    -- Assume we have users and installation setup (or fetch existing)
    -- This is a theoretical test block to demonstrate the check
    
    -- Pick a Gestor
    SELECT user_id, instalacao_id INTO v_gestor_id, v_instalacao_id
    FROM public.instalacao_membros im
    WHERE EXISTS (SELECT 1 FROM unnest(im.perfis) p_id JOIN public.perfis p ON p.id = p_id WHERE p.nome = 'Gestor')
    LIMIT 1;
    
    -- Pick an Executante in the same installation
    SELECT user_id INTO v_executante_id
    FROM public.instalacao_membros im
    WHERE im.instalacao_id = v_instalacao_id
      AND im.user_id != v_gestor_id
    LIMIT 1;
    
    IF v_gestor_id IS NULL OR v_executante_id IS NULL THEN
        RAISE NOTICE 'Skipping test: Not enough users found';
        RETURN;
    END IF;

    -- Create a dummy Task assigned to Executante
    -- (Need WO and Tree first if not exist, simplifying by assuming they exist or creating cheap ones)
    -- For safety, let's just query existing tasks assigned to others
    
    SELECT COUNT(*) INTO v_visible_count
    FROM public.get_my_tasks(v_gestor_id, v_instalacao_id) t
    WHERE (t.task_data->>'assigned_to')::uuid = v_executante_id::text
      AND (t.task_data->>'team_members') IS NULL; -- Purely others' tasks
      
    RAISE NOTICE 'Gestor % sees % tasks assigned to others', v_gestor_id, v_visible_count;
    
    -- If v_count is 0 but such tasks exist, then FAIL
    -- Finding if such tasks exist:
    SELECT COUNT(*) INTO v_count
    FROM public.tasks
    WHERE instalacao_id = v_instalacao_id
      AND assigned_to = v_executante_id;
      
    RAISE NOTICE 'Actually there are % tasks for executante %', v_count, v_executante_id;
    
END $$;
