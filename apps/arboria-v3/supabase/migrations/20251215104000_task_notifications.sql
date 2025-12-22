-- Function to notify managers
CREATE OR REPLACE FUNCTION notify_managers_of_task(
  p_task_id uuid,
  p_type text,
  p_title text,
  p_message text
) RETURNS void AS $$
DECLARE
  v_instalacao_id uuid;
  v_gestor_profile_id uuid;
  v_task_title text;
BEGIN
  -- Get context
  SELECT instalacao_id, intervention_type INTO v_instalacao_id, v_task_title
  FROM tasks WHERE id = p_task_id;
  
  IF v_instalacao_id IS NULL THEN RETURN; END IF;

  -- Get Gestor Profile ID
  SELECT id INTO v_gestor_profile_id FROM perfis WHERE nome = 'Gestor' LIMIT 1;
  
  IF v_gestor_profile_id IS NULL THEN RETURN; END IF;

  -- Insert notifications
  -- Assumes notifications table has columns: type, title, message, user_id, action_link, created_at, is_read
  INSERT INTO notifications (type, title, message, user_id, action_link, created_at, is_read)
  SELECT 
    p_type, 
    p_title, 
    p_message, 
    m.user_id,
    '/execution', 
    now(),
    false
  FROM instalacao_membros m
  WHERE m.instalacao_id = v_instalacao_id
    AND v_gestor_profile_id = ANY(m.perfis); 
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function for Status Changes
CREATE OR REPLACE FUNCTION handle_task_status_notification() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    IF NEW.status = 'IN_PROGRESS' AND OLD.status = 'NOT_STARTED' THEN
      PERFORM notify_managers_of_task(NEW.id, 'INFO', 'Tarefa Iniciada', 'A tarefa ' || NEW.intervention_type || ' foi iniciada.');
    ELSIF NEW.status = 'COMPLETED' THEN
      PERFORM notify_managers_of_task(NEW.id, 'SUCCESS', 'Tarefa Concluída', 'A tarefa ' || NEW.intervention_type || ' foi concluída.');
    ELSIF NEW.status = 'BLOCKED' THEN
      PERFORM notify_managers_of_task(NEW.id, 'WARNING', 'Tarefa Bloqueada', 'A tarefa ' || NEW.intervention_type || ' foi bloqueada. Verifique os problemas relatados.');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Tasks
DROP TRIGGER IF EXISTS trg_notify_task_status_change ON tasks;
CREATE TRIGGER trg_notify_task_status_change
AFTER UPDATE OF status ON tasks
FOR EACH ROW EXECUTE FUNCTION handle_task_status_notification();

-- Trigger Function for Alerts
CREATE OR REPLACE FUNCTION handle_task_alert_notification() RETURNS TRIGGER AS $$
BEGIN
   -- Notify Managers about new Alert
   IF NEW.task_id IS NOT NULL THEN
       PERFORM notify_managers_of_task(NEW.task_id, 'WARNING', 'Alerta na Tarefa', 'Alerta (' || NEW.alert_type || '): ' || NEW.message);
   END IF;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Task Alerts
DROP TRIGGER IF EXISTS trg_notify_task_alert ON task_alerts;
CREATE TRIGGER trg_notify_task_alert
AFTER INSERT ON task_alerts
FOR EACH ROW EXECUTE FUNCTION handle_task_alert_notification();
