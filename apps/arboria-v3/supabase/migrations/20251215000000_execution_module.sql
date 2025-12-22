-- =====================================================
-- EXECUTION MODULE - Migration
-- Epic 1: Módulo de Execução de Intervenções
-- Created: 2025-12-15
-- =====================================================

-- =====================================================
-- 1. WORK ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instalacao_id uuid NOT NULL REFERENCES public.instalacoes(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.intervention_plans(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) DEFAULT 'OPEN',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX idx_work_orders_instalacao ON public.work_orders(instalacao_id);
CREATE INDEX idx_work_orders_assigned ON public.work_orders(assigned_to);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);

COMMENT ON TABLE public.work_orders IS 'Work orders grouping multiple tasks for execution';
COMMENT ON COLUMN public.work_orders.plan_id IS 'Optional link to intervention plan';
COMMENT ON COLUMN public.work_orders.assigned_to IS 'Primary executante assigned';

-- =====================================================
-- 2. TASKS TABLE (Execution Tasks)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instalacao_id uuid NOT NULL REFERENCES public.instalacoes(id) ON DELETE CASCADE,
  work_order_id uuid NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  tree_id uuid NOT NULL REFERENCES public.arvores(id) ON DELETE CASCADE,
  
  -- Task details
  intervention_type text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')) DEFAULT 'NOT_STARTED',
  priority text NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
  
  -- Assignment
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  team_members uuid[], -- Array of user IDs for team mode
  
  -- GPS & Location
  tree_lat numeric(10, 7), -- Latitude with precision
  tree_lng numeric(10, 7), -- Longitude with precision
  
  -- Progress tracking
  progress_percent integer DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Evidence tracking
  evidence_stage text CHECK (evidence_stage IN ('none', 'before', 'during', 'after', 'completed')) DEFAULT 'none',
  
  -- Notes
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_completion CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL) OR 
    (status != 'COMPLETED')
  ),
  CONSTRAINT valid_start CHECK (
    (status IN ('IN_PROGRESS', 'COMPLETED', 'BLOCKED') AND started_at IS NOT NULL) OR 
    (status = 'NOT_STARTED')
  )
);

CREATE INDEX idx_tasks_instalacao ON public.tasks(instalacao_id);
CREATE INDEX idx_tasks_work_order ON public.tasks(work_order_id);
CREATE INDEX idx_tasks_tree ON public.tasks(tree_id);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_location ON public.tasks(tree_lat, tree_lng) WHERE tree_lat IS NOT NULL AND tree_lng IS NOT NULL;

COMMENT ON TABLE public.tasks IS 'Individual execution tasks for field work';
COMMENT ON COLUMN public.tasks.evidence_stage IS 'Current stage of photo evidence collection';
COMMENT ON COLUMN public.tasks.team_members IS 'Array of user IDs for collaborative execution';

-- =====================================================
-- 3. TASK EVIDENCE TABLE (5-stage photo system)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  
  -- Evidence stage
  stage text NOT NULL CHECK (stage IN ('before', 'during_1', 'during_2', 'after', 'completion')),
  
  -- Photo storage
  photo_url text NOT NULL,
  photo_thumbnail_url text,
  
  -- Metadata
  photo_metadata jsonb DEFAULT '{}'::jsonb,
  notes text,
  
  -- Timestamps
  captured_at timestamptz DEFAULT now() NOT NULL,
  uploaded_at timestamptz,
  captured_by uuid REFERENCES auth.users(id),
  
  -- Location at capture
  capture_lat numeric(10, 7),
  capture_lng numeric(10, 7)
);

CREATE INDEX idx_task_evidence_task ON public.task_evidence(task_id);
CREATE INDEX idx_task_evidence_stage ON public.task_evidence(stage);
CREATE INDEX idx_task_evidence_captured_at ON public.task_evidence(captured_at);

COMMENT ON TABLE public.task_evidence IS 'Photographic evidence for task execution (5-stage system)';
COMMENT ON COLUMN public.task_evidence.photo_metadata IS 'JSON metadata: device info, resolution, compression, etc';
COMMENT ON COLUMN public.task_evidence.stage IS 'Evidence stage: before, during_1, during_2, after, completion';

