-- SANITY CHECK: Disable RLS on arvores table
-- Use this to confirm if the block is definitely RLS related.
-- If this works, the previous RLS policies were blocking somehow (maybe user is anon?)
-- If this fails, it's NOT RLS (likely GRANTs/Permissions)

ALTER TABLE arvores DISABLE ROW LEVEL SECURITY;
