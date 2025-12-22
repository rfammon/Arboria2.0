
# ArborIA - Sistema de Instalações Multi-Tenant
## Guia Rápido de Referência para Desenvolvedores

**Versão:** 1.0  
**Data:** 2025-12-09

---

## 🎯 Visão Geral Rápida

**O que estamos construindo:**
- Sistema multi-tenant SaaS para gestão arbórea profissional
- 5 perfis de usuário com permissões granulares
- Isolamento completo de dados via RLS (Row Level Security)
- Migração zero-downtime de sistema single-tenant para multi-tenant

**Stack:**
- Frontend: PWA (HTML/CSS/JS), Leaflet.js, Chart.js
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Security: Row Level Security (RLS)
- Multi-tenancy: Shared Schema

---

## 📊 Modelo de Dados - Referência Rápida

### Tabelas Principais

```
instalacoes (Tenant Master)
├── id (UUID, PK)
├── nome (VARCHAR, UNIQUE)
├── tipo (VARCHAR)
├── localizacao (JSONB)
└── ativo (BOOLEAN)

perfis (Role Definitions)
├── id (UUID, PK)
├── nome (VARCHAR, UNIQUE)
├── permissoes (JSONB)
└── nivel (INTEGER)

instalacao_membros (Membership)
├── id (UUID, PK)
├── instalacao_id (UUID, FK → instalacoes)
├── user_id (UUID, FK → auth.users)
├── perfis (UUID[], FK → perfis)
└── status (VARCHAR)

solicitacoes_acesso (Access Requests)
├── id (UUID, PK)
├── instalacao_id (UUID, FK)
├── user_id (UUID, FK)
├── perfis_solicitados (UUID[])
├── justificativa (TEXT)
└── status (VARCHAR)

convites (Invitations)
├── id (UUID, PK)
├── instalacao_id (UUID, FK)
├── email (VARCHAR)
├── perfis_concedidos (UUID[])
├── token (VARCHAR, UNIQUE)
└── expires_at (TIMESTAMPTZ)

arvores (Existing - Modified)
├── ... (campos existentes)
└── instalacao_id (UUID, FK) ← NOVO

planos (Existing - Modified)
├── ... (campos existentes)
└── instalacao_id (UUID, FK) ← NOVO

audit_log (Audit Trail)
├── id (UUID, PK)
├── instalacao_id (UUID, FK)
├── user_id (UUID, FK)
├── acao (VARCHAR)
└── detalhes (JSONB)
```

---

## 🔒 RLS Policies - Padrões

### Funções Helper (Use estas!)

```sql
-- Verificar acesso à instalação
user_tem_acesso_instalacao(p_instalacao_id UUID) → BOOLEAN

-- Verificar perfil específico
user_tem_perfil(p_instalacao_id UUID, p_perfil_nome VARCHAR) → BOOLEAN

-- Cache de user_id
current_user_id() → UUID
```

### Template de RLS Policy

```sql
-- SELECT (Leitura)
CREATE POLICY "nome_descritivo"
ON tabela FOR SELECT
USING (
    user_tem_acesso_instalacao(instalacao_id)
);

-- INSERT (Criação)
CREATE POLICY "nome_descritivo"
ON tabela FOR INSERT
WITH CHECK (
    user_tem_acesso_instalacao(instalacao_id)
    AND (
        user_tem_perfil(instalacao_id, 'Perfil1')
        OR user_tem_perfil(instalacao_id, 'Perfil2')
    )
);

-- UPDATE (Edição)
CREATE POLICY "nome_descritivo"
ON tabela FOR UPDATE
USING (
    user_tem_acesso_instalacao(instalacao_id)
    AND user_tem_perfil(instalacao_id, 'PerfilNecessario')
);

-- DELETE (Exclusão)
CREATE POLICY "nome_descritivo"
ON tabela FOR DELETE
USING (
    user_tem_acesso_instalacao(instalacao_id)
    AND user_tem_perfil(instalacao_id, 'Gestor')
);
```

---

## 👥 Perfis e Permissões

### Matriz de Permissões

| Ação | Mestre | Gestor | Planejador | Executante | Inventariador |
|------|--------|--------|------------|------------|---------------|
| **Instalações** |
| Criar instalação | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar instalação | ✅ | ✅ | ❌ | ❌ | ❌ |
| Desativar instalação | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Membros** |
| Aprovar solicitações | ✅ | ✅ | ❌ | ❌ | ❌ |
| Convidar usuários | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gerenciar membros | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Inventário** |
| Criar árvores | ✅ | ✅ | ✅ | ❌ | ✅ |
| Editar árvores | ✅ | ✅ | ✅ | ❌ | ✅ |
| Deletar árvores | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Planos** |
| Criar planos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Editar planos | ✅ | ✅ | ✅* | ❌ | ❌ |
| Aprovar planos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Visualizar planos | ✅ | ✅ | ✅ | ✅ | ❌ |
| Marcar como concluído | ✅ | ✅ | ❌ | ✅ | ❌ |

*Planejadores só podem editar planos em status 'rascunho' ou 'em_revisao'

---

## 🔧 Código Frontend - Padrões

