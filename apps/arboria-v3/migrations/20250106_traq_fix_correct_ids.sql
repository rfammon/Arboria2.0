-- CORRECT FIX: Using actual database IDs
-- Based on debug output showing IDs start at 13

-- AGGRAVATING FACTORS (Fatores Agravantes) - NO probability required
-- Question 6: "Galhos cruzados" = ID 18
-- Question 7: "Copa assimétrica" = ID 19
-- Question 9: "Conflitos/redes elétricas" = ID 23
-- Question 10: "Espécie com alta taxa de falhas" = ID 24
-- Question 11: "Podas drásticas" = ID 25
-- Question 14: "Perda de raízes" = ID 27
-- Question 15: "Compactação radicular" = ID 28

UPDATE traq_risk_criteria 
SET requires_probability = false 
WHERE id IN (18, 19, 23, 24, 25, 27, 28);

-- STANDARD FACTORS - Probability IS required
-- All others should have requires_probability = true
UPDATE traq_risk_criteria 
SET requires_probability = true 
WHERE id IN (13, 14, 15, 16, 17, 20, 26, 29);
