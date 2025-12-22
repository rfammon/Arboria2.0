---
stepsCompleted: [1]
inputDocuments: []
session_topic: 'Migração de funcionalidades do legado JavaScript para React/TypeScript/Tauri/Capacitor'
session_goals: 'Garantir migração completa sem perda de funções, otimizar durante a migração, evitar transferir bugs existentes do código JavaScript vanilla'
selected_approach: 'ai-recommended'
techniques_used: ['Morphological Analysis', 'SCAMPER Method', 'Decision Tree Mapping']
ideas_generated: []
stepsCompleted: [1, 2]
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Ammon
**Date:** 2025-12-11T17:35:00-03:00
**Project:** Arboria 3.0

## Session Overview

**Topic:** Migração de funcionalidades do legado JavaScript para React/TypeScript/Tauri/Capacitor

**Goals:** 
- Garantir migração completa sem perda de funções
- Otimizar durante a migração  
- Evitar transferir bugs existentes do código JavaScript vanilla

### Context Guidance

**Código Legado:**
- Localização: `Arboria - deprecated/`
- Stack atual: JavaScript vanilla (com bugs conhecidos)
- Limitações: JavaScript vanilla tem muitas restrições, algumas funções ficam bugadas

**Novo Stack:**
- React 18+ com TypeScript
- Tauri (Windows desktop)
- Capacitor (Android mobile)
- Build: Vite
- Backend: Supabase (já existente)

**Desafios Identificados:**
- Preservar 100% das funcionalidades
- Identificar e não migrar bugs
- Aproveitar oportunidade para otimizar
- Modernizar código usando melhores práticas

### Session Setup

Esta sessão explorará estratégias criativas e sistemáticas para migrar funcionalidades do código legado JavaScript vanilla para o novo stack moderno (React/TypeScript/Tauri/Capacitor), garantindo qualidade superior e evitando a transferência de bugs conhecidos.

---

## Análise de Contexto por IA

### Análise de Objetivos
**Tipo:** Problem Solving + Optimization (structured + deep categories)
- Problema técnico complexo: migração de código legado
- Necessidade de preservar funcionalidades (mapeamento sistemático)
- Objetivo de otimização (refatoração durante migração)
- Prevenção de bugs (análise crítica)

### Análise de Complexidade
**Nível:** Alto - Técnico/Abstrato
- Migração entre stacks (JavaScript vanilla → React/TypeScript)
- Múltiplas plataformas (Tauri + Capacitor)
- Necessidade de identificar bugs antes de migrar
- Requer abordagem estruturada e profunda

### Análise de Perfil do Usuário
**Nível:** Desenvolvedor inexperiente
- Trabalhando com agentes de coding
- Precisa de técnicas que gerem outputs executáveis
- Beneficia-se de abordagens estruturadas e didáticas
- Requer clareza e passo a passo

### Tempo Disponível
**Estimado:** Sessão completa (60-90 min)
- Permite múltiplas fases
- Divergência → Convergência
- Mapeamento → Análise → Estratégia

---

## 🎯 Técnicas Recomendadas por IA

Baseado na análise acima, recomendo esta sequência customizada de 3 técnicas:

### **Fase 1: Mapeamento Sistemático (30 min)**
**📋 Morphological Analysis** (Deep Category)

**Por que isso se encaixa:**
- Permite mapear sistematicamente TODAS as funcionalidades do legado
- Cria matriz de parâmetros: [Módulo × Funcionalidade × Dependências × Bugs Conhecidos]
- Garante que nada seja esquecido (objetivo: zero perda)
- Gera documentação clara para agentes de coding

**Resultado esperado:**
- Matriz completa de funcionalidades catalogadas
- Identificação de dependências entre módulos
- Mapeamento de bugs conhecidos por funcionalidade
- Base sólida para as próximas fases

---

### **Fase 2: Análise de Refatoração (25 min)**
**🔧 SCAMPER Method** (Structured Category)

