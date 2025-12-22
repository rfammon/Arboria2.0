# 🔐 Credenciais de Teste - Sistema Multi-Tenant ArborIA

**Data:** 2025-12-10  
**Versão:** 1.0

---

## 👤 Usuários de Teste

### **IMPORTANTE:**
Durante a implementação do backend multi-tenant, **NÃO foram criados usuários de teste automaticamente** nos scripts SQL. 

Os scripts apenas criaram a estrutura de tabelas (`instalacoes`, `instalacao_membros`, `perfis`, etc.), mas **não inseriram dados de teste**.

---

## 🚀 Como Criar Seu Primeiro Usuário Gestor

### **Opção 1: Criar Novo Usuário via Interface (RECOMENDADO)**

1. **Acesse a aplicação** no navegador
2. **Faça login** com sua conta Supabase existente (ou crie uma nova)
3. **Após o login**, o sistema detectará que você não tem instalações
4. **Tela de Onboarding** aparecerá automaticamente
5. **Clique em "Criar Nova Instalação"**
6. **Preencha o formulário:**
   - Nome: "Instalação Teste"
   - Tipo: "Município" (ou outro)
   - Localização: "São Paulo, SP"
   - Descrição: "Instalação para testes"
7. **Clique em "Criar Instalação"**
8. **Você será automaticamente definido como Gestor** desta instalação

---

### **Opção 2: Criar Manualmente via SQL (Para Testes Rápidos)**

Se você quiser criar dados de teste diretamente no banco:

```sql
-- ============================================================================
-- SCRIPT DE TESTE: Criar Instalação e Usuário Gestor
-- ============================================================================

-- 1. Primeiro, pegue o ID do seu usuário autenticado
-- Execute no Supabase SQL Editor:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- 2. Copie o UUID do seu usuário e substitua abaixo
-- Exemplo: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- 3. Criar uma instalação de teste
INSERT INTO instalacoes (
    nome,
    tipo,
    localizacao,
    descricao,
    ativa
) VALUES (
    'Parque Municipal Central',
    'Parque',
    'São Paulo, SP',
    'Instalação de teste para desenvolvimento',
    true
) RETURNING id;

-- 4. Copie o ID da instalação retornado acima e substitua abaixo
-- Exemplo: 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

-- 5. Adicionar você como Gestor desta instalação
INSERT INTO instalacao_membros (
    instalacao_id,
    user_id,
    perfis,
    adicionado_por,
    ativo
) VALUES (
    'ID_DA_INSTALACAO_AQUI',  -- Substituir pelo ID da instalação
    'SEU_USER_ID_AQUI',        -- Substituir pelo seu user_id
    ARRAY['Gestor']::text[],
    'SEU_USER_ID_AQUI',        -- Substituir pelo seu user_id
    true
);

-- 6. Verificar se foi criado corretamente
SELECT 
    i.nome as instalacao,
    i.tipo,
    u.email,
    im.perfis
FROM instalacao_membros im
JOIN instalacoes i ON i.id = im.instalacao_id
JOIN auth.users u ON u.id = im.user_id
WHERE im.user_id = 'SEU_USER_ID_AQUI';  -- Substituir pelo seu user_id
```

---

## 🧪 Verificar Instalações Existentes

Para verificar se você já tem instalações no banco:

```sql
-- Ver todas as instalações
SELECT 
    id,
    nome,
    tipo,
    localizacao,
    ativa,
    created_at
FROM instalacoes
ORDER BY created_at DESC;

-- Ver seus membros em instalações
SELECT 
    i.nome as instalacao,
    i.tipo,
    im.perfis,
    im.ativo,
    im.adicionado_em
FROM instalacao_membros im
JOIN instalacoes i ON i.id = im.instalacao_id
WHERE im.user_id = auth.uid()  -- Seu usuário atual
ORDER BY im.adicionado_em DESC;
```

---

## 📝 Perfis Disponíveis

Quando você criar uma instalação ou for adicionado como membro, pode ter um ou mais destes perfis:

