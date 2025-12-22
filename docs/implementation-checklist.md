# ArborIA - Sistema de Instalações Multi-Tenant
## Checklist de Implementação

**Versão:** 1.0  
**Data de Criação:** 2025-12-09  
**Última Atualização:** 2025-12-09

---

## 📋 Preparação (Sprint 0)

### Setup de Ambiente
- [ ] Criar ambiente de staging no Supabase
- [ ] Configurar CI/CD pipeline
- [ ] Setup de testes automatizados
- [ ] Configurar ferramentas de monitoramento
- [ ] Criar repositório de documentação técnica

### Validação Técnica
- [ ] Revisar PRD com equipe técnica
- [ ] Validar estimativas de esforço
- [ ] Confirmar stack tecnológico
- [ ] Aprovar arquitetura de dados
- [ ] Definir estratégia de testes

---

## 🗄️ Fase 1: Backend (Sprints 1-3)

### Sprint 1: Schema e Tabelas Base

#### RF1.1 - Criação de Instalação
- [ ] Criar tabela `instalacoes`
  - [ ] Definir schema completo
  - [ ] Adicionar constraints
  - [ ] Criar índices
  - [ ] Testar inserção de dados
- [ ] Criar tabela `perfis`
  - [ ] Definir schema
  - [ ] Inserir dados iniciais (5 perfis)
  - [ ] Testar queries
- [ ] Criar tabela `instalacao_membros`
  - [ ] Definir schema
  - [ ] Adicionar constraints
  - [ ] Criar índices (GIN para array de perfis)
  - [ ] Testar relacionamentos

#### RF2.1 - Sistema de Perfis (RBAC)
- [ ] Criar funções helper
  - [ ] `user_tem_acesso_instalacao()`
  - [ ] `user_tem_perfil()`
  - [ ] `current_user_id()` (cache)
  - [ ] Testar performance
- [ ] Documentar permissões de cada perfil
- [ ] Criar testes unitários para funções

#### Testes Sprint 1
- [ ] Testes de schema (constraints, tipos)
- [ ] Testes de relacionamentos (FK)
- [ ] Testes de performance (índices)
- [ ] Code review
- [ ] Documentação atualizada

---

### Sprint 2: RLS Policies e Migração

#### RNF1.1 - Isolamento Total Entre Instalações
- [ ] Habilitar RLS em tabelas existentes
  - [ ] `arvores` - ENABLE ROW LEVEL SECURITY
  - [ ] `planos` - ENABLE ROW LEVEL SECURITY
  - [ ] `arvores` - FORCE ROW LEVEL SECURITY
  - [ ] `planos` - FORCE ROW LEVEL SECURITY

- [ ] Criar RLS Policies para `arvores`
  - [ ] Policy SELECT (leitura)
  - [ ] Policy INSERT (criação)
  - [ ] Policy UPDATE (edição)
  - [ ] Policy DELETE (exclusão)
  - [ ] Testar cada policy

- [ ] Criar RLS Policies para `planos`
  - [ ] Policy SELECT (leitura)
  - [ ] Policy INSERT (criação)
  - [ ] Policy UPDATE (edição com regras de status)
  - [ ] Policy DELETE (exclusão)
  - [ ] Testar cada policy

#### RF6.1 - Migração de Dados Existentes
- [ ] Adicionar coluna `instalacao_id` a tabelas
  - [ ] `arvores` ADD COLUMN instalacao_id
  - [ ] `planos` ADD COLUMN instalacao_id
  - [ ] Criar índices

- [ ] Script de migração
  - [ ] Criar instalação padrão por usuário
  - [ ] Adicionar usuário como Gestor
  - [ ] Migrar árvores do usuário
  - [ ] Migrar planos do usuário
  - [ ] Validar integridade de dados

- [ ] Tornar `instalacao_id` obrigatório
  - [ ] ALTER COLUMN SET NOT NULL
  - [ ] Validar que todos os registros têm instalacao_id

#### Testes Sprint 2
- [ ] Testes de isolamento (100% cobertura)
  - [ ] Cross-tenant read (deve falhar)
  - [ ] Cross-tenant write (deve falhar)
  - [ ] Cross-tenant delete (deve falhar)
  - [ ] Perfil incorreto (deve falhar)
