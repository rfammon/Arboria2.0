-- Add tree_id column to intervention_plans table
ALTER TABLE intervention_plans 
ADD COLUMN tree_id uuid REFERENCES arvores(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_intervention_plans_tree_id ON intervention_plans(tree_id);

-- Update RLS policies to allow access if user has access to the tree's installation
-- (This is already covered by the existing policy checking instalacao_id, 
--  assuming tree belongs to the same installation, but good to be aware)
