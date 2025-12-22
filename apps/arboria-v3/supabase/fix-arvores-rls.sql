-- Fix RLS policies for arvores table
-- This allows users to insert trees into installations they are members of

-- Enable RLS if not already enabled
ALTER TABLE arvores ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if exists (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert trees to their installations" ON arvores;
DROP POLICY IF EXISTS "Users can create trees" ON arvores;
DROP POLICY IF EXISTS "Authenticated users can insert trees" ON arvores;

-- Create proper INSERT policy
-- Users can insert trees into installations they are active members of
CREATE POLICY "Users can insert trees to their installations"
ON arvores
FOR INSERT
TO authenticated
WITH CHECK (
  instalacao_id IN (
    SELECT instalacao_id
    FROM instalacao_membros
    WHERE user_id = auth.uid()
      AND status = 'ativo'
  )
);

-- Verify SELECT policy exists (for viewing trees)
-- If not, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'arvores' 
    AND policyname LIKE '%select%' OR policyname LIKE '%view%'
  ) THEN
    CREATE POLICY "Users can view trees from their installations"
    ON arvores
    FOR SELECT
    TO authenticated
    USING (
      instalacao_id IN (
        SELECT instalacao_id
        FROM instalacao_membros
        WHERE user_id = auth.uid()
          AND status = 'ativo'
      )
    );
  END IF;
END
$$;

-- Verify UPDATE policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'arvores' 
    AND policyname LIKE '%update%'
  ) THEN
    CREATE POLICY "Users can update trees from their installations"
    ON arvores
    FOR UPDATE
    TO authenticated
    USING (
      instalacao_id IN (
        SELECT instalacao_id
        FROM instalacao_membros
        WHERE user_id = auth.uid()
          AND status = 'ativo'
      )
    )
    WITH CHECK (
      instalacao_id IN (
        SELECT instalacao_id
        FROM instalacao_membros
        WHERE user_id = auth.uid()
          AND status = 'ativo'
      )
    );
  END IF;
END
$$;

-- Verify DELETE policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'arvores' 
    AND policyname LIKE '%delete%'
  ) THEN
    CREATE POLICY "Users can delete trees from their installations"
    ON arvores
    FOR DELETE
    TO authenticated
    USING (
      instalacao_id IN (
        SELECT instalacao_id
        FROM instalacao_membros
        WHERE user_id = auth.uid()
          AND status = 'ativo'
      )
    );
  END IF;
END
$$;

-- Verification query
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'arvores'
ORDER BY cmd, policyname;
