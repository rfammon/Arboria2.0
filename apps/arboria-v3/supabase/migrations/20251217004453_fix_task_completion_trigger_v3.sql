-- Fix for notify_task_completion missing 'title'
-- This function is called by trigger 'on_task_completed'

CREATE OR REPLACE FUNCTION public.notify_task_completion()
RETURNS TRIGGER AS $$
DECLARE
    v_gestor_id UUID;
    v_planejador_id UUID;
BEGIN
    -- Get Profile IDs dynamically
    SELECT id INTO v_gestor_id FROM public.perfis WHERE nome = 'Gestor' LIMIT 1;
    SELECT id INTO v_planejador_id FROM public.perfis WHERE nome = 'Planejador' LIMIT 1;

    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        -- Insert into notifications including TITLE
        INSERT INTO public.notifications (
            user_id, 
            type, 
            title, 
            message, 
            metadata, -- Use metadata instead of action_link/task_id/installation_id direct cols if they are moving
            is_read, 
            created_at
        )
        SELECT 
            im.user_id, 
            'SUCCESS', -- Changed from 'TASK_COMPLETED' to match standard types if needed, or keep TASK_COMPLETED if enum allows
            'Tarefa Concluída', -- TITLE WAS MISSING
            'Tarefa ' || COALESCE(NEW.intervention_type, 'de intervenção') || ' concluída',
            jsonb_build_object(
                'task_id', NEW.id,
                'installation_id', NEW.instalacao_id,
                'action_link', '/execution'
            ),
            false,
            now()
        FROM public.instalacao_membros im
        WHERE im.instalacao_id = NEW.instalacao_id
          -- Check if array contains either Gestor or Planejador ID
          AND (
              v_gestor_id = ANY(im.perfis) 
              OR 
              v_planejador_id = ANY(im.perfis)
          )
          AND im.user_id != COALESCE(NEW.assigned_to, '00000000-0000-0000-0000-000000000000');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
