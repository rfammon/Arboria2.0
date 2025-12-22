-- Add missing columns to 'arvores' table to match new application logic
-- Designed for legacy project update

DO $$ 
BEGIN 
    -- 1. Add 'driving_factor' (The cause of the specific error reported)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'driving_factor') THEN
        ALTER TABLE public.arvores ADD COLUMN driving_factor TEXT;
    END IF;

    -- 2. Add 'failure_prob' (Required by useTreeMutations logic if used)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'failure_prob') THEN
        ALTER TABLE public.arvores ADD COLUMN failure_prob TEXT;
    END IF;

    -- 3. Add 'target_category' (If missing, legacy might have 'targetcategory' but code uses snake_case in new payloads)
    -- Checking if specific payload fields need these. TreeForm sends snake_case.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'target_category') THEN
        ALTER TABLE public.arvores ADD COLUMN target_category INTEGER;
    END IF;
    
    -- 4. Add 'residual_risk'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'residual_risk') THEN
        ALTER TABLE public.arvores ADD COLUMN residual_risk TEXT;
    END IF;

    -- 5. Add 'risk_factors' (Array of integers or similar)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'risk_factors') THEN
        ALTER TABLE public.arvores ADD COLUMN risk_factors INTEGER[]; -- Assuming integer array for 0/1 or IDs
    END IF;

     -- 6. Add 'impact_prob'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'arvores' AND column_name = 'impact_prob') THEN
        ALTER TABLE public.arvores ADD COLUMN impact_prob TEXT;
    END IF;

END $$;

-- Force Schema Cache reload (sometimes helpful)
NOTIFY pgrst, 'reload schema';