- [ ] Testes de migração
  - [ ] Integridade de dados (0% perda)
  - [ ] Relacionamentos preservados
  - [ ] Performance aceitável
- [ ] Testes de rollback
  - [ ] Reverter migração
  - [ ] Validar estado original
- [ ] Code review
- [ ] Documentação atualizada

---

### Sprint 3: Tabelas de Workflow e Audit

#### RF2.2 - Solicitação de Acesso
- [ ] Criar tabela `solicitacoes_acesso`
  - [ ] Definir schema
  - [ ] Adicionar constraints (justificativa >= 20 chars)
  - [ ] Criar índices
  - [ ] Testar inserção

#### RF2.4 - Convite de Usuários
- [ ] Criar tabela `convites`
  - [ ] Definir schema
  - [ ] Adicionar constraint de expiração
  - [ ] Criar índices
  - [ ] Gerar tokens únicos
  - [ ] Testar workflow de convite

#### RNF5.2 - Audit Trail
- [ ] Criar tabela `audit_log`
  - [ ] Definir schema
  - [ ] Criar índices
  - [ ] Testar inserção

- [ ] Criar função `log_audit()`
  - [ ] Implementar trigger function
  - [ ] Testar com dados de exemplo

- [ ] Aplicar triggers a tabelas críticas
  - [ ] `instalacoes`
  - [ ] `instalacao_membros`
  - [ ] `solicitacoes_acesso`
  - [ ] Validar logging automático

#### Otimizações de Performance
- [ ] Criar índices compostos
  - [ ] `idx_arvores_instalacao_especie`
  - [ ] `idx_arvores_instalacao_risco`
  - [ ] `idx_planos_instalacao_status`
  - [ ] Validar uso de índices (EXPLAIN)

- [ ] Criar materialized view `dashboard_kpis`
  - [ ] Definir query
  - [ ] Testar refresh
  - [ ] Configurar refresh automático

#### Testes Sprint 3
- [ ] Testes de workflow de solicitação
  - [ ] Criar solicitação
  - [ ] Validar constraints
  - [ ] Testar aprovação/rejeição
- [ ] Testes de convites
  - [ ] Gerar convite
  - [ ] Validar token único
  - [ ] Testar expiração
  - [ ] Testar aceitação
- [ ] Testes de audit log
  - [ ] Validar logging automático
  - [ ] Verificar completude de dados
  - [ ] Testar queries de auditoria
- [ ] Testes de performance
  - [ ] Benchmark de queries (< 50ms P95)
  - [ ] Validar overhead de RLS (< 5ms)
  - [ ] Testar com dados volumosos
- [ ] Code review
- [ ] Documentação atualizada

---

## 🎨 Fase 2: Frontend (Sprints 4-7)

### Sprint 4: Infraestrutura Frontend

#### Serviços Base
- [ ] Criar `InstalacaoService`
  - [ ] `getInstalacoes()`
  - [ ] `getInstalacaoAtiva()`
  - [ ] `setInstalacaoAtiva()`
  - [ ] `verificarAcesso()`
  - [ ] Testes unitários

- [ ] Criar `PermissionManager`
  - [ ] `getPerfis()`
  - [ ] `temPermissao()`
  - [ ] `temPerfil()`
  - [ ] Cache de permissões
  - [ ] Testes unitários

- [ ] Criar `NotificationService`
  - [ ] Polling de notificações
  - [ ] Marcar como lida
  - [ ] Histórico
  - [ ] Testes unitários

#### Componentes Base
- [ ] Criar `InstalacaoSelector`
  - [ ] UI de seleção
  - [ ] Dropdown de instalações
  - [ ] Indicador de instalação ativa
  - [ ] Testes de UI

- [ ] Criar `NotificationBadge`
  - [ ] Ícone com contador
  - [ ] Dropdown de notificações
  - [ ] Links para ações
  - [ ] Testes de UI

#### Testes Sprint 4
- [ ] Testes unitários de serviços
- [ ] Testes de integração com Supabase
- [ ] Testes de UI dos componentes
- [ ] Code review
- [ ] Documentação atualizada

---

### Sprint 5: Gestão de Instalações e Membros

#### US-GESTOR-001: Criar Nova Instalação
- [ ] Formulário de criação
  - [ ] Campos obrigatórios (nome, tipo, localização)
  - [ ] Campos opcionais
  - [ ] Validações client-side
  - [ ] Integração com API
  - [ ] Feedback de sucesso/erro

