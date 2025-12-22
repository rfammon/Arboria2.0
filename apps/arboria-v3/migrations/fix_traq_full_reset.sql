-- Full Reset of TRAQ Criteria to ensure consistency
-- includes Schema Fix for missing columns 'ordem' and 'active'

-- 1. Schema Fix: Add missing columns if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'traq_risk_criteria' AND column_name = 'ordem') THEN
        ALTER TABLE public.traq_risk_criteria ADD COLUMN ordem INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'traq_risk_criteria' AND column_name = 'ativo') THEN
        ALTER TABLE public.traq_risk_criteria ADD COLUMN ativo BOOLEAN DEFAULT true;
    END IF;

    -- Also check for 'active' vs 'ativo'. The code uses 'ativo' in select .eq('ativo', true).
    -- But my previous failed insert tried 'active'. Let's ensure we use 'ativo' to match the code.
END $$;

-- 2. Truncate table
TRUNCATE TABLE public.traq_risk_criteria CASCADE;

-- 3. Insert Complete List
-- Note: using 'ativo' to match the column name expected by useTRAQCriteria hook
INSERT INTO public.traq_risk_criteria (categoria, criterio, peso, failure_prob, ordem, ativo) 
VALUES 
    ('Copa e Galhos', 'Galhos > 5 cm necessitando poda (mortos/pendurados)', 3, 'Possível', 1, true),
    ('Tronco', 'Existem rachaduras ou fendas no tronco ou galhos principais?', 5, 'Provável', 2, true),
    ('Tronco', 'Há sinais de apodrecimento (madeira esponjosa, fungos, cavidades)?', 5, 'Provável', 3, true),
    ('Tronco', 'Cancros no tronco principal (estrutura comprometida)', 3, 'Provável', 4, true),
    ('Estrutura', 'A árvore possui uniões em "V" com casca inclusa?', 4, 'Possível', 5, true),
    ('Copa e Galhos', 'Há galhos cruzados ou friccionando entre si?', 2, 'Possível', 6, true),
    ('Copa e Galhos', 'A árvore apresenta copa assimétrica (>30% de desequilíbrio)?', 2, 'Possível', 7, true),
    ('Estabilidade', 'Há sinais de inclinação anormal ou recente?', 5, 'Iminente', 8, true),
    ('Alvo', 'A árvore está próxima a vias públicas ou áreas de circulação?', 5, 'Possível', 9, true),
    ('Alvo', 'Há risco de queda sobre edificações, veículos ou pessoas?', 5, 'Provável', 10, true),
    ('Conflitos', 'A árvore interfere em redes elétricas ou estruturas urbanas?', 4, 'Possível', 11, true),
    ('Espécie', 'A espécie é conhecida por apresentar alta taxa de falhas?', 3, 'Possível', 12, true),
    ('Histórico', 'A árvore já sofreu podas drásticas ou brotação epicórmica intensa?', 3, 'Possível', 13, true),
    ('Raízes', 'Há calçadas rachadas ou tubulações expostas próximas à base?', 3, 'Possível', 14, true),
    ('Raízes', 'Há perda visível de raízes de sustentação (>40%)?', 5, 'Iminente', 15, true),
    ('Raízes', 'Há sinais de compactação ou asfixia radicular?', 3, 'Possível', 16, true),
    ('Raízes', 'Há apodrecimento em raízes primárias (>3 cm)?', 5, 'Provável', 17, true);