**Por que isso complementa a Fase 1:**
- Usa o mapeamento da Fase 1 como input
- Aplica 7 lentes sistemáticas para otimizar cada funcionalidade:
  - **Substitute:** TypeScript types no lugar de validações manuais
  - **Combine:** Unir módulos que fazem sentido juntos
  - **Adapt:** Adaptar para React patterns (hooks, components)
  - **Modify:** Melhorar lógica bugada
  - **Put to other uses:** Reusar código de novas formas
  - **Eliminate:** Remover código morto e complexidade desnecessária
  - **Reverse:** Inverter fluxos que causam bugs

**Resultado esperado:**
- Lista de otimizações por funcionalidade
- Estratégias de refatoração específicas
- Identificação de código a eliminar
- Plano de modernização técnica

---

### **Fase 3: Estratégia de Migração (20 min)**  
**🗺️ Decision Tree Mapping** (Structured Category)

**Por que isso finaliza efetivamente:**
- Mapeia a ORDEM e ESTRATÉGIA de migração
- Identifica dependências críticas (o que migrar primeiro)
- Cria árvore de decisões para casos complexos
- Gera roadmap executável para agentes de coding

**Resultado esperado:**
- Ordem de migração definida (roadmap)
- Estratégias para casos edge
- Plano de testes por módulo
- Output pronto para implementação

---

**⏱️ Tempo Total Estimado:** 75 minutos  
**🎯 Foco da Sessão:** Migração Sistemática, Otimizada e Livre de Bugs

**Por que esta sequência é perfeita para você:**
1. **Structured:** Técnicas sistemáticas ideais para desenvolvedores inexperientes
2. **Completo:** Cobre mapeamento → análise → estratégia (nada é esquecido)
3. **Executável:** Gera outputs que agentes de coding podem implementar
4. **Didático:** Você aprende as técnicas enquanto as usa
5. **Garantia:** Abordagem metódica garante 100% de cobertura funcional

---

## Seleção de Técnicas

**Abordagem:** AI-Recommended Techniques  
**Análise baseada em:** Migração JavaScript vanilla → React/TypeScript/Tauri/Capacitor

**Técnicas Selecionadas:**

1. **Morphological Analysis** (Deep) - Mapear sistematicamente todas as funcionalidades e bugs
2. **SCAMPER Method** (Structured) - Otimizar e refatorar durante migração  
3. **Decision Tree Mapping** (Structured) - Criar roadmap executável de migração

**Justificativa da IA:** Esta sequência garante mapeamento completo → otimização sistemática → estratégia executável, ideal para desenvolvedores inexperientes trabalhando com agentes de coding.

---

## 📚 Fase 1: Morphological Analysis - AJUSTADO

### Documentação Existente Carregada

✅ **PRD Completo** (2,687 linhas)
- 7 Requisitos Funcionais (RF1-RF7) - 43 sub-requisitos
- 5 Requisitos Não-Funcionais (RNF1-RNF5)
- 34 User Stories (152 Story Points)
- Schema de banco completo (7 tabelas novas + 2 modificadas)
- RLS Policies prontas
- ~500 linhas de SQL executável
- 5 diagramas Mermaid

✅ **Developer Quick Reference** (559 linhas)
- Padrões de código frontend
- Matriz de permissões por perfil
- Templates de RLS policies
- Funções helper SQL
- Erros comuns e soluções
- Convenções de nomenclatura
- Estrutura de arquivos

---

### Análise Dirigida: Achados Críticos

#### 1️⃣ **Sistema Atual (JavaScript Vanilla)**

**Stack Legado:**
- PWA (HTML/CSS/JavaScript vanilla)
- 50+ módulos JavaScript bem estruturados
- Service Worker (offline capability)
- Leaflet.js (mapas), Chart.js (gráficos)
- Supabase (PostgreSQL + Auth + Storage)
- RLS já implementado (single-user)

**Módulos Principais Identificados:**
1. Sistema de Inventário (CRUD árvores, 15 critérios de risco)
2. Mapas/GIS (MapLibre/Leaflet, filtros, simbologia)
3. Medições (clinômetro, DAP, GPS com precisão <5m)
4. Relatórios/PDF (geração automática com mapas embedded)
5. Autenticação/Usuários (Supabase Auth)
6. Planos de Intervençãoção (criação, edição, critérios)
7. **Gestão de Planos/Cronogramas** (Gantt, tarefas, timeline)
8. **Módulo de Execução** (novo - RF7, 6 sub-requisitos)

