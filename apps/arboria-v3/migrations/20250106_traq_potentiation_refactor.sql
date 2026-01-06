-- Migration: Refactor TRAQ Criteria for Potentiating Factors
-- 1. Add requires_probability column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'traq_risk_criteria' AND column_name = 'requires_probability') THEN
        ALTER TABLE public.traq_risk_criteria ADD COLUMN requires_probability BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 2. Update specific criteria to be potentiating (requires_probability = false) and set new weights
-- ID 5: Uniões em V (Critical Structure)
UPDATE traq_risk_criteria SET requires_probability = false, peso = 5 WHERE id = 5;

-- ID 6: Galhos cruzados (Chronic/Low)
UPDATE traq_risk_criteria SET requires_probability = false, peso = 2 WHERE id = 6;

-- ID 9: Vias públicas (High Target)
UPDATE traq_risk_criteria SET requires_probability = false, peso = 4 WHERE id = 9;

-- ID 10: Risco queda sobre edificações/pessoas (Critical Target)
UPDATE traq_risk_criteria SET requires_probability = false, peso = 5 WHERE id = 10;

-- ID 11: Conflitos redes (High Consequence)
UPDATE traq_risk_criteria SET requires_probability = false, peso = 4 WHERE id = 11;

-- ID 12: Espécie alta taxa de falhas (Predictive)
UPDATE traq_risk_criteria SET requires_probability = false, peso = 3 WHERE id = 12;

-- ID 14: Calçadas rachadas (Infrastructure conflict)
UPDATE traq_risk_criteria SET requires_probability = false, peso = 3 WHERE id = 14;

-- ID 15: Perda visível de raízes (Critical Stability)
UPDATE traq_risk_criteria SET requires_probability = false, peso = 5 WHERE id = 15;

-- Ensure all others are true (default is true, but good to be explicit for safety)
UPDATE traq_risk_criteria SET requires_probability = true WHERE id NOT IN (5, 6, 9, 10, 11, 12, 14, 15);
