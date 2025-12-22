-- Story 1.3 Phase 2: tree_photos Metadata Table with RLS
-- Migration: 20251212082255_create_tree_photos_table
-- Execute this in Supabase Dashboard: SQL Editor → New Query

-- ============================================
-- 1. Create tree_photos Table
-- ============================================

CREATE TABLE IF NOT EXISTS tree_photos (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign keys
  tree_id UUID NOT NULL REFERENCES arvores(id) ON DELETE CASCADE,
  instalacao_id UUID NOT NULL REFERENCES instalacoes(id) ON DELETE CASCADE,
  
  -- Storage reference (AC1: path structure)
  storage_path TEXT NOT NULL UNIQUE, -- {instalacao_id}/trees/{tree_id}/photos/{filename}
  filename TEXT NOT NULL,
  
  -- Photo metadata
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 2097152), -- Max 2MB
  mime_type TEXT NOT NULL DEFAULT 'image/jpeg' CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp')),
  
  -- EXIF data (from Story 1.1 compression)
  gps_latitude DOUBLE PRECISION CHECK (gps_latitude >= -90 AND gps_latitude <= 90),
  gps_longitude DOUBLE PRECISION CHECK (gps_longitude >= -180 AND gps_longitude <= 180),
  captured_at TIMESTAMPTZ,
  
  -- Audit fields (AC1: uploaded_by, upload_date)
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Display order for gallery
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. Create Indexes for Performance
-- ============================================

-- Most common query: get all photos for a tree
CREATE INDEX IF NOT EXISTS idx_tree_photos_tree_id 
ON tree_photos(tree_id);

-- Filter photos by installation
CREATE INDEX IF NOT EXISTS idx_tree_photos_instalacao_id 
ON tree_photos(instalacao_id);

-- Audit queries: who uploaded what
CREATE INDEX IF NOT EXISTS idx_tree_photos_uploaded_by 
ON tree_photos(uploaded_by);

-- Composite index for installation + tree queries
CREATE INDEX IF NOT EXISTS idx_tree_photos_instalacao_tree 
ON tree_photos(instalacao_id, tree_id);

-- Index for display order (gallery sorting)
CREATE INDEX IF NOT EXISTS idx_tree_photos_display_order 
ON tree_photos(tree_id, display_order);

-- ============================================
-- 3. Create updated_at Trigger Function (if not exists)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tree_photos
DROP TRIGGER IF EXISTS update_tree_photos_updated_at ON tree_photos;
CREATE TRIGGER update_tree_photos_updated_at
  BEFORE UPDATE ON tree_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Enable Row Level Security
-- ============================================

ALTER TABLE tree_photos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS Policy: INSERT (Users can upload photos to their installations)
-- ============================================
-- AC1: Users can only upload photos for trees in installations they belong to

CREATE POLICY "Users can upload photos to their installation trees"
ON tree_photos
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

-- ============================================
-- 6. RLS Policy: SELECT (Users can view photos from their installations)
-- ============================================
-- AC2: Cross-installation blocking - users can only see their installation's photos

CREATE POLICY "Users can view photos from their installations"
ON tree_photos
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

-- ============================================
-- 7. RLS Policy: UPDATE (Users can update photo metadata)
-- ============================================
-- Users can update display_order and other metadata for their installation's photos

CREATE POLICY "Users can update photos from their installations"
ON tree_photos
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

-- ============================================
-- 8. RLS Policy: DELETE (Users can delete their own photos)
-- ============================================
-- AC1: Only the uploader can delete (or 'Gestor' profile - future enhancement)

CREATE POLICY "Users can delete their own photos"
ON tree_photos
FOR DELETE
TO authenticated
USING (
  uploaded_by = auth.uid()
  AND instalacao_id IN (
    SELECT instalacao_id
    FROM instalacao_membros
    WHERE user_id = auth.uid()
      AND status = 'ativo'
  )
);

-- ============================================
-- Verification Queries (Optional - for testing)
-- ============================================

-- Check if table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tree_photos'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'tree_photos';

-- Check RLS policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'tree_photos'
ORDER BY policyname;

-- Check trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'tree_photos';

-- ============================================
-- Rollback Script (if needed)
-- ============================================

-- To remove table and all policies (WARNING: deletes all photo metadata):
-- DROP TABLE IF EXISTS tree_photos CASCADE;

-- To remove individual policies:
-- DROP POLICY IF EXISTS "Users can upload photos to their installation trees" ON tree_photos;
-- DROP POLICY IF EXISTS "Users can view photos from their installations" ON tree_photos;
-- DROP POLICY IF EXISTS "Users can update photos from their installations" ON tree_photos;
-- DROP POLICY IF EXISTS "Users can delete their own photos" ON tree_photos;
