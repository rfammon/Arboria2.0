-- Fix legacy trees with null codes
-- Based on user report of "old database remnants"
-- Assigns TR-0001, TR-0002... to existing trees without codes

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.arvores
  WHERE codigo IS NULL
)
UPDATE public.arvores
SET codigo = 'TR-' || LPAD(rn::text, 4, '0')
FROM numbered
WHERE arvores.id = numbered.id;

-- Optional: Ensure data integrity for future
-- ALTER TABLE public.arvores ALTER COLUMN codigo SET DEFAULT 'PENDING';
