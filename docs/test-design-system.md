# System-Level Test Design - Arboria 3.0

**Date:** 2025-12-16  
**Author:** TEA Agent (Ammon)  
**Status:** Draft  
**Mode:** System-Level Testability Review (Phase 3 Solutioning)

---

## Executive Summary

Este documento avalia a testabilidade da arquitetura do ArborIA 3.0, um sistema **multi-tenant, offline-first** para gestão arbórea. O sistema utiliza:
- **Frontend:** React 18+ com TypeScript (compartilhado entre Web, Desktop e Mobile)
- **Desktop:** Tauri v2 (Windows)
- **Mobile:** Capacitor v6 (Android)
- **Backend:** Supabase (PostgreSQL + RLS + Storage + Edge Functions)

---

## Testability Assessment

### 1. Controllability ✅ PASS

| Aspecto | Avaliação | Detalhes |
|---------|-----------|----------|
| Controle de Estado | ✅ PASS | Supabase permite seeding via SQL migrations e factory patterns |
| Mocking de Dependências | ✅ PASS | React Query e Zustand permitem mock de estado; Supabase client mockável |
| Injeção de Erros | ⚠️ CONCERNS | Requer implementação de mock server para simular falhas de rede/API |
| Reset de Database | ✅ PASS | Supabase suporta truncate de tabelas e rollback de migrations |

**Recomendações:**
- Implementar factories com `@faker-js/faker` para geração de dados de teste
- Criar SQL seeds para estados conhecidos (instalações, árvores, planos)
- Implementar mock de Network status para testes offline

### 2. Observability ✅ PASS

| Aspecto | Avaliação | Detalhes |
|---------|-----------|----------|
| Logging | ✅ PASS | Console logs no frontend; Supabase logs no backend |
| Métricas | ⚠️ CONCERNS | Não há integração de APM definida (recomendado para produção) |
| Traces | ✅ PASS | React Query DevTools para debugging de cache |
| Determinismo | ⚠️ CONCERNS | Testes de geolocalização e offline precisam de mocking cuidadoso |

**Recomendações:**
- Implementar `data-testid` em todos os componentes interativos
- Usar `@testing-library/react` para testes de componentes
- Configurar `MSW` (Mock Service Worker) para mock de API

### 3. Reliability ✅ PASS

| Aspecto | Avaliação | Detalhes |
|---------|-----------|----------|
| Isolamento de Testes | ✅ PASS | RLS garante isolamento; cada teste pode usar instalação própria |
| Reprodutibilidade | ✅ PASS | Seeds + factories permitem estados determinísticos |
| Acoplamento | ✅ PASS | Arquitetura modular (hooks, contexts, stores separados) |
| Paralelização | ✅ PASS | Testes podem rodar em paralelo com instalações distintas |

**Recomendações:**
- Implementar cleanup automático após cada teste (auto-cleanup)
- Usar transações isoladas para testes de integração

---

## Architecturally Significant Requirements (ASRs)

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Prob | Impact | Score | Mitigation |
|---------|----------|-------------|------|--------|-------|------------|
| R-001 | SEC | Falha de isolamento RLS (data leakage entre instalações) | 2 | 3 | **6** | Testes de RLS em cada tabela; verificação cruzada de instalações |
| R-002 | DATA | Perda de dados offline durante sync (Action Queue) | 2 | 3 | **6** | Testes E2E de ciclo offline→online; verificação de persistência |
| R-003 | SEC | Token JWT expirado não renovado automaticamente | 2 | 3 | **6** | Testes de sessão longa; verificação de refresh token |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Prob | Impact | Score | Mitigation |
|---------|----------|-------------|------|--------|-------|------------|
| R-004 | PERF | Mapa lento com >1000 árvores | 2 | 2 | 4 | Benchmark de rendering; validar clustering |
| R-005 | TECH | Conflito de sync Last-Write-Wins | 2 | 2 | 4 | Testes de conflito; UI de resolução manual |
| R-006 | OPS | Build Tauri/Capacitor falha em CI | 1 | 3 | 3 | Validar pipeline antes de produção |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Prob | Impact | Score | Action |
|---------|----------|-------------|------|--------|-------|--------|
| R-007 | BUS | UI não responsiva em telas pequenas | 1 | 2 | 2 | Testes visuais |
| R-008 | OPS | Variáveis de ambiente incorretas | 1 | 1 | 1 | Validação em startup |

---

## Test Levels Strategy

Baseado na arquitetura (SPA com offline-first + BaaS):

| Level | Percentage | Rationale |
|-------|------------|-----------|
| **E2E** | 15% | Critical user journeys apenas (login, CRUD de árvores, sync offline) |
| **API/Integration** | 35% | RLS policies, Supabase queries, hooks de dados |
| **Component** | 25% | Componentes React com React Testing Library |
| **Unit** | 25% | Lógica de negócio pura (utils, stores, validators) |

