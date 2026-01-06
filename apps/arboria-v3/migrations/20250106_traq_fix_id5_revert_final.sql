-- Fix: Set ID 5 (Galhos Cruzados) to NOT require probability (Agravante)
UPDATE traq_risk_criteria SET requires_probability = false WHERE id = 5;

-- Ensure ID 4 (Uniões em V) requires probability
UPDATE traq_risk_criteria SET requires_probability = true WHERE id = 4;

-- Ensure other aggravating factors are set properly (IDs 6, 10, 11, 12, 14, 15)
UPDATE traq_risk_criteria SET requires_probability = false WHERE id IN (6, 10, 11, 12, 14, 15);
