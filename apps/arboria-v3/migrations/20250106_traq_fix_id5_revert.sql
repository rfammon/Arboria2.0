-- Fix: Revert ID 5 (Uniões em V) to require probability
-- User Feedback: "a 5 pode manter a probabilidade de falha"
UPDATE traq_risk_criteria SET requires_probability = true WHERE id = 5;

-- Ensure other potentiating factors are set to false (just in case)
-- IDs: 6, 9, 10, 11, 12, 14, 15
UPDATE traq_risk_criteria SET requires_probability = false WHERE id IN (6, 9, 10, 11, 12, 14, 15);