### 1. Verificar Acesso à Instalação

```javascript
// services/instalacao-service.js
async verificarAcesso(instalacaoId) {
    const { data } = await this.supabase
        .from('instalacao_membros')
        .select('id')
        .eq('instalacao_id', instalacaoId)
        .eq('user_id', this.supabase.auth.user().id)
        .eq('status', 'ativo')
        .single();
    
    return !!data;
}
```

### 2. Verificar Permissão Específica

```javascript
// utils/permissions.js
async temPermissao(instalacaoId, permissao) {
    const perfis = await this.getPerfis(instalacaoId);
    return perfis.some(perfil => 
        perfil.permissoes.includes(permissao)
    );
}

async temPerfil(instalacaoId, nomePerfil) {
    const perfis = await this.getPerfis(instalacaoId);
    return perfis.some(perfil => perfil.nome === nomePerfil);
}
```

### 3. Obter Instalação Ativa

```javascript
// services/instalacao-service.js
async getInstalacaoAtiva() {
    const instalacaoId = localStorage.getItem('instalacao_ativa_id');
    if (!instalacaoId) return null;
    
    const { data, error } = await this.supabase
        .from('instalacoes')
        .select('*')
        .eq('id', instalacaoId)
        .single();
    
    if (error) return null;
    return data;
}
```

### 4. Trocar Instalação

```javascript
// services/instalacao-service.js
async setInstalacaoAtiva(instalacaoId) {
    // Validar acesso
    const temAcesso = await this.verificarAcesso(instalacaoId);
    if (!temAcesso) {
        throw new Error('Usuário não tem acesso a esta instalação');
    }
    
    // Salvar e notificar
    localStorage.setItem('instalacao_ativa_id', instalacaoId);
    window.dispatchEvent(new CustomEvent('instalacao-changed', {
        detail: { instalacaoId }
    }));
}
```

### 5. Query com Filtro de Instalação

```javascript
// Sempre filtrar por instalacao_id!
async getArvores() {
    const instalacaoId = localStorage.getItem('instalacao_ativa_id');
    
    const { data, error } = await this.supabase
        .from('arvores')
        .select('*')
        .eq('instalacao_id', instalacaoId)  // ← CRÍTICO!
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
}
```

### 6. Criar Registro com Instalação

```javascript
// Sempre incluir instalacao_id ao criar!
async criarArvore(arvoreData) {
    const instalacaoId = localStorage.getItem('instalacao_ativa_id');
    
    const { data, error } = await this.supabase
        .from('arvores')
        .insert({
            ...arvoreData,
            instalacao_id: instalacaoId  // ← CRÍTICO!
        })
        .single();
    
    if (error) throw error;
    return data;
}
```

---

## 🧪 Testes - Checklist Essencial

### Testes de Isolamento (OBRIGATÓRIO)

```javascript
// Teste 1: Cross-tenant read deve falhar
test('Usuário A não vê dados de Instalação B', async () => {
    // Login como usuário A (membro de Instalação A)
    // Tentar SELECT em arvores de Instalação B
    // Resultado esperado: 0 registros retornados
});

// Teste 2: Cross-tenant write deve falhar
test('Usuário A não pode inserir em Instalação B', async () => {
    // Login como usuário A (membro de Instalação A)
    // Tentar INSERT em arvores com instalacao_id = B
    // Resultado esperado: Erro 403 ou rejeição
});

// Teste 3: Perfil incorreto deve falhar
test('Executante não pode editar planos', async () => {
    // Login como Executante
    // Tentar UPDATE em planos
    // Resultado esperado: Erro 403 ou rejeição
});
```

### Testes de Migração

```javascript
// Teste: Integridade de dados
test('Migração preserva 100% dos dados', async () => {
    // Contar registros antes da migração
    // Executar migração
    // Contar registros depois
    // Resultado esperado: Contagens iguais
});

// Teste: Relacionamentos preservados
test('Migração preserva relacionamentos', async () => {
    // Verificar FKs antes da migração
    // Executar migração
    // Verificar FKs depois
    // Resultado esperado: Todos os FKs válidos
});
```

---

## ⚡ Performance - Otimizações

### Índices Críticos

```sql
-- SEMPRE criar índices compostos com instalacao_id primeiro!
CREATE INDEX idx_arvores_instalacao_especie 
ON arvores(instalacao_id, especie);

CREATE INDEX idx_arvores_instalacao_risco 
ON arvores(instalacao_id, risco_calculado DESC);

CREATE INDEX idx_planos_instalacao_status 
ON planos(instalacao_id, status);
```

### Cache de Permissões

```javascript
// utils/permissions.js
class PermissionManager {
    constructor(supabaseClient) {
        this.supabase = supabaseClient;
        this.cache = new Map(); // ← Cache em memória
    }
    
    async getPerfis(instalacaoId) {
        const cacheKey = `perfis_${instalacaoId}`;
        
        // Verificar cache primeiro
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Se não está em cache, buscar do DB
        const { data } = await this.supabase
            .from('instalacao_membros')
            .select('perfis(nome, permissoes)')
            .eq('instalacao_id', instalacaoId)
            .eq('user_id', this.supabase.auth.user().id)
            .eq('status', 'ativo')
            .single();
        
        const perfis = data?.perfis || [];
        this.cache.set(cacheKey, perfis); // ← Salvar em cache
        return perfis;
    }
    
    clearCache() {
        this.cache.clear(); // ← Limpar ao trocar instalação
    }
}
```