#### 2️⃣ **Novo Stack (React/TypeScript - Arboria 3.0)**

**Diferenças Críticas:**
- React 18+ com TypeScript (vs JavaScript vanilla)
- Tauri para Windows (vs PWA em navegador)
- Capacitor para Android (vs PWA mobile)
- Vite (vs build manual)
- Possível Tailwind CSS (vs CSS vanilla)
- **Compilação/Obfuscação/WASM** (segurança adicional)

#### 3️⃣ **GAPS Identificados**

**Do PRD mas potencialmente não implementado:**
1. **RF7 - Módulo de Execução** (inteiro)
   - Visualização de tarefas (RF7.1)
   - Preenchimento de execução (RF7.2)
   - Upload de evidências fotográficas (RF7.3)
   - Atualização de progresso (RF7.4)
   - Conclusão de tarefa (RF7.5)
   - Sincronização com Gestor de Planos (RF7.6)

2. **Possíveis Gaps em Multi-Tenancy:**
   - Solicitação de acesso (RF2.2)
   - Aprovação/Rejeição (RF2.3)
   - Convites (RF2.4)
   - Notificações in-app (RF5.1)
   - Notificações por email (RF5.2)

#### 4️⃣ **BUGS a NÃO Migrar**

**Baseado em padrões comuns de JavaScript vanilla:**
1. **Coordenadas GPS** - Já tem solução boa (média até <5m precisão)
2. **RLS Policies** - Possíveis bugs de performance ou isolamento
3. **Validações** - JavaScript vanilla sem TypeScript = menos seguro
4. **State Management** - Sem framework = gerenciamento manual bugado
5. **Async/Await** - Promises mal tratados em JS vanilla

#### 5️⃣ **Oportunidades de Otimização**

**React/TypeScript resolve:**
- ✅ **TypeScript:** Validações em tempo de desenvolvimento
- ✅ **React Hooks:** State management robusto (useState, useEffect)
- ✅ **React Query:** Cache e invalidação automática de queries
- ✅ **Zustand/Redux:** State global sem bugs de sincronização
- ✅ **React Router:** Navegação type-safe
- ✅ **Zod/Yup:** Validações de schema robustas
- ✅ **React Hook Form:** Forms com validação integrada

**Tauri/Capacitor resolve:**
- ✅ **Tauri:** Acesso nativo ao sistema Windows (file system, notificações)
- ✅ **Capacitor:** Plugins nativos (câmera, GPS, notificações push)
- ✅ **Compilação:** Código frontend compilado (vs JavaScript exposto)
- ✅ **Performance:** Renderização nativa (vs WebView puro)

#### 6️⃣ **Complexidades da Migração**

**Alto Risco:**
1. **50+ Módulos JS** → Componentes React (estrutura muito diferente)
2. **Service Worker (PWA)** → Tauri/Capacitor (paradigma diferente)
3. **GPS com média de precisão** → Manter comportamento exato
4. **Relatórios PDF** → Bibliotecas diferentes (pdfmake? jsPDF?)
5. **Mapas** → Leaflet funciona com React, mas precisa wrapper
6. **RLS Policies** → Mesmas, mas validações client-side mudam

**Médio Risco:**
7. **Supabase Client** → Código de integração muda para hooks React
8. **LocalStorage** → Pode usar o mesmo ou async storage do Capacitor
9. **Offline Mode** → Service Worker vs lógica Tauri/Capacitor

---

### Decisão Estratégica: Próximos Passos

Dado que temos **documentação completa**, o brainstorming deve focar em:

---

## 🔧 Fase 2: SCAMPER Method - Otimização de Migração

### Técnica: Aplicar 7 Lentes Sistemáticas

Vamos usar SCAMPER para identificar como **OTIMIZAR** durante a migração, não apenas portar diretamente.

---

### **S - SUBSTITUTE** (Substituir)
**O que SUBSTITUIR do legado por soluções melhores?**

#### Substituições Identificadas:

