-- Migration to update task_alerts check constraint
DO $$ 
BEGIN
    -- Drop the existing constraint if it exists (name might vary, so we try standard naming or look it up)
    -- Usually postgres names it task_alerts_alert_type_check
    ALTER TABLE public.task_alerts DROP CONSTRAINT IF EXISTS task_alerts_alert_type_check;

    -- Add the new constraint with all values
    ALTER TABLE public.task_alerts 
    ADD CONSTRAINT task_alerts_alert_type_check 
    CHECK (alert_type IN (
        'SOS', 
        'HELP', 
        'EQUIPMENT_FAILURE', 
        'SAFETY_ISSUE', 
        'BLOCKAGE', 
        'OTHER',
        'ENVIRONMENTAL',
        'TECHNICAL',
        'OPERATIONAL'
    ));
END $$;
