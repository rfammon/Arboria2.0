
-- Create arvore_fotos table
CREATE TABLE IF NOT EXISTS public.arvore_fotos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    arvore_id UUID NOT NULL REFERENCES public.arvores(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_cover BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_arvore_fotos_arvore_id ON public.arvore_fotos(arvore_id);

-- Enable RLS
ALTER TABLE public.arvore_fotos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view photos of their installation trees"
    ON public.arvore_fotos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.arvores a
            JOIN public.instalacao_membros im ON im.instalacao_id = a.instalacao_id
            WHERE a.id = arvore_fotos.arvore_id
            AND im.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert photos for their installation trees"
    ON public.arvore_fotos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.arvores a
            JOIN public.instalacao_membros im ON im.instalacao_id = a.instalacao_id
            WHERE a.id = arvore_fotos.arvore_id
            AND im.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update photos for their installation trees"
    ON public.arvore_fotos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.arvores a
            JOIN public.instalacao_membros im ON im.instalacao_id = a.instalacao_id
            WHERE a.id = arvore_fotos.arvore_id
            AND im.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete photos for their installation trees"
    ON public.arvore_fotos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.arvores a
            JOIN public.instalacao_membros im ON im.instalacao_id = a.instalacao_id
            WHERE a.id = arvore_fotos.arvore_id
            AND im.user_id = auth.uid()
        )
    );