**Justificativa:**
- E2E limitado a 15% devido ao custo de manutenção e velocidade
- API/Integration em 35% pois o core do sistema é a comunicação com Supabase
- Component em 25% para validar comportamento de UI isolado
- Unit em 25% para lógica de validação, formatação e cálculos

---

## NFR Testing Approach

### Security (SEC)

| NFR | Approach | Tool |
|-----|----------|------|
| RLS Isolation | Testes de acesso cruzado entre instalações | Playwright + Supabase Admin SDK |
| Auth/AuthZ | Validar tokens, permissões por perfil | Playwright E2E + API tests |
| Data Exposure | Verificar que queries não expõem dados de outros tenants | API tests com diferentes users |

### Performance (PERF)

| NFR | Approach | Tool |
|-----|----------|------|
| Map Rendering | Benchmark com 100/500/1000/5000 árvores | Playwright + Performance API |
| Query Latency | P95 < 50ms para queries principais | k6 ou API tests com assertions |
| Offline Sync | Medir tempo de sync de 10/50/100 items | E2E tests |

### Reliability (REL)

| NFR | Approach | Tool |
|-----|----------|------|
| Offline Operations | Simular offline, realizar ações, verificar persistência | Playwright Network Interception |
| Error Recovery | Verificar retry com backoff exponencial | Unit tests + E2E |
| Data Integrity | Validar que Action Queue não perde dados | E2E com kill/restart |

### Maintainability (MAINT)

| NFR | Approach | Tool |
|-----|----------|------|
| Code Coverage | Mínimo 80% em módulos críticos | Vitest + c8 |
| Type Safety | Zero any types em production code | TypeScript strict mode |
| Linting | Zero warnings em CI | ESLint + CI gates |

---

## Test Environment Requirements

### Local Development
- Node.js 20+
- Supabase CLI (local stack)
- Docker (para Supabase local)
- Playwright para E2E

### CI/CD Pipeline
- GitHub Actions runners (Ubuntu)
- Supabase staging project (ou local via CLI)
- Playwright containers

### Staging Environment
- Supabase project dedicado para testes
- Dados de teste isolados
- Reset automático após test suites

---

## Testability Concerns

### ⚠️ CONCERNS (Não são blockers, mas requerem atenção)

1. **Geolocation Mocking**
   - Testes de GPS/navegação precisam de mock robusto
   - Recomendação: Usar Playwright geolocation mocking

2. **Tauri/Capacitor E2E**
   - Playwright não suporta apps nativos diretamente
   - Recomendação: Testar React app via browser; testes nativos manuais ou Appium

3. **Photo Upload Offline**
   - Fluxo complexo de queue de fotos
   - Recomendação: Testes E2E específicos com mock de câmera

4. **Realtime Subscriptions**
   - Supabase Realtime difícil de testar em isolamento
   - Recomendação: Desabilitar em testes ou usar mock

---

## Recommendations for Sprint 0

### Test Framework Setup (`testarch-framework` workflow)

1. **Install Dependencies:**
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom
   npm install -D playwright @playwright/test
   npm install -D msw @faker-js/faker
   ```

2. **Configure Vitest:**
   - Setup para React com jsdom
   - Aliases para @/ paths
   - Coverage com c8

3. **Configure Playwright:**
   - Setup para web app (http://localhost:5173)
   - Fixtures para auth e instalação
   - Global setup/teardown

### CI Integration (`testarch-ci` workflow)

1. **Pipeline Stages:**
   - Lint → Unit → Component → Integration → E2E (smoke) → Build

2. **Quality Gates:**
   - Coverage mínimo 80% em módulos críticos
   - Zero failing tests em PR merge

3. **Test Reports:**
   - JUnit format para CI
   - HTML reports para debugging

---

## Quality Gate Criteria

### Pass/Fail Thresholds

| Metric | Threshold | Notes |
|--------|-----------|-------|
| P0 Tests | 100% pass | No exceptions |
| P1 Tests | ≥95% pass | Waivers required |
| RLS Tests | 100% pass | Zero tolerance for data leakage |
| Coverage | ≥80% critical paths | Hooks, stores, auth |

### Non-Negotiable Requirements

- [ ] Todos os testes de RLS passam (SEC category)
- [ ] Testes de Action Queue offline passam (DATA category)
- [ ] Testes de autenticação/autorização passam (SEC category)
- [ ] Zero high-risk (≥6) items sem mitigação

---

## Next Steps

1. **Run `testarch-framework` workflow** - Setup Playwright + Vitest
2. **Create test fixtures** - Auth, instalação padrão, dados de árvores
3. **Implement RLS tests** - Validar isolamento de todas as tabelas
4. **Run `testarch-ci` workflow** - Configurar pipeline

---

## Approval

**Test Design Approved By:**

- [ ] Product Owner: Ammon - Date: ___
- [ ] Tech Lead: ___ - Date: ___

---

**Generated by:** BMad TEA Agent - Test Architect Module  
**Workflow:** `.bmad/bmm/testarch/test-design`  
**Version:** 4.0 (BMad v6)