#### US-GESTOR-002: Visualizar Dashboard da Instalação
- [ ] Layout do dashboard
  - [ ] KPIs principais
  - [ ] Gráfico de distribuição de risco
  - [ ] Cronograma de intervenções
  - [ ] Atividade recente
  - [ ] Alertas

- [ ] Integração com dados
  - [ ] Carregar KPIs
  - [ ] Carregar gráficos
  - [ ] Atualização em tempo real
  - [ ] Loading states

#### US-GESTOR-005: Gerenciar Membros da Instalação
- [ ] Lista de membros
  - [ ] Tabela com dados
  - [ ] Filtros (perfil, status, data)
  - [ ] Busca por nome/email
  - [ ] Paginação

- [ ] Ações de gerenciamento
  - [ ] Editar perfis
  - [ ] Remover membro (com confirmação)
  - [ ] Visualizar histórico
  - [ ] Validações

#### Testes Sprint 5
- [ ] Testes de formulários
- [ ] Testes de validação
- [ ] Testes de integração com API
- [ ] Testes de UI/UX
- [ ] Code review
- [ ] Documentação atualizada

---

### Sprint 6: Sistema de Aprovações e Convites

#### US-GESTOR-003: Aprovar Solicitações de Acesso
- [ ] Painel de aprovações
  - [ ] Lista de solicitações pendentes
  - [ ] Badge de notificação
  - [ ] Detalhes da solicitação
  - [ ] Ações (aprovar/rejeitar)

- [ ] Workflow de aprovação
  - [ ] Aprovar (todos ou alguns perfis)
  - [ ] Rejeitar (com justificativa)
  - [ ] Notificar solicitante
  - [ ] Atualizar status

#### US-GESTOR-004: Convidar Membros para a Equipe
- [ ] Formulário de convite
  - [ ] Email do convidado
  - [ ] Seleção de perfis
  - [ ] Mensagem personalizada
  - [ ] Enviar convite

- [ ] Gerenciamento de convites
  - [ ] Lista de convites enviados
  - [ ] Status (pendente, aceito, expirado)
  - [ ] Revogar convite
  - [ ] Reenviar convite

#### US-PLANEJADOR-001 / US-EXECUTANTE-001 / US-INVENTARIADOR-001: Solicitar Acesso
- [ ] Tela de solicitação
  - [ ] Lista de instalações disponíveis
  - [ ] Seleção de perfis
  - [ ] Campo de justificativa
  - [ ] Enviar solicitação

- [ ] Acompanhamento
  - [ ] Status da solicitação
  - [ ] Notificação de aprovação/rejeição
  - [ ] Visualizar justificativa (se rejeitado)

#### Testes Sprint 6
- [ ] Testes de workflow completo
  - [ ] Solicitação → Aprovação → Acesso
  - [ ] Solicitação → Rejeição → Feedback
  - [ ] Convite → Aceitação → Acesso
- [ ] Testes de notificações
- [ ] Testes de validações
- [ ] Code review
- [ ] Documentação atualizada

---

### Sprint 7: Controle de Acesso e Polimento

#### US-COMUM-001/002/003: Seleção e Troca de Instalação
- [ ] Fluxo de login
  - [ ] Detectar instalações do usuário
  - [ ] Seleção automática (se 1 instalação)
  - [ ] Seletor (se múltiplas)
  - [ ] Tela de onboarding (se 0)

- [ ] Troca de instalação
  - [ ] Menu de troca no cabeçalho
  - [ ] Confirmação se há alterações não salvas
  - [ ] Recarregar dados
  - [ ] Atualizar indicador

- [ ] Indicador de contexto
  - [ ] Nome da instalação no cabeçalho
  - [ ] Ícone/cor por tipo
  - [ ] Perfis do usuário
  - [ ] Tooltip com informações

#### RF4.1/4.2 - Controle de Acesso a Funcionalidades
- [ ] Adaptar menu de navegação
  - [ ] Mostrar apenas módulos permitidos
  - [ ] Ocultar ações não permitidas
  - [ ] Validação de acesso direto (URL)

- [ ] Permissões granulares em módulos
  - [ ] Inventário (criar/editar)
  - [ ] Planos (criar/editar/visualizar)
  - [ ] Relatórios (gerar)
  - [ ] Configurações (acessar)

