-- Add user-requested TRAQ criteria
INSERT INTO traq_risk_criteria (categoria, criterio, peso, failure_prob, tooltip)
VALUES 
    ('Tronco', 'Cancros no tronco principal (estrutura comprometida)', 3, 'Provável', 'Cancros que afetam >30% da circunferência ou associados a trincas/podridão'),
    ('Copa', 'Galhos > 5cm necessitando poda', 2, 'Possível', 'Galhos mortos, pendurados ou lascados com diâmetro significativo');
