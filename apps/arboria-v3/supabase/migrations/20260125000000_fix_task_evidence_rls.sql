
-- Migração para corrigir RLS da tabela task_evidence e adicionar isolamento multi-tenant
-- Data: 2026-01-25

-- 1. Adiciona a coluna de isolamento seguindo o padrão do projeto (STRICT ISOLATION)
ALTER TABLE public.task_evidence 
ADD COLUMN IF NOT EXISTS instalacao_id UUID REFERENCES public.instalacoes(id);

-- 2. Preenche os dados existentes baseando-se na tarefa
UPDATE public.task_evidence te
SET instalacao_id = t.instalacao_id
FROM public.tasks t
WHERE t.id = te.task_id AND te.instalacao_id IS NULL;

-- 3. Recria a política de inserção de forma robusta e inclusiva para Gestores/Mestres
DROP POLICY IF EXISTS "task_evidence_insert_policy" ON public.task_evidence;

CREATE POLICY "task_evidence_insert_policy" ON public.task_evidence
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks t
      LEFT JOIN public.instalacao_membros im ON im.instalacao_id = t.instalacao_id AND im.user_id = auth.uid()
      WHERE t.id = task_evidence.task_id
      AND (
        -- Executante atribuído ou Membro da Equipe
        t.assigned_to = auth.uid() 
        OR auth.uid() = ANY(t.team_members)
        -- OU usuário com perfil de Gestor ou Mestre na instalação da tarefa
        OR EXISTS (
          SELECT 1 FROM public.perfis p
          WHERE p.id = ANY(im.perfis)
          AND p.nome IN ('Gestor', 'Mestre')
        )
      )
    )
  );

-- 4. Ajuste na política de visualização para usar a nova coluna de isolamento
DROP POLICY IF EXISTS "task_evidence_select_policy" ON public.task_evidence;
CREATE POLICY "task_evidence_select_policy" ON public.task_evidence
  FOR SELECT
  USING (
    instalacao_id IN (
      SELECT instalacao_id FROM public.instalacao_membros WHERE user_id = auth.uid()
    )
  );
