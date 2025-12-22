-- Story 1.3: Storage Policies Manual Step
-- Execute this in Supabase Dashboard SQL Editor to enable photo uploads

-- Policy 1: Uploads
CREATE POLICY "Users can upload photos to their installation"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'tree-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT instalacao_id::text FROM instalacao_membros WHERE user_id = auth.uid() AND status = 'ativo'
  )
);

-- Policy 2: Reads
CREATE POLICY "Users can read photos from their installations"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'tree-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT instalacao_id::text FROM instalacao_membros WHERE user_id = auth.uid() AND status = 'ativo'
  )
);

-- Policy 3: Deletes
CREATE POLICY "Users can delete photos from their installations"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'tree-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT instalacao_id::text FROM instalacao_membros WHERE user_id = auth.uid() AND status = 'ativo'
  )
);
