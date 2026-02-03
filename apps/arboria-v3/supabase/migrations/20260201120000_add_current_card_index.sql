-- Add current_card_index to user_education_progress
ALTER TABLE public.user_education_progress 
ADD COLUMN IF NOT EXISTS current_card_index INTEGER DEFAULT 0;

COMMENT ON COLUMN public.user_education_progress.current_card_index IS 'Index of the last card viewed by the user in the education module.';
