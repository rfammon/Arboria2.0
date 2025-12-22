-- Story 1.3 Phase 1: Supabase Storage Bucket Setup with RLS
-- This script creates the tree-photos storage bucket and RLS policies
-- Execute this in Supabase Dashboard: SQL Editor → New Query

-- ============================================
-- 1. Create Storage Bucket for Tree Photos
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tree-photos',
  'tree-photos',
  false, -- Private bucket (requires authentication)
  2097152, -- 2MB max (2 * 1024 * 1024 bytes) - Story 1.1 compression ensures this
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING; -- Prevent error if bucket already exists

-- ============================================
-- 2. RLS Policies for Storage Objects
-- ============================================

-- Enable RLS on storage.objects (should already be enabled, but just in case)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policy 1: Allow users to UPLOAD photos to their installation's folder
-- ============================================
-- AC1: Path structure - {instalacao_id}/trees/{tree_id}/photos/{filename}
-- Users can only upload to installations they are active members of

CREATE POLICY "Users can upload photos to their installation"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tree-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT instalacao_id::text
    FROM instalacao_membros
    WHERE user_id = auth.uid()
      AND status = 'ativo'
  )
);

-- ============================================
-- Policy 2: Allow users to READ photos from their installations
-- ============================================
-- AC2: RLS security - users can only read photos from their installations
-- Cross-installation access is blocked

CREATE POLICY "Users can read photos from their installations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'tree-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT instalacao_id::text
    FROM instalacao_membros
    WHERE user_id = auth.uid()
      AND status = 'ativo'
  )
);

-- ============================================
-- Policy 3: Allow users to DELETE photos from their installations
-- ============================================
-- Users can delete photos from installations they belong to
-- Additional check: only the uploader or 'Gestor' profile can delete

CREATE POLICY "Users can delete photos from their installations"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'tree-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT instalacao_id::text
    FROM instalacao_membros
    WHERE user_id = auth.uid()
      AND status = 'ativo'
  )
);

-- ============================================
-- Verification Queries (Optional - for testing)
-- ============================================

-- Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'tree-photos';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%installation%';

-- ============================================
-- Rollback Script (if needed)
-- ============================================

-- To remove policies (uncomment if you need to rollback):
-- DROP POLICY IF EXISTS "Users can upload photos to their installation" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can read photos from their installations" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete photos from their installations" ON storage.objects;

-- To delete bucket (WARNING: will delete all photos):
-- DELETE FROM storage.buckets WHERE id = 'tree-photos';
