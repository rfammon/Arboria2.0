-- EMERGENCY DEBUG: Unlock INSERT on arvores
-- Use this ONLY to verify if the problem is strictly related to installation membership validation

-- Drop strict policy
DROP POLICY IF EXISTS "policy_arvores_insert" ON arvores;

-- Create permissive policy (authenticated users can create trees anywhere)
-- WARNING: Removes isolation check temporarily!
CREATE POLICY "policy_arvores_insert_DEBUG"
ON arvores FOR INSERT TO authenticated
WITH CHECK (true);
