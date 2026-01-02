-- Migration: 20260102133000_push_notification_triggers.sql
-- Description: Automated triggers for critical events

-- 1. Trigger for Task Completion
CREATE OR REPLACE FUNCTION public.handle_task_completion_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
    INSERT INTO public.notifications (user_id, installation_id, title, message, type, action_link, task_id)
    SELECT 
      im.user_id,
      NEW.instalacao_id,
      'Tarefa Concluída',
      'A tarefa "' || coalesce(NEW.intervention_type, 'sem título') || '" foi finalizada.',
      'SUCCESS',
      '/execution?taskId=' || NEW.id,
      NEW.id
    FROM public.instalacao_membros im
    WHERE im.instalacao_id = NEW.instalacao_id 
    AND (
      im.perfis @> ARRAY['d9746343-9d7a-4ab0-8aef-b7796cc76b59'::uuid] -- Gestor
      OR im.perfis @> ARRAY['f0177d0d-7058-4ff4-ba08-21ff841fb787'::uuid] -- Planejador
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_completed_notify ON public.tasks;
CREATE TRIGGER on_task_completed_notify
AFTER UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.handle_task_completion_notification();

-- 2. Trigger for Plan Finalization
CREATE OR REPLACE FUNCTION public.handle_plan_finalization_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
    INSERT INTO public.notifications (user_id, installation_id, title, message, type, action_link)
    SELECT 
      im.user_id,
      NEW.instalacao_id,
      'Plano Finalizado',
      'O plano de intervenção para a árvore ID ' || NEW.tree_id || ' foi finalizado.',
      'SUCCESS',
      '/plans/' || NEW.id
    FROM public.instalacao_membros im
    WHERE im.instalacao_id = NEW.instalacao_id 
    AND im.perfis @> ARRAY['d9746343-9d7a-4ab0-8aef-b7796cc76b59'::uuid]; -- Gestor
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_plan_finalized_notify ON public.intervention_plans;
CREATE TRIGGER on_plan_finalized_notify
AFTER UPDATE ON public.intervention_plans
FOR EACH ROW EXECUTE FUNCTION public.handle_plan_finalization_notification();

-- 3. Trigger for New Member
CREATE OR REPLACE FUNCTION public.handle_new_member_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, installation_id, title, message, type, action_link)
  SELECT 
    im.user_id,
    NEW.instalacao_id,
    'Novo Membro',
    'Um novo membro entrou na instalação.',
    'INFO',
    '/settings/members'
  FROM public.instalacao_membros im
  WHERE im.instalacao_id = NEW.instalacao_id 
  AND im.user_id != NEW.user_id -- Don't notify the person who just joined
  AND (
    im.perfis @> ARRAY['d9746343-9d7a-4ab0-8aef-b7796cc76b59'::uuid] -- Gestor
    OR im.perfis @> ARRAY['8d0187e9-ac28-4886-8e1b-63eb885727ba'::uuid] -- Mestre
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_member_joined_notify ON public.instalacao_membros;
CREATE TRIGGER on_member_joined_notify
AFTER INSERT ON public.instalacao_membros
FOR EACH ROW EXECUTE FUNCTION public.handle_new_member_notification();
