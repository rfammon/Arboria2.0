-- Migration: Create intervention plans table
-- Description: Intervention planning module (Gestor de Planos de Intervenção)
-- Date: 2025-12-14

-- ============================================
-- 1. CREATE INTERVENTION PLANS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS intervention_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id TEXT UNIQUE NOT NULL, -- Format: PI-YYYY-NNN (e.g., PI-2025-001)
  instalacao_id UUID REFERENCES instalacoes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  -- Plan details
  intervention_type TEXT NOT NULL CHECK (intervention_type IN (
    'poda', 
    'supressao', 
    'transplante', 
    'tratamento', 
    'monitoramento'
  )),
  
  -- Schedule stored as JSONB for flexibility
  -- Format: {start: "2025-01-15", end: "2025-01-20"} or {startDate: "2025-01-15", endDate: "2025-01-17"}
  schedule JSONB NOT NULL,
  
  -- Text fields
  justification TEXT,
  responsible TEXT,
  responsible_title TEXT,
  
  -- Arrays stored as JSONB
  techniques JSONB DEFAULT '[]'::jsonb,
  tools JSONB DEFAULT '[]'::jsonb,
  epis JSONB DEFAULT '[]'::jsonb, -- Personal Protective Equipment
  
  -- Team composition and durations
  team_composition JSONB,
  durations JSONB, -- {mobilization: days, execution: days, demobilization: days}
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_schedule CHECK (schedule IS NOT NULL),
  CONSTRAINT valid_intervention_type CHECK (intervention_type IN ('poda', 'supressao', 'transplante', 'tratamento', 'monitoramento'))
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX idx_intervention_plans_instalacao ON intervention_plans(instalacao_id);
CREATE INDEX idx_intervention_plans_user ON intervention_plans(user_id);
CREATE INDEX idx_intervention_plans_type ON intervention_plans(intervention_type);
CREATE INDEX idx_intervention_plans_plan_id ON intervention_plans(plan_id);
CREATE INDEX idx_intervention_plans_created_at ON intervention_plans(created_at DESC);

-- Index for schedule date queries (using JSONB operators)
CREATE INDEX idx_intervention_plans_schedule_start ON intervention_plans((schedule->>'start'));
CREATE INDEX idx_intervention_plans_schedule_startdate ON intervention_plans((schedule->>'startDate'));

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to generate sequential Plan ID (PI-YYYY-NNN)
CREATE OR REPLACE FUNCTION generate_plan_id()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT := TO_CHAR(NOW(), 'YYYY');
  counter INTEGER;
  new_id TEXT;
BEGIN
  -- Get the highest plan number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(plan_id FROM 'PI-\\d{4}-(\\d{3})') AS INTEGER)
  ), 0) + 1
  INTO counter
  FROM intervention_plans
  WHERE plan_id LIKE 'PI-' || current_year || '-%';
  
  -- Format: PI-2025-001
  new_id := 'PI-' || current_year || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate plan_id on insert
CREATE OR REPLACE FUNCTION set_plan_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan_id IS NULL OR NEW.plan_id = '' THEN
    NEW.plan_id := generate_plan_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_intervention_plans_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREATE TRIGGERS
-- ============================================

-- Trigger to auto-generate plan_id before insert
CREATE TRIGGER trigger_set_plan_id
BEFORE INSERT ON intervention_plans
FOR EACH ROW
EXECUTE FUNCTION set_plan_id();

-- Trigger to update timestamp on update
CREATE TRIGGER trigger_update_intervention_plans_timestamp
BEFORE UPDATE ON intervention_plans
FOR EACH ROW
EXECUTE FUNCTION update_intervention_plans_timestamp();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE intervention_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view plans from their installations
CREATE POLICY "Users can view plans from their installations"
ON intervention_plans FOR SELECT
USING (
  instalacao_id IN (
    SELECT instalacao_id 
    FROM instalacao_membros
    WHERE user_id = auth.uid()
  )
);

-- Policy: Planejadores, Gestores, and Mestre can create plans
CREATE POLICY "Planejadores can create plans"
ON intervention_plans FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM instalacao_membros im
    WHERE im.user_id = auth.uid()
    AND im.instalacao_id = intervention_plans.instalacao_id
    AND EXISTS (
      SELECT 1 FROM perfis p
      WHERE p.id = ANY(im.perfis)
      AND p.nome IN ('Planejador', 'Gestor', 'Mestre')
    )
  )
);

-- Policy: Planejadores, Gestores, and Mestre can update plans
CREATE POLICY "Planejadores can update plans"
ON intervention_plans FOR UPDATE
USING (
  EXISTS (
    SELECT 1 
    FROM instalacao_membros im
    WHERE im.user_id = auth.uid()
    AND im.instalacao_id = intervention_plans.instalacao_id
    AND EXISTS (
      SELECT 1 FROM perfis p
      WHERE p.id = ANY(im.perfis)
      AND p.nome IN ('Planejador', 'Gestor', 'Mestre')
    )
  )
);

-- Policy: Only Gestores and Mestre can delete plans
CREATE POLICY "Gestores can delete plans"
ON intervention_plans FOR DELETE
USING (
  EXISTS (
    SELECT 1 
    FROM instalacao_membros im
    WHERE im.user_id = auth.uid()
    AND im.instalacao_id = intervention_plans.instalacao_id
    AND EXISTS (
      SELECT 1 FROM perfis p
      WHERE p.id = ANY(im.perfis)
      AND p.nome IN ('Gestor', 'Mestre')
    )
  )
);

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on the table
GRANT SELECT, INSERT, UPDATE, DELETE ON intervention_plans TO authenticated;

-- ============================================
-- 7. COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE intervention_plans IS 'Intervention planning module - stores intervention plans with schedule, resources, and team composition';
COMMENT ON COLUMN intervention_plans.plan_id IS 'Human-readable plan identifier (format: PI-YYYY-NNN)';
COMMENT ON COLUMN intervention_plans.intervention_type IS 'Type of intervention: poda, supressao, transplante, tratamento, monitoramento';
COMMENT ON COLUMN intervention_plans.schedule IS 'JSONB schedule object with start/end dates';
COMMENT ON COLUMN intervention_plans.techniques IS 'Array of techniques to be applied';
COMMENT ON COLUMN intervention_plans.tools IS 'Array of tools needed';
COMMENT ON COLUMN intervention_plans.epis IS 'Array of Personal Protective Equipment (EPIs) required';
COMMENT ON COLUMN intervention_plans.durations IS 'JSONB object with mobilization, execution, and demobilization durations in days';