-- =====================================================
-- 4. TASK PROGRESS LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_progress_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- Progress info
  progress_percent integer NOT NULL CHECK (progress_percent >= 0 AND progress_percent <= 100),
  notes text,
  
  -- Timestamp
  logged_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_progress_log_task ON public.task_progress_log(task_id);
CREATE INDEX idx_progress_log_logged_at ON public.task_progress_log(logged_at);

COMMENT ON TABLE public.task_progress_log IS 'Historical log of task progress updates';

-- =====================================================
-- 5. TASK ALERTS TABLE (SOS & Safety)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  
  -- Alert details
  alert_type text NOT NULL CHECK (alert_type IN ('SOS', 'HELP', 'EQUIPMENT_FAILURE', 'SAFETY_ISSUE')),
  message text NOT NULL,
  
  -- Location
  location_lat numeric(10, 7),
  location_lng numeric(10, 7),
  
  -- Resolution
  resolved boolean DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  resolution_notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_task_alerts_task ON public.task_alerts(task_id);
CREATE INDEX idx_task_alerts_user ON public.task_alerts(user_id);
CREATE INDEX idx_task_alerts_type ON public.task_alerts(alert_type);
CREATE INDEX idx_task_alerts_resolved ON public.task_alerts(resolved) WHERE NOT resolved;
CREATE INDEX idx_task_alerts_created_at ON public.task_alerts(created_at);

COMMENT ON TABLE public.task_alerts IS 'Emergency alerts and safety issues during execution';
COMMENT ON COLUMN public.task_alerts.alert_type IS 'SOS = emergency, HELP = assistance needed, EQUIPMENT_FAILURE, SAFETY_ISSUE';

-- =====================================================
-- 6. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_progress_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_alerts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Work Orders RLS Policies
-- =====================================================

-- SELECT: Members can view work orders from their installation
CREATE POLICY "work_orders_select_policy" ON public.work_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instalacao_membros
      WHERE instalacao_id = work_orders.instalacao_id
      AND user_id = auth.uid()
    )
  );

-- INSERT: Gestor/Mestre/Planejador can create work orders
CREATE POLICY "work_orders_insert_policy" ON public.work_orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.instalacao_membros im
      WHERE im.instalacao_id = work_orders.instalacao_id
      AND im.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.perfis p
        WHERE p.id = ANY(im.perfis)
        AND p.nome IN ('Gestor', 'Mestre', 'Planejador')
      )
    )
  );

-- UPDATE: Gestor/Mestre/assigned Executante can update
CREATE POLICY "work_orders_update_policy" ON public.work_orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.instalacao_membros im
      WHERE im.instalacao_id = work_orders.instalacao_id
      AND im.user_id = auth.uid()
      AND (
        EXISTS (
          SELECT 1 FROM public.perfis p
          WHERE p.id = ANY(im.perfis)
          AND p.nome IN ('Gestor', 'Mestre')
        )
        OR work_orders.assigned_to = auth.uid()
      )
    )
  );

-- DELETE: Only Gestor/Mestre
CREATE POLICY "work_orders_delete_policy" ON public.work_orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.instalacao_membros im
      WHERE im.instalacao_id = work_orders.instalacao_id
      AND im.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.perfis p
        WHERE p.id = ANY(im.perfis)
        AND p.nome IN ('Gestor', 'Mestre')
      )
    )
  );

-- =====================================================
-- Tasks RLS Policies
-- =====================================================

-- SELECT: Members can view tasks
CREATE POLICY "tasks_select_policy" ON public.tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.instalacao_membros
      WHERE instalacao_id = tasks.instalacao_id
      AND user_id = auth.uid()
    )
  );

-- INSERT: Gestor/Mestre/Planejador can create tasks
CREATE POLICY "tasks_insert_policy" ON public.tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.instalacao_membros im
      WHERE im.instalacao_id = tasks.instalacao_id
      AND im.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.perfis p
        WHERE p.id = ANY(im.perfis)
        AND p.nome IN ('Gestor', 'Mestre', 'Planejador')
      )
    )
  );

-- UPDATE: Assigned executante or Gestor/Mestre can update
CREATE POLICY "tasks_update_policy" ON public.tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.instalacao_membros im
      WHERE im.instalacao_id = tasks.instalacao_id
      AND im.user_id = auth.uid()
      AND (
        EXISTS (
          SELECT 1 FROM public.perfis p
          WHERE p.id = ANY(im.perfis)
          AND p.nome IN ('Gestor', 'Mestre')
        )
        OR tasks.assigned_to = auth.uid()
        OR auth.uid() = ANY(tasks.team_members)
      )
    )
  );