| Perfil | ID | Descrição | Permissões Principais |
|--------|----|-----------|-----------------------|
| **Mestre** | 1 | Admin global | Todas as permissões |
| **Gestor** | 2 | Gestor da instalação | Gerenciar membros, aprovar solicitações, criar/editar planos |
| **Planejador** | 3 | Criador de planos | Criar/editar planos, visualizar inventário |
| **Executante** | 4 | Executor (read-only) | Visualizar planos e inventário |
| **Inventariador** | 5 | Coletor de dados | Criar/editar inventário |

---

## 🔍 Testar o Sistema Multi-Tenant

### **1. Após Criar Instalação:**

```javascript
// No console do navegador, verificar estado:
MultiTenantInit.getStatus()

// Deve retornar algo como:
{
  initialized: true,
  needsOnboarding: false,
  instalacaoAtiva: {
    id: "uuid-da-instalacao",
    nome: "Parque Municipal Central",
    tipo: "Parque",
    ...
  },
  perfis: ["Gestor"],
  permissoes: { ... },
  notificacoesNaoLidas: 0
}
```

### **2. Testar Modais:**

```javascript
// Modal de criar instalação
window.dispatchEvent(new CustomEvent('show-criar-instalacao-modal'));

// Modal de solicitar acesso
window.dispatchEvent(new CustomEvent('show-solicitar-acesso-modal'));
```

### **3. Verificar Componentes UI:**

No header da aplicação, você deve ver:
- 🔔 **NotificationBadge** (ícone de sino)
- 🏢 **InstalacaoSelector** (nome da instalação com dropdown)

---

## ⚠️ Troubleshooting

### **Problema: "Nenhuma instalação encontrada"**
**Solução:** Execute a Opção 1 ou 2 acima para criar sua primeira instalação.

### **Problema: "Erro ao criar instalação"**
**Possíveis causas:**
1. Usuário não autenticado → Faça login primeiro
2. Erro de permissão RLS → Verifique se as policies foram criadas (script 04)
3. Erro de validação → Verifique se preencheu todos os campos obrigatórios

**Debug:**
```javascript
// Ver erros no console
console.log('Usuário atual:', await ApiService.getUser());
console.log('Instalações:', await ApiService.getUserInstalacoes());
```

### **Problema: "Componentes não aparecem no header"**
**Solução:**
1. Verifique se o CSS foi carregado (inspecionar elemento)
2. Verifique se o JavaScript foi importado (console → sem erros)
3. Force refresh: `Ctrl + Shift + R` (Windows) ou `Cmd + Shift + R` (Mac)

---

## 📊 Dados de Teste Completos (Opcional)

Se quiser criar um ambiente de teste mais completo:

```sql
-- Criar múltiplas instalações
INSERT INTO instalacoes (nome, tipo, localizacao, descricao, ativa) VALUES
('Parque Municipal Central', 'Parque', 'São Paulo, SP', 'Parque urbano central', true),
('Campus Universitário', 'Campus', 'Campinas, SP', 'Campus da universidade', true),
('Planta Industrial XYZ', 'Planta Industrial', 'São Bernardo, SP', 'Complexo industrial', true);

-- Adicionar você como Gestor em todas
INSERT INTO instalacao_membros (instalacao_id, user_id, perfis, adicionado_por, ativo)
SELECT 
    id,
    'SEU_USER_ID_AQUI',
    ARRAY['Gestor']::text[],
    'SEU_USER_ID_AQUI',
    true
FROM instalacoes
WHERE nome IN ('Parque Municipal Central', 'Campus Universitário', 'Planta Industrial XYZ');
```

---

## 🎯 Próximos Passos Após Criar Instalação

1. ✅ **Testar Seletor de Instalação** - Click no dropdown no header
2. ✅ **Testar Notificações** - Click no ícone de sino
3. ✅ **Criar Árvores** - Adicionar dados de inventário
4. ✅ **Criar Planos** - Testar criação de planos de intervenção
5. ✅ **Convidar Membros** - Testar sistema de convites (quando implementado)

---

## 📞 Suporte

Se encontrar problemas:

1. **Verificar Console do Navegador** - F12 → Console
2. **Verificar Network Tab** - F12 → Network (ver chamadas API)
3. **Verificar Supabase Logs** - Dashboard do Supabase → Logs
4. **Verificar RLS Policies** - Supabase → Authentication → Policies

---

**Última Atualização:** 2025-12-10 05:15 BRT  
**Autor:** BMAD Team  
**Status:** Pronto para Testes
