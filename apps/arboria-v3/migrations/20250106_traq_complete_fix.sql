-- TRAQ Potentiating Factors - Complete Fix
-- This migration ensures requires_probability is properly set for all criteria

-- First, set ALL criteria to requires_probability = true (default)
UPDATE traq_risk_criteria 
SET requires_probability = true;

-- Then, set potentiating factors (aggravating factors) to requires_probability = false
-- These are the factors that do NOT require probability input
UPDATE traq_risk_criteria 
SET requires_probability = false
WHERE id IN (
    18,  -- Question 6: "Há galhos cruzados ou friccionando entre si?"
    19,  -- Question 7: "A árvore apresenta copa assimétrica (>30% de desequilíbrio)?"
    23,  -- Question 9: "A árvore interfere em redes elétricas ou estruturas urbanas?" (Conflitos)
    24,  -- Question 10: "A espécie é conhecida por apresentar alta taxa de falhas?"
    25,  -- Question 11: "A árvore já sofreu podas drásticas ou brotação epicórmica intensa?"
    27,  -- Question 14: "Há perda visível de raízes de sustentação (>40%)?"
    28   -- Question 15: "Há sinais de compactação ou asfixia radicular?"
);

-- Verify the changes
SELECT 
    id,
    ordem,
    criterio,
    requires_probability,
    CASE 
        WHEN requires_probability = false THEN '❌ NO PROB (Aggravating)'
        WHEN requires_probability = true THEN '✅ REQUIRES PROB'
        ELSE '⚠️  NULL (ERROR!)'
    END as status
FROM traq_risk_criteria
ORDER BY ordem;