-- DELETE: Only Gestor/Mestre
CREATE POLICY "tasks_delete_policy" ON public.tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.instalacao_membros im
      WHERE im.instalacao_id = tasks.instalacao_id
      AND im.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.perfis p
        WHERE p.id = ANY(im.perfis)
        AND p.nome IN ('Gestor', 'Mestre')
      )
    )
  );

-- =====================================================
-- Task Evidence RLS Policies
-- =====================================================

-- SELECT: Members can view evidence
CREATE POLICY "task_evidence_select_policy" ON public.task_evidence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.instalacao_membros im ON im.instalacao_id = t.instalacao_id
      WHERE t.id = task_evidence.task_id
      AND im.user_id = auth.uid()
    )
  );

-- INSERT: Assigned executante can upload evidence
CREATE POLICY "task_evidence_insert_policy" ON public.task_evidence
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.instalacao_membros im ON im.instalacao_id = t.instalacao_id
      WHERE t.id = task_evidence.task_id
      AND im.user_id = auth.uid()
      AND (
        t.assigned_to = auth.uid() 
        OR auth.uid() = ANY(t.team_members)
      )
    )
  );

-- UPDATE: Only uploader or Gestor/Mestre
CREATE POLICY "task_evidence_update_policy" ON public.task_evidence
  FOR UPDATE
  USING (
    captured_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.instalacao_membros im ON im.instalacao_id = t.instalacao_id
      WHERE t.id = task_evidence.task_id
      AND im.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.perfis p
        WHERE p.id = ANY(im.perfis)
        AND p.nome IN ('Gestor', 'Mestre')
      )
    )
  );

-- DELETE: Only Gestor/Mestre
CREATE POLICY "task_evidence_delete_policy" ON public.task_evidence
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.instalacao_membros im ON im.instalacao_id = t.instalacao_id
      WHERE t.id = task_evidence.task_id
      AND im.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.perfis p
        WHERE p.id = ANY(im.perfis)
        AND p.nome IN ('Gestor', 'Mestre')
      )
    )
  );

-- =====================================================
-- Task Progress Log RLS Policies
-- =====================================================

-- SELECT: Members can view progress logs
CREATE POLICY "task_progress_log_select_policy" ON public.task_progress_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.instalacao_membros im ON im.instalacao_id = t.instalacao_id
      WHERE t.id = task_progress_log.task_id
      AND im.user_id = auth.uid()
    )
  );

-- INSERT: Assigned executante can log progress
CREATE POLICY "task_progress_log_insert_policy" ON public.task_progress_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      WHERE t.id = task_progress_log.task_id
      AND (
        t.assigned_to = auth.uid() 
        OR auth.uid() = ANY(t.team_members)
      )
    )
    AND user_id = auth.uid()
  );

-- No UPDATE/DELETE policies - logs are immutable

-- =====================================================
-- Task Alerts RLS Policies
-- =====================================================

-- SELECT: Members can view alerts
CREATE POLICY "task_alerts_select_policy" ON public.task_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.instalacao_membros im ON im.instalacao_id = t.instalacao_id
      WHERE (t.id = task_alerts.task_id OR task_alerts.task_id IS NULL)
      AND im.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- INSERT: Any authenticated user can create alerts
CREATE POLICY "task_alerts_insert_policy" ON public.task_alerts
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
  );

-- UPDATE: Only Gestor/Mestre can resolve
CREATE POLICY "task_alerts_update_policy" ON public.task_alerts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks t
      JOIN public.instalacao_membros im ON im.instalacao_id = t.instalacao_id
      WHERE (t.id = task_alerts.task_id OR task_alerts.task_id IS NULL)
      AND im.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.perfis p
        WHERE p.id = ANY(im.perfis)
        AND p.nome IN ('Gestor', 'Mestre')
      )
    )
  );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_work_orders_updated_at BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. GRANTS
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_evidence TO authenticated;
GRANT SELECT, INSERT ON public.task_progress_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.task_alerts TO authenticated;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