1. **JavaScript Vanilla → TypeScript**
   - Validações em runtime → Validações em compilação
   - Erros em produção → Erros capturados no desenvolvimento
   - Documentação em comentários → Types como documentação viva

2. **State Manual → React State Management**
   - `let currentInstalacao = null` → `useState()`
   - Event listeners manuais → `useEffect()` com dependências
   - State global em variáveis → Zustand/Redux

3. **Promises Manuais → React Query**
   - `fetch().then()` manual → `useQuery()` com cache
   - Loading state manual → `isLoading` automático
   - Invalidação manual → Invalidação declarativa

4. **Validações Manuais → Zod/Yup Schemas**
   - `if (campo.length < 3)` → Schema validation
   - Validações espalhadas → Schemas centralizados
   - Mensagens hardcoded → Mensagens do schema

5. **LocalStorage Direto → Storage Abstraction**
   - `localStorage.getItem()` → Hook `useLocalStorage()`
   - Sem sincronização → Sincronização com Capacitor Preferences
   - Sem tipos → Storage tipado

6. **Service Worker → Tauri/Capacitor Offline**
   - PWA Service Worker → Lógica nativa de offline
   - Cache API → Storage nativo do dispositivo
   - Sync background → Background tasks nativos

---

### **C - COMBINE** (Combinar)
**O que UNIR para reduzir duplicação?**

#### Combinações Propostas:

1. **Serviços Supabase**
   - 50+ módulos → Hooks React reutilizáveis
   - `InventarioService`, `PlanosService`, etc. → `useSupabaseQuery<T>()`
   - Código duplicado de auth → Context Provider único

2. **Componentes de Formulário**
   - Forms espalhados → Componentes Form reutilizáveis
   - Validações duplicadas → FormProvider compartilhado
   - Botões submit repetidos → Library de UI components

3. **Mapas e Visualização**
   - Leaflet + Chart.js → Biblioteca de visualização unificada
   - Lógica de mapa duplicada → Hook `useMap()`
   - Filtros de mapa → Context de filtros compartilhado

---

### **A - ADAPT** (Adaptar)
**Como ADAPTAR para React/TypeScript patterns?**

#### Adaptações Necessárias:

1. **Módulos JS → Components React**
   ```javascript
   // ANTES (JS Vanilla)
   class InventarioModule {
       render() { ... }
       loadData() { ... }
   }
   
   // DEPOIS (React + TS)
   function InventarioPage() {
       const { data } = useInventario();
       return <InventarioList items={data} />;
   }
   ```

2. **Event Listeners → React Events**
   ```javascript
   // ANTES
   document.getElementById('btn').addEventListener('click', handler);
   
   // DEPOIS
   <Button onClick={handler}>Click</Button>
   ```

3. **Manual DOM → JSX Declarativo**
   ```javascript
   // ANTES
   const div = document.createElement('div');
   div.innerHTML = `<h1>${title}</h1>`;
   
   // DEPOIS
   <div><h1>{title}</h1></div>
   ```

---

### **M - MODIFY** (Modificar/Melhorar)
**O que MELHORAR aproveitando novas tecnologias?**

#### Melhorias Propostas:

1. **GPS com Precisão <5m**
   - ✅ Manter lógica de média de coordenadas
   - ✨ Adicionar indicador visual de precisão em tempo real
   - ✨ Usar Capacitor Geolocation API (mais precisa)
   - ✨ Feedback visual da qualidade do sinal GPS

2. **Relatórios PDF**
   - ✅ Manter geração de PDF
   - ✨ Usar react-pdf para renderização consistente
   - ✨ Preview em tempo real before generation
   - ✨ Templates customizáveis por instalação

3. **Mapas Interativos**
   - ✅ Manter Leaflet
   - ✨ Usar react-leaflet com hooks
   - ✨ Clusters de árvores para performance
   - ✨ Heat maps de risco

4. **Offline Capability**
   - ✅ Manter capacidade offline
   - ✨ React Query persistence
   - ✨ Indicador visual de status de sync
   - ✨ Queue de operações pendentes

---

### **P - PUT TO OTHER USES** (Outros Usos)
**Como REUSAR código/lógica existente de novas formas?**

#### Reutilizações Criativas:

