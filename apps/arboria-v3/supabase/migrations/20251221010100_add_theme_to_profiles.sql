-- Add theme column to profiles table
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';

-- Comment on the column
COMMENT ON COLUMN public.user_profiles.theme IS 'User preferred UI theme';