---

## 🚨 Erros Comuns e Soluções

### Erro 1: "RLS policy violation"

**Causa:** Tentativa de acesso a dados sem permissão  
**Solução:** Verificar se:
1. Usuário é membro ativo da instalação
2. Usuário tem o perfil necessário
3. Query inclui filtro por `instalacao_id`

```javascript
// ❌ ERRADO - Sem filtro de instalação
const { data } = await supabase.from('arvores').select('*');

// ✅ CORRETO - Com filtro de instalação
const instalacaoId = localStorage.getItem('instalacao_ativa_id');
const { data } = await supabase
    .from('arvores')
    .select('*')
    .eq('instalacao_id', instalacaoId);
```

### Erro 2: "Foreign key violation"

**Causa:** Tentativa de inserir com `instalacao_id` inválido  
**Solução:** Sempre usar `instalacao_id` da instalação ativa

```javascript
// ❌ ERRADO - instalacao_id hardcoded
const { data } = await supabase.from('arvores').insert({
    especie: 'Ipê',
    instalacao_id: 'abc-123' // ← Pode não existir!
});

// ✅ CORRETO - instalacao_id da instalação ativa
const instalacaoId = localStorage.getItem('instalacao_ativa_id');
const { data } = await supabase.from('arvores').insert({
    especie: 'Ipê',
    instalacao_id: instalacaoId
});
```

### Erro 3: "Permission denied"

**Causa:** Perfil do usuário não tem permissão para a ação  
**Solução:** Verificar permissões antes de exibir UI

```javascript
// ❌ ERRADO - Mostrar botão sem verificar permissão
<button onclick="deletarArvore()">Deletar</button>

// ✅ CORRETO - Verificar permissão primeiro
const podeDeleta = await permissionManager.temPerfil(instalacaoId, 'Gestor');
if (podeDeleta) {
    // Mostrar botão
}
```

---

## 📝 Convenções de Código

### Nomenclatura

```javascript
// Variáveis
const instalacaoId = '...';        // camelCase
const instalacao_id = '...';       // snake_case (apenas em SQL)

// Funções
async getInstalacoes() { }         // camelCase, verbo + substantivo
async criarInstalacao() { }        // camelCase, verbo + substantivo

// Classes
class InstalacaoService { }        // PascalCase
class PermissionManager { }        // PascalCase

// Constantes
const MAX_INSTALACOES = 100;       // UPPER_SNAKE_CASE
```

### Estrutura de Arquivos

```
js/
├── services/
│   ├── instalacao-service.js
│   ├── permission-service.js
│   └── notification-service.js
├── utils/
│   ├── permissions.js
│   └── validation.js
├── components/
│   ├── instalacao-selector.js
│   └── notification-badge.js
└── modules/
    ├── instalacoes-module.js
    └── membros-module.js
```

---

## 🔍 Debugging

### Verificar RLS Policies

```sql
-- Ver todas as policies de uma tabela
SELECT * FROM pg_policies WHERE tablename = 'arvores';

-- Testar policy manualmente
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-id-aqui';
SELECT * FROM arvores WHERE instalacao_id = 'instalacao-id-aqui';
```

### Verificar Permissões de Usuário

```sql
-- Ver instalações do usuário
SELECT i.nome, im.perfis, im.status
FROM instalacao_membros im
JOIN instalacoes i ON i.id = im.instalacao_id
WHERE im.user_id = 'user-id-aqui';

-- Ver perfis do usuário em uma instalação
SELECT p.nome, p.permissoes
FROM instalacao_membros im
JOIN perfis p ON p.id = ANY(im.perfis)
WHERE im.instalacao_id = 'instalacao-id-aqui'
AND im.user_id = 'user-id-aqui';
```

### Logs Úteis

```javascript
// Log de instalação ativa
console.log('Instalação ativa:', localStorage.getItem('instalacao_ativa_id'));

// Log de perfis do usuário
const perfis = await permissionManager.getPerfis(instalacaoId);
console.log('Perfis do usuário:', perfis);

// Log de query Supabase
const { data, error } = await supabase
    .from('arvores')
    .select('*')
    .eq('instalacao_id', instalacaoId);
console.log('Query result:', { data, error });
```

---

## 📚 Recursos Adicionais

### Documentação Completa
- **PRD Completo:** `docs/prd.md`
- **Executive Summary:** `docs/prd-executive-summary.md`
- **Implementation Checklist:** `docs/implementation-checklist.md`
- **Pesquisa Técnica:** `docs/analysis/research/technical-multi-tenant-supabase-research-2025-12-09.md`

### Links Úteis
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Multi-tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)

---

**Última atualização:** 2025-12-09  
**Mantido por:** Ammon  
**Dúvidas?** Consulte o PRD completo ou abra uma issue