#### US-COMUM-005: Receber Notificações
- [ ] Sistema de notificações
  - [ ] Ícone com contador
  - [ ] Dropdown de notificações
  - [ ] Marcar como lida
  - [ ] Histórico (30 dias)
  - [ ] Links para ações

- [ ] Tipos de notificação
  - [ ] Solicitação pendente
  - [ ] Aprovação concedida
  - [ ] Rejeição
  - [ ] Convite recebido
  - [ ] Plano aprovado

#### Polimento e UX
- [ ] Responsividade mobile
  - [ ] Testar em diferentes tamanhos
  - [ ] Ajustar layouts
  - [ ] Touch-friendly (botões > 44px)

- [ ] Acessibilidade
  - [ ] Navegação por teclado
  - [ ] Screen reader friendly
  - [ ] Contraste adequado
  - [ ] Labels descritivos

- [ ] Performance
  - [ ] Lazy loading de módulos
  - [ ] Otimização de assets
  - [ ] Service Worker para cache
  - [ ] Lighthouse > 90

#### Testes Sprint 7
- [ ] Testes de fluxo completo
  - [ ] Login → Seleção → Uso → Troca
- [ ] Testes de permissões
  - [ ] Cada perfil vê apenas o permitido
  - [ ] Tentativas de acesso não autorizado
- [ ] Testes de notificações
  - [ ] Recebimento em tempo real
  - [ ] Ações funcionam corretamente
- [ ] Testes de responsividade
  - [ ] Mobile, tablet, desktop
- [ ] Testes de acessibilidade
  - [ ] Lighthouse Accessibility > 90
- [ ] Testes de performance
  - [ ] Lighthouse Performance > 90
- [ ] Code review
- [ ] Documentação atualizada

---

## ✅ Validação Final

### Testes de Aceitação
- [ ] Executar todas as User Stories (30)
- [ ] Validar todos os critérios de aceitação
- [ ] Testes de regressão completos
- [ ] Testes de carga (100+ usuários simultâneos)
- [ ] Testes de segurança (penetration testing)

### Documentação
- [ ] Atualizar documentação técnica
- [ ] Criar guia de usuário
- [ ] Criar guia de administrador
- [ ] Documentar APIs
- [ ] Criar troubleshooting guide

### Preparação para Produção
- [ ] Configurar ambiente de produção
- [ ] Migração de dados de produção
- [ ] Backup completo pré-deploy
- [ ] Plano de rollback testado
- [ ] Monitoramento configurado
- [ ] Alertas configurados

### Launch
- [ ] Deploy em produção
- [ ] Smoke tests em produção
- [ ] Comunicação aos usuários
- [ ] Treinamento de equipe
- [ ] Suporte disponível

---

## 📊 Métricas de Acompanhamento

### Durante Implementação
- [ ] Velocity por sprint (target: 20 SP)
- [ ] Bugs encontrados vs. resolvidos
- [ ] Cobertura de testes (target: 80%+)
- [ ] Performance de queries (target: < 50ms P95)
- [ ] Code review turnaround time

### Pós-Launch
- [ ] Instalações ativas
- [ ] Usuários ativos por instalação
- [ ] Taxa de aprovação de solicitações
- [ ] Tempo médio de resposta de gestores
- [ ] NPS de gestores
- [ ] Incidentes de segurança (target: 0)
- [ ] Uptime (target: > 99.5%)

---

## 🚨 Riscos e Mitigações

### Risco: Data Leakage
- **Severidade:** 🔴 Crítico
- **Mitigação:** RLS obrigatório + testes 100% cobertura
- **Status:** [ ] Mitigado

### Risco: Performance de Queries
- **Severidade:** 🟡 Médio
- **Mitigação:** Índices compostos + cache de auth.uid()
- **Status:** [ ] Mitigado

### Risco: Migração de Dados
- **Severidade:** 🟡 Médio
- **Mitigação:** Script testado + rollback plan
- **Status:** [ ] Mitigado

### Risco: Complexidade de Permissões
- **Severidade:** 🟢 Baixo
- **Mitigação:** Funções helper + documentação clara
- **Status:** [ ] Mitigado

---

**Última atualização:** 2025-12-09  
**Responsável:** Ammon  
**Próxima revisão:** Início de cada sprint