1. **Cálculo de Risco (15 critérios)**
   - Original: Apenas no inventário
   - Novo uso: Simulador de risco interativo (educação)
   - Novo uso: API endpoint para consultoria externa

2. **Sistema de Coordenadas**
   - Original: Apenas para árvores
   - Novo uso: Geofencing de instalações
   - Novo uso: Routing de equipes em campo

3. **PDF Generator**
   - Original: Apenas relatórios de árvores
   - Novo uso: Certificados de conclusão de tarefas
   - Novo uso: Planilhas de campo para impressão

---

### **E - ELIMINATE** (Eliminar)
**O que REMOVER para simplificar?**

#### Eliminações Propostas:

1. **Código Morto**
   - Features não usadas há 6+ meses
   - Módulos experimentais não finalizados
   - Funcionalidades duplicadas

2. **Complexidade Desnecessária**
   - Polyfills para browsers antigos (React suporta modernos)
   - Bibliotecas legacy (substituídas por nativas)
   - Workarounds de bugs já resolvidos

3. **Dependências Antigas**
   - jQuery (se existir) → React nativo
   - Moment.js → date-fns ou dayjs (menor)
   - Lodash completo → Lodash-es (tree-shakeable)

---

### **💾 CRÍTICO: Adaptação do Backend Supabase**

#### ⚠️ O que MANTÉM (Backend)
- ✅ **PostgreSQL Database** - Schema permanece o mesmo
- ✅ **RLS Policies** - Políticas de segurança permanecem
- ✅ **Storage** - Supabase Storage para fotos
- ✅ **Auth** - Supabase Auth mantém
- ✅ **Edge Functions** - Se existirem, mantém

#### 🔄 O que MUDA (Cliente)

**JavaScript Vanilla → TypeScript + Hooks:**

```typescript
// ANTES (JS Vanilla)
const supabase = createClient(url, key);
const { data } = await supabase
    .from('arvores')
    .select('*');
// Sem tipos, sem cache, sem loading state

// DEPOIS (React + TypeScript + React Query)
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

function useArvores(instalacaoId: string) {
    return useQuery({
        queryKey: ['arvores', instalacaoId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('arvores')
                .select('*')
                .eq('instalacao_id', instalacaoId);
            
            if (error) throw error;
            return data as Arvore[]; // Tipado!
        }
    });
}

// Uso no componente
function InventarioPage() {
    const { data: arvores, isLoading, error } = useArvores(instalacaoId);
    // Cache automático, loading state, error handling
}
```

**Padrões de Integração:**

1. **Supabase Client como Singleton**
   ```typescript
   // lib/supabase.ts
   import { createClient } from '@supabase/supabase-js';
   import { Database } from '@/types/supabase';
   
   export const supabase = createClient<Database>(
       import.meta.env.VITE_SUPABASE_URL,
       import.meta.env.VITE_SUPABASE_ANON_KEY
   );
   ```

2. **Types Gerados Automaticamente**
   ```bash
   # Gerar types do schema Supabase
   npx supabase gen types typescript --project-id "xxx" > types/supabase.ts
   ```

3. **Auth Context Provider**
   ```typescript
   // contexts/AuthContext.tsx
   const AuthContext = createContext<AuthContextType>(null!);
   
   export function AuthProvider({ children }) {
       const [session, setSession] = useState<Session | null>(null);
       
       useEffect(() => {
           supabase.auth.getSession().then(({ data }) => {
               setSession(data.session);
           });
           
           const { data: { subscription } } = supabase.auth.onAuthStateChange(
               (_event, session) => setSession(session)
           );
           
           return () => subscription.unsubscribe();
       }, []);
       
       return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
   }
   ```

4. **Real-time Subscriptions (React)**
   ```typescript
   function useRealtimeArvores(instalacaoId: string) {
       const queryClient = useQueryClient();
       
       useEffect(() => {
           const channel = supabase
               .channel('arvores-changes')
               .on('postgres_changes', 
                   { event: '*', schema: 'public', table: 'arvores' },
                   () => queryClient.invalidateQueries(['arvores', instalacaoId])
               )
               .subscribe();
           
           return () => { channel.unsubscribe(); };
       }, [instalacaoId]);
   }
   ```

