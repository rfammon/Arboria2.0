-- Update the legacy trigger function to use correct column names (metadata instead of data, is_read instead of read)
CREATE OR REPLACE FUNCTION notify_gestores_on_sos() RETURNS TRIGGER AS $$
DECLARE
  v_instalacao_id uuid;
  v_task_description text;
BEGIN
  -- Get instalacao_id from task (or NULL if alert is not task-specific)
  IF NEW.task_id IS NOT NULL THEN
    SELECT instalacao_id, description
    INTO v_instalacao_id, v_task_description
    FROM public.tasks
    WHERE id = NEW.task_id;
  END IF;
  
  -- If we have an instalacao, notify all Gestores/Mestre
  IF v_instalacao_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, metadata, is_read)
    SELECT 
      im.user_id,
      'WARNING', -- Changed from 'ALERT' to match allowed IN check (INFO, WARNING, SUCCESS, ERROR) from table definition
      'ALERTA ' || NEW.alert_type || ' - Executante em Campo',
      CASE 
        WHEN NEW.alert_type = 'SOS' THEN 'Um executante acionou SOS. Verifique imediatamente!'
        WHEN NEW.alert_type = 'HELP' THEN 'Um executante precisa de ajuda.'
        WHEN NEW.alert_type = 'EQUIPMENT_FAILURE' THEN 'Falha de equipamento reportada.'
        WHEN NEW.alert_type = 'SAFETY_ISSUE' THEN 'Problema de segurança reportado.'
        ELSE 'Problema reportado: ' || COALESCE(NEW.message, 'Sem detalhes')
      END,
      jsonb_build_object(
        'alert_id', NEW.id,
        'alert_type', NEW.alert_type,
        'task_id', NEW.task_id,
        'task_description', v_task_description,
        'location', jsonb_build_object('lat', NEW.location_lat, 'lng', NEW.location_lng),
        'message', NEW.message,
        'user_id', NEW.user_id
      ),
      false
    FROM public.instalacao_membros im
    WHERE im.instalacao_id = v_instalacao_id
    AND EXISTS (
      SELECT 1 FROM public.perfis p 
      WHERE p.id = ANY(im.perfis) 
      AND p.nome IN ('Gestor', 'Mestre')
    )
    AND im.user_id != NEW.user_id; -- Don't notify the alerter
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
