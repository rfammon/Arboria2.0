-- Add theme column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';

-- Comment on the column
COMMENT ON COLUMN public.profiles.theme IS 'User preferred UI theme';