5. **Storage para Fotos (Capacitor)**
   ```typescript
   async function uploadFoto(file: File, tarefaId: string) {
       const { data, error } = await supabase.storage
           .from('evidencias')
           .upload(`${instalacaoId}/${tarefaId}/${file.name}`, file, {
               cacheControl: '3600',
               upsert: false
           });
       
       if (error) throw error;
       return data.path;
   }
   ```

**Benefícios da Adaptação:**

- ✅ **Type Safety:** Erros de schema em compilação
- ✅ **React Query:** Cache automático, invalidação inteligente
- ✅ **Hooks Reutilizáveis:** `useArvores()`, `usePlanos()`, etc.
- ✅ **Error Handling:** Boundaries + tratamento local
- ✅ **Loading States:** Automático via React Query
- ✅ **Optimistic Updates:** UI responsiva antes do backend confirmar

---

### **R - REVERSE/REARRANGE** (Inverter/Reorganizar)
**Como INVERTER fluxos que causam bugs?**

#### Inversões Estratégicas:

1. **Data Flow**
   - ANTES: Modificar state depois de API call
   - DEPOIS: Optimistic updates + rollback on error

2. **Validation**
   - ANTES: Validar no submit
   - DEPOIS: Validar on-change com debounce

3. **Loading States**
   - ANTES: Show spinner everywhere
   - DEPOIS: Skeleton screens + React Suspense

4. **Error Handling**
   - ANTES: Try-catch em cada função
   - DEPOIS: Error boundaries globais + local handling

---

## 🗺️ Fase 3: Decision Tree Mapping - Roadmap de Migração

### Técnica: Mapeamento de Árvore de Decisão

Agora vamos criar o **roadmap executável** para a migração, mapeando a ordem de prioridades e decisões críticas que guiarão a implementação.

---

### **Árvore de Decisão para Ordem de Migração**

```
Início: Migração Arboria 3.0
│
├───[Critério: Depende de Backend?]
│   ├───SIM → Começar com Infraestrutura
│   │   ├───Auth/Usuários (Regra de negócio: 5 perfis)
│   │   ├───RLS Policies (Segurança: multi-tenant)
│   │   └───Subscription Validation (Monetização: crítico)
│   │
│   └───NÃO → Começar com Componentes
│       ├───[Critério: Core Business Functionality?]
│           ├───SIM → Módulos Centrais
│           │   ├───Inventário (Core: CRUD árvores)
│           │   ├───GPS/Medições (Core: precisão <5m)
│           │   └───Mapas (Core: visualização)
│           │
│           └───NÃO → Funcionalidades Secundárias
│               ├───Relatórios
│               ├───Planos de Intervenção
│               └───Gestão de Cronogramas
```

---

### **Roadmap de Migração Executável**

#### **Fase A: Fundação (Semanas 1-4)**
**Objetivo:** Preparar infraestrutura para migração

**Semana 1-2: Setup do Novo Stack**
- [ ] Configurar React + TypeScript + Vite
- [ ] Configurar Tailwind CSS (ou styled-components)
- [ ] Configurar ambiente de desenvolvimento
- [ ] Criar estrutura de pastas (components, hooks, lib, types)
- [ ] Configurar ESLint + Prettier + TypeScript rules

**Semana 3-4: Integração Backend**
- [ ] Configurar Supabase client com types do schema
- [ ] Criar Auth Context Provider
- [ ] Implementar proteção de rotas
- [ ] Configurar React Query (cache, persistência offline)
- [ ] Criar hooks base: `useAuth()`, `useSupabaseQuery()`

#### **Fase B: Módulos Core (Semanas 5-12)**
**Objetivo:** Migrar funcionalidades centrais do sistema

**Semana 5-6: User Management**
- [ ] Migrar login/logout/registro
- [ ] Implementar proteção por perfis (5 níveis)
- [ ] Validar subscription status
- [ ] Implementar aprovação de usuários (RF2.2-2.4)

**Semana 7-8: Sistema de Inventário**
- [ ] CRUD de árvores (React + TypeScript)
- [ ] Implementar 15 critérios de risco (já documentados no PRD)
- [ ] Validar campos com Zod schemas
- [ ] Integrar com Leaflet (mapas interativos)

