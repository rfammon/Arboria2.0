# Arboria v3 — Plano de Melhorias UI/UX

> **Criado em:** 22 de Janeiro de 2026  
> **Status:** Planejamento  
> **Versão:** 1.0

## Resumo Executivo

O Arboria já possui uma base sólida com o sistema **"Dual Density"** (campo vs escritório), suporte a 7 temas e componentes shadcn/ui. Este plano visa elevar a aplicação de funcional para polida e profissional.

---

## 1. Consolidação do Design System

**Objetivo:** Criar uma fonte única de verdade para estilos.

| Melhoria | Detalhes | Prioridade | Esforço |
|:---------|:---------|:-----------|:--------|
| **Escala Tipográfica** | Definir estilos `h1`-`h4` e `body` em `index.css` usando `@layer base`. Garantir que fontes escalam com Dual Density (texto maior em modo Field). | 🔴 Alta | Pequeno |
| **Auditoria de Tokens** | Substituir cores hardcoded (`text-blue-600`, `bg-slate-100`) por variáveis semânticas (`text-primary`, `bg-muted`). | 🔴 Alta | Médio |
| **Padronização de Variantes** | Criar variantes estritas para Buttons e Cards no shadcn para evitar overrides avulsos. | 🟡 Média | Médio |
| **Níveis de Glassmorphism** | Definir `.glass-subtle`, `.glass-default`, `.glass-heavy` para padronizar blur e opacidade. | 🟡 Média | Pequeno |

---

## 2. Hierarquia Visual & Consistência

**Objetivo:** Reduzir carga cognitiva com elementos similares tendo aparência e comportamento idênticos.

| Melhoria | Detalhes | Prioridade | Esforço |
|:---------|:---------|:-----------|:--------|
| **Padronização de Cards** | Criar componente "Surface" universal que gerencia opacidade, borda e blur baseado no tema ativo. | 🔴 Alta | Médio |
| **Polish dos Cards do Dashboard** | Unificar cards de features. Garantir containers de ícones com tamanhos consistentes. | 🟡 Média | Pequeno |
| **Unificação de Status Pills** | Padronizar badges de status (Execution) usando componente shared com cores mapeadas (Verde=Concluído, Âmbar=Pendente). | 🟡 Média | Pequeno |
| **Sistema de Profundidade** | Definir estratégia de elevação: Flat para listas office, elevated para elementos field ativos. | 🟢 Baixa | Pequeno |

---

## 3. Micro-interações & Feedback

**Objetivo:** Fazer a interface parecer viva e responsiva.

| Melhoria | Detalhes | Prioridade | Esforço |
|:---------|:---------|:-----------|:--------|
| **Indicadores de Interação** | Adicionar `cursor-pointer`, `hover:scale-[1.02]`, `active:scale-[0.98]` a todos os cards clicáveis. | 🔴 Alta | Pequeno |
| **Timing Global de Transição** | Adicionar utilitário global (`transition-all duration-300 ease-spring`) para transições suaves. | 🟡 Média | Pequeno |
| **Estratégia de Skeleton Loading** | Substituir spinners genéricos por Skeletons que espelham o layout (Inventory, Dashboard). | 🟡 Média | Médio |
| **Ilustrações de Empty State** | Criar componente `<EmptyState />` reutilizável com iconografia consistente e CTAs. | 🟢 Baixa | Médio |

---

## 4. Melhorias de Acessibilidade

**Objetivo:** Garantir usabilidade para todos, em qualquer condição de luz (crucial para campo).

| Melhoria | Detalhes | Prioridade | Esforço |
|:---------|:---------|:-----------|:--------|
| **Verificação de Contraste** | Garantir que texto sobre glass atenda WCAG AA. Adicionar fallback `bg-background/90` para alto contraste. | 🔴 Alta | Médio |
| **Padronização de Focus Ring** | Implementar estilo custom `ring-offset-background` para todos elementos interativos. | 🔴 Alta | Pequeno |
| **Enforcement de Touch Targets** | Aplicar rigorosamente 56px de altura para elementos interativos em Mobile/Field. | 🔴 Alta | Médio |
| **Labels para Screen Readers** | Auditar botões icon-only (map toggles, SOS) para `aria-label` ou texto `sr-only`. | 🟡 Média | Pequeno |

---

## 5. Experiência Mobile/Campo

**Objetivo:** Otimizar para uso com uma mão, visibilidade ao ar livre e interação touch.

| Melhoria | Detalhes | Prioridade | Esforço |
|:---------|:---------|:-----------|:--------|
| **Otimização da Zona do Polegar** | Garantir ações primárias (FABs, Submit) no terço inferior da tela em TreeForm e Inventory. | 🔴 Alta | Médio |
| **Gestos de Swipe** | Implementar swipe-to-action (Completar/Editar) para itens de lista em Execution e Inventory. | 🟡 Média | Grande |
| **Tema Outdoor/Alta Visibilidade** | Criar tema específico para luz solar (alto contraste, fundo branco, texto preto, sem blur). | 🟡 Média | Médio |
| **Feedback Háptico** | Integrar `Haptics` (Capacitor) para interações-chave: Success, Error, Long press, SOS. | 🟢 Baixa | Pequeno |

