-- Clean database to avoid conflicts (Requested by User)
TRUNCATE TABLE public.trees CASCADE;
-- Also truncate traq_assessments if it exists/is used, though trees cascade might handle it if FK exists
-- TRUNCATE TABLE public.traq_assessments;

-- Create traq_risk_criteria table if it doesn't exist (fixing original missing table issue)
CREATE TABLE IF NOT EXISTS public.traq_risk_criteria (
    id SERIAL PRIMARY KEY,
    categoria TEXT NOT NULL,
    criterio TEXT NOT NULL,
    failure_prob TEXT NOT NULL, 
    peso INTEGER DEFAULT 0,
    tooltip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for traq_risk_criteria
ALTER TABLE public.traq_risk_criteria ENABLE ROW LEVEL SECURITY;

-- Policy to allow read access to authenticated users
CREATE POLICY "Allow read access for authenticated users" 
ON public.traq_risk_criteria FOR SELECT 
TO authenticated 
USING (true);

-- Insert Default Data (Science-based mapping)
INSERT INTO public.traq_risk_criteria (categoria, criterio, failure_prob, peso, tooltip) VALUES
('Raízes', 'Podridão/Fungos na base', 'Iminente', 30, 'Presença de fungos, corpos de frutificação ou madeira podre na base'),
('Raízes', 'Danos mecânicos severos >40%', 'Provável', 20, 'Corte de raízes, compactação severa ou obras'),
('Tronco', 'Inclinação anormal/recente', 'Iminente', 30, 'Árvore mudou inclinação recentemente ou solo levantado'),
('Tronco', 'Fissuras/Rachaduras longitud.', 'Provável', 20, 'Rachaduras extensas no tronco'),
('Tronco', 'Cavidades >30% diâmetro', 'Provável', 20, 'Oco significativo no tronco principal'),
('Copa', 'Galhos mortos/pendurados >10cm', 'Iminente', 30, 'Galhos grandes secos ou pendurados (risco de queda imediata)'),
('Copa', 'Codominância com casca inclusa', 'Provável', 20, 'Troncos duplos com união fraca'),
('Outros', 'Interferência rede elétrica', 'Possível', 10, 'Galhos tocando fiação'),
('Outros', 'Histórico de quedas no local', 'Possível', 10, 'Local com ventos fortes ou solo instável');

-- Update Trees table schema
-- Add driving_factor to explain high risk (Science methodology requirement)
ALTER TABLE public.trees 
ADD COLUMN IF NOT EXISTS driving_factor TEXT;

-- Verify failure_prob column exists (it should, but ensuring)
ALTER TABLE public.trees 
ADD COLUMN IF NOT EXISTS failure_prob TEXT;

-- Ensure RLS consistency
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;
