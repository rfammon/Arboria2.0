-- CLEANUP AND FIX ALL ARVORES POLICIES
-- This script removes ALL existing policies and applies a clean set based on installation membership

-- 1. Drop ALL existing policies for arvores to remove conflicts
DROP POLICY IF EXISTS "Apenas Gestores podem deletar árvores" ON arvores;
DROP POLICY IF EXISTS "Inventariadores e Planejadores podem criar árvores" ON arvores;
DROP POLICY IF EXISTS "Inventariadores e Planejadores podem editar árvores" ON arvores;
DROP POLICY IF EXISTS "Membros criam árvores em suas instalações" ON arvores;
DROP POLICY IF EXISTS "Membros deletam árvores de suas instalações" ON arvores;
DROP POLICY IF EXISTS "Membros editam árvores de suas instalações" ON arvores;
DROP POLICY IF EXISTS "Membros veem árvores de suas instalações" ON arvores;
DROP POLICY IF EXISTS "Users can delete trees from their installations" ON arvores;
DROP POLICY IF EXISTS "Users can insert trees to their installations" ON arvores;
DROP POLICY IF EXISTS "Users can update trees from their installations" ON arvores;
DROP POLICY IF EXISTS "Usuários têm controle total sobre suas árvores" ON arvores;
DROP POLICY IF EXISTS "Usuários veem árvores de suas instalações" ON arvores;
DROP POLICY IF EXISTS "Authenticated users can insert trees" ON arvores;
DROP POLICY IF EXISTS "Users can create trees" ON arvores;

-- 2. Ensure RLS is enabled
ALTER TABLE arvores ENABLE ROW LEVEL SECURITY;

-- 3. Apply CLEAN policies based on installation membership

-- SELECT: Members can view trees in their installations
CREATE POLICY "policy_arvores_select"
ON arvores FOR SELECT TO authenticated
USING (
  instalacao_id IN (
    SELECT instalacao_id FROM instalacao_membros 
    WHERE user_id = auth.uid() AND status = 'ativo'
  )
);

-- INSERT: Members can create trees in their installations
CREATE POLICY "policy_arvores_insert"
ON arvores FOR INSERT TO authenticated
WITH CHECK (
  instalacao_id IN (
    SELECT instalacao_id FROM instalacao_membros 
    WHERE user_id = auth.uid() AND status = 'ativo'
  )
);

-- UPDATE: Members can update trees in their installations
CREATE POLICY "policy_arvores_update"
ON arvores FOR UPDATE TO authenticated
USING (
  instalacao_id IN (
    SELECT instalacao_id FROM instalacao_membros 
    WHERE user_id = auth.uid() AND status = 'ativo'
  )
)
WITH CHECK (
  instalacao_id IN (
    SELECT instalacao_id FROM instalacao_membros 
    WHERE user_id = auth.uid() AND status = 'ativo'
  )
);

-- DELETE: Members can delete trees in their installations
CREATE POLICY "policy_arvores_delete"
ON arvores FOR DELETE TO authenticated
USING (
  instalacao_id IN (
    SELECT instalacao_id FROM instalacao_membros 
    WHERE user_id = auth.uid() AND status = 'ativo'
  )
);

-- 4. Verify policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'arvores';
