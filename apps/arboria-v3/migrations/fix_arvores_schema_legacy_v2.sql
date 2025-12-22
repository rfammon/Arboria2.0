-- Add missing columns to 'arvores' table to match new application logic
-- Designed for legacy project update - V2

DO $$ 
BEGIN 
    -- 1. Add 'original_updated_at' (Cause of latest error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'original_updated_at') THEN
        ALTER TABLE public.arvores ADD COLUMN original_updated_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- 2. Add 'dap_estimated' (Likely missing too)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'dap_estimated') THEN
        ALTER TABLE public.arvores ADD COLUMN dap_estimated BOOLEAN DEFAULT false;
    END IF;

    -- 3. Add 'estimated_error_margin'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'estimated_error_margin') THEN
        ALTER TABLE public.arvores ADD COLUMN estimated_error_margin TEXT;
    END IF;

    -- 4. Add 'target_type' (Possible snake_case mismatch with targettype)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'target_type') THEN
        ALTER TABLE public.arvores ADD COLUMN target_type TEXT;
    END IF;

    -- 5. Add 'image_url' (If not exists)
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'image_url') THEN
        ALTER TABLE public.arvores ADD COLUMN image_url TEXT;
    END IF;

    -- 6. Add 'has_photo' (If not exists, legacy might have hasphoto)
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'has_photo') THEN
        ALTER TABLE public.arvores ADD COLUMN has_photo BOOLEAN DEFAULT false;
    END IF;

END $$;

-- Force Schema Cache reload
NOTIFY pgrst, 'reload schema';
