-- Add dependencies column to intervention_plans table for simple task dependency tracking
-- Storing as JSONB array of plan_ids (e.g. ['PI-2025-001', 'PI-2025-002'])

ALTER TABLE intervention_plans
ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN intervention_plans.dependencies IS 'Array of plan_ids that this plan depends on (Simple Finish-to-Start)';
