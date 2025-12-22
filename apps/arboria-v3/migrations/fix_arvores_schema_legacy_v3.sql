-- Add 'codigo' column to 'arvores' table to match new application logic
-- Designed for legacy project update - V3

DO $$ 
BEGIN 
    -- 1. Add 'codigo' (Cause of intervention plan fetch error)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'codigo') THEN
        ALTER TABLE public.arvores ADD COLUMN codigo TEXT;
        -- Optional: auto-generate code if null? unique index?
        -- For now, just adding the column to satisfy the select query.
    END IF;

END $$;

-- Force Schema Cache reload
NOTIFY pgrst, 'reload schema';