**Semana 9-10: GPS e Medições**
- [ ] Migrar sistema de GPS (precisão <5m)
- [ ] Implementar clinômetro com React
- [ ] Migrar DAP estimativa
- [ ] Integração com Capacitor Geolocation

**Semana 11-12: Mapas e Relatórios**
- [ ] React-Leaflet com clusters
- [ ] Sistemas de filtros e simbologia
- [ ] PDF generation com react-pdf
- [ ] Templates de relatórios

#### **Fase C: Funcionalidades Avançadas (Semanas 13-16)**
**Objetivo:** Completar funcionalidades secundárias

**Semana 13-14: Planos de Intervenção**
- [ ] Criar/editar planos
- [ ] Atribuir tarefas
- [ ] Critérios de definição

**Semana 15-16: Gestão de Cronogramas**
- [ ] Gantt chart com React
- [ ] Timeline de tarefas
- [ ] Sincronização com planos

#### **Fase D: Módulo de Execução (Semanas 17-20)**
**Objetivo:** Implementar módulo que faltou no legado (RF7)

**Semana 17-18: Tarefas e Execução**
- [ ] Visualização de tarefas (RF7.1)
- [ ] Preenchimento de execução (RF7.2)
- [ ] Upload de evidências (RF7.3)

**Semana 19-20: Conclusão e Sync**
- [ ] Atualização de progresso (RF7.4)
- [ ] Conclusão de tarefa (RF7.5)
- [ ] Sincronização com gestor (RF7.6)

#### **Fase E: Integração Mobile/Desktop (Semanas 21-24)**
**Objetivo:** Implementar Tauri (Windows) e Capacitor (Android)

---

### **Decisões Críticas a Tomar Agora**

#### **1. Ordem de Prioridade dos Módulos**

**Opção A: Mínimo Viável (MVP)**
- [ ] User Management
- [ ] Inventário Básico
- [ ] GPS + Medições
- [ ] Visualização em Mapas
- [ ] Relatórios Básicos

**Opção B: Completo (Tudo do legado + Execução)**
- [ ] Todos os módulos do legado
- [ ] Módulo de Execução (novo)
- [ ] Notificações (RF5.1-5.2)
- [ ] Solicitações/Convites (RF2.2-2.4)

#### **2. Estratégia de Transição**

**Opção A: Big Bang**
- Desenvolver tudo novo
- Migrar dados e usuários de uma vez
- Risco: Toda a funcionalidade de uma vez

**Opção B: Incremental**
- Manter legado funcionando
- Migrar módulo por módulo
- Risco: Manter duas bases de código temporariamente

**Opção C: Feature Flags**
- Novo stack com funcionalidades habilitadas progressivamente
- Risco: Complexidade técnica maior

#### **3. Abordagem de Dados**

**Opção A: Mesma Base de Dados**
- Novo frontend, mesmo Supabase
- Benefício: Dados consistentes

**Opção B: Novo Schema**
- Revisar estrutura de dados
- Benefício: Oportunidade de limpar e otimizar
- Risco: Migração de dados complexa

---

### **Recomendação Final: Abordagem Incremental com MVP**

**Por que esta árvore de decisões leva a esta abordagem:**

1. **Menor Risco:** Manter legado ativo enquanto migra
2. **Feedback Contínuo:** Validar funcionalidades com usuários
3. **Preservação de Negócios:** Sistema sempre funcional
4. **Aprendizado:** Ajustar abordagem com base em lições aprendidas

**Roadmap Recomendado:**

```
Legado Ativo → MVP Novo → Transição Gradual → Novo Sistema Completo
```

**Módulos para MVP:**
- User Management (autenticação + perfis)
- Inventário (CRUD + risco)
- GPS/Medições (core do sistema)
- Mapas (visualização)
- Relatórios Básicos

**Benefícios:**
- 80% da funcionalidade em 20% do tempo
- Validação de tecnologia nova
- Equipe aprende novas tecnologias com baixo risco
- Usuários já experimentam novas funcionalidades
```