---

## 6. Dashboard & Navegação

**Objetivo:** Simplificar wayfinding e clarificar status do sistema.

| Melhoria | Detalhes | Prioridade | Esforço |
|:---------|:---------|:-----------|:--------|
| **Navegação Adaptativa** | Reforçar "Bottom Bar" para Mobile e "Sidebar" para Desktop. Garantir transição suave ao redimensionar (Tauri). | 🔴 Alta | Grande |
| **Indicadores de Estado Ativo** | Itens de navegação ativos devem ter indicador visual claro (pill colorida ou background) vs apenas mudança de cor de texto. | 🟡 Média | Pequeno |
| **Consolidação do Header** | Em Mobile, reduzir altura do header e colapsar ações em menu "Mais" para maximizar área de visualização. | 🟡 Média | Médio |
| **Breadcrumbs** | Implementar breadcrumbs para páginas profundas (Tree Details, Education Articles). | 🟢 Baixa | Médio |

---

## 7. Formulários & Entrada de Dados

**Objetivo:** Reduzir fricção na captura de dados, o principal driver de valor da app.

| Melhoria | Detalhes | Prioridade | Esforço |
|:---------|:---------|:-----------|:--------|
| **Alternância de Densidade de Inputs** | Inputs 56px com texto maior em Field mode, 40px em Office mode. | 🔴 Alta | Médio |
| **Keyboard Avoidance** | Garantir que ações do TreeForm não fiquem cobertas pelo teclado virtual no mobile. | 🔴 Alta | Médio |
| **UX de Upload de Fotos** | Melhorar área de upload: Preview imediato de thumbnail, "Retomar" fácil, ring de progresso durante upload. | 🟡 Média | Médio |
| **Agrupamento de Campos** | Agrupar visualmente campos relacionados ("Dados de Localização", "Especificações de Saúde") com seções de card distintas. | 🟢 Baixa | Pequeno |

---

## 8. Mapa & Visualização

**Objetivo:** Tornar dados geoespaciais intuitivos e acionáveis.

| Melhoria | Detalhes | Prioridade | Esforço |
|:---------|:---------|:-----------|:--------|
| **Controles de Mapa Otimizados** | Posicionar controles de zoom/camadas na zona do polegar. Aumentar tamanho de botões para Field mode. | 🔴 Alta | Médio |
| **Clusters de Árvores** | Melhorar visualização de clusters com cores por status de risco e contagem legível. | 🟡 Média | Médio |
| **Legenda Interativa** | Adicionar legenda toggle para explicar cores/ícones de árvores no mapa. | 🟡 Média | Pequeno |
| **Mini-mapa em Detalhes** | Melhorar TreeMiniMap com indicador de orientação e contexto de área. | 🟢 Baixa | Pequeno |
| **Modo Offline Visual** | Indicador claro quando tiles do mapa são cached vs live. | 🟡 Média | Pequeno |

---

## Roadmap de Implementação Sugerido

### Fase 1: Fundação (1-2 semanas)
- [ ] Escala tipográfica
- [ ] Auditoria de tokens de cor
- [ ] Focus ring padronizado
- [ ] Cursor pointer em elementos interativos

### Fase 2: Consistência (2-3 semanas)
- [ ] Componente Surface universal
- [ ] Padronização de cards
- [ ] Skeleton loading
- [ ] Empty states

### Fase 3: Mobile-First (2-3 semanas)
- [ ] Input density switching
- [ ] Keyboard avoidance
- [ ] Thumb zone optimization
- [ ] Touch target enforcement

### Fase 4: Polish (1-2 semanas)
- [ ] Micro-interações
- [ ] Transições suaves
- [ ] Feedback háptico
- [ ] Tema alta visibilidade

---

## Métricas de Sucesso

| Métrica | Atual (Estimado) | Meta |
|:--------|:-----------------|:-----|
| Contraste WCAG AA | ~80% | 100% |
| Touch targets ≥44px | ~60% | 100% |
| Tokens semânticos | ~70% | 95% |
| Loading states | ~40% | 90% |
| Tempo de input (campo) | - | -30% |

---

## Arquivos Chave para Referência

- `src/index.css` — Tokens CSS e temas
- `tailwind.config.js` — Configuração Tailwind
- `src/components/ui/` — Componentes shadcn base
- `src/components/layout/PageContainer.tsx` — Dual Density wrapper
- `src/layouts/DashboardLayout.tsx` — Shell principal

---

## Changelog

| Data | Versão | Alterações |
|:-----|:-------|:-----------|
| 2026-01-22 | 1.0 | Criação inicial do plano |
