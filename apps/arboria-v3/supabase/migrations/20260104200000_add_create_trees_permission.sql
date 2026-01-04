-- ============================================================================
-- Add create_trees permission to profiles
-- ============================================================================
-- Description: Adds create_trees permission to all profiles except Executante
-- Date: 2026-01-04
-- ============================================================================

-- Update Mestre profile (already has global_access, but let's be explicit)
UPDATE perfis 
SET permissoes = permissoes || '["create_trees"]'::jsonb
WHERE nome = 'Mestre' 
  AND NOT (permissoes ? 'create_trees');

-- Update Gestor profile
UPDATE perfis 
SET permissoes = permissoes || '["create_trees"]'::jsonb
WHERE nome = 'Gestor' 
  AND NOT (permissoes ? 'create_trees');

-- Update Planejador profile  
UPDATE perfis 
SET permissoes = permissoes || '["create_trees"]'::jsonb
WHERE nome = 'Planejador' 
  AND NOT (permissoes ? 'create_trees');

-- Inventariador already has create_trees, but let's ensure it
UPDATE perfis 
SET permissoes = permissoes || '["create_trees"]'::jsonb
WHERE nome = 'Inventariador' 
  AND NOT (permissoes ? 'create_trees');

-- Executante should NOT have create_trees permission (view only)
-- No update needed for Executante

-- Verify the changes
SELECT nome, permissoes 
FROM perfis 
ORDER BY nivel;
