# Arboria v3 - Pro Mode Workflow

## 🚀 Quick Start

### Agentes Especializados Disponíveis
- **Arboria-Mobile**: Capacitor 6 + Android (permissões, plugins, performance)
- **Arboria-Desktop**: Tauri 2 + Rust (SO, segurança, performance)
- **Arboria-Supabase**: PostgreSQL (RLS, Migrations, Edge Functions)

### Plugins Instalados
- **opencode-handoff**: Continuação de sessões com contexto
- **cc-safety-net**: Bloqueio de comandos destrutivos
- **micode**: Workflow Brainstorming → Planning → Implementation
- **Morph Fast Apply**: Edição rápida de arquivos (10,500 tokens/s)
- **WarpGrep**: Busca semântica no codebase

---

## ⚡ Morph Fast Apply

Use `edit_file` ao invés de reescrever arquivos completos:

```
Prefira: edit_file (parcial, rápido)
Evite: Reescrita completa de arquivos
```

### WarpGrep - Busca Semântica
Use para explorar o codebase:
- "Find the authentication flow"
- "How does XYZ work?"
- "Where is <error message> coming from?"

---

## 🔀 Fluxo de Feature com Isolamento

### 1. Criar Worktree Isolado
```bash
opencode worktree create feature/nova-funcionalidade
```

### 2. Planejar com Micode
Antes de escrever código, siga o workflow:

1. **Brainstorming** → Explorar ideias e possibilidades
2. **Planning** → Definir arquitetura e tarefas
3. **Implementation** → Executar com clareza

### 3. Desenvolver
```bash
# Build em background (não bloqueia terminal)
npm run bg-build:android
npm run bg-build:windows
```

### 4. Merge e Cleanup
```bash
opencode worktree merge
opencode worktree cleanup
```

---

## 🛡️ Regras de Segurança Ativas

### ⛔ Comandos Bloqueados
- `rm -rf android/app/build` - Use `./gradlew clean`
- `rm -rf dist` - Confirme manualmente
- `git push --force` - Evite a todo custo
- `DROP DATABASE` - Bloqueado

### ⚠️ Comandos que Pedem Confirmação
- `supabase db reset` - Apaga todos os dados
- `supabase db push` - Aplica migrations em produção
- `npx cap sync` - Sincroniza com plataformas nativas
- `tauri build` - Build de produção (demora)

---

## 📱 Build Commands

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento local |
| `npm run build` | Build web |
| `npm run build:android` | Build Android completo |
| `npm run build:windows` | Build Windows via Tauri |
| `npm run bg-build:android` | Build Android em background + notificação |
| `npm run bg-build:windows` | Build Windows em background + notificação |

---

## 🗄️ Supabase Workflow

```bash
# Criar nova migration
supabase migration new nome_da_migration

# Aplicar localmente
supabase db reset

# Push para produção (pede confirmação)
supabase db push
```

---

## 📋 Checklist de Feature

- [ ] Criar branch/worktree isolado
- [ ] Planejar com Micode (Brainstorm → Plan)
- [ ] Implementar com testes
- [ ] Rodar builds em background
- [ ] Testar em mobile e desktop
- [ ] Merge após review
