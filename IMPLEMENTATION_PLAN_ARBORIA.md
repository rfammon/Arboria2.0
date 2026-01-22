# Plano de Implementação: Arboria v3 "Pro Mode"

Este documento descreve as ferramentas e configurações recomendadas para acelerar o desenvolvimento do Arboria v3, integrando plugins do ecossistema Awesome-Opencode.

## 1. Orquestração e Agentes Especializados
**Ferramenta:** `oh-my-opencode-slim`
**Objetivo:** Criar especialistas para os diferentes contextos do projeto (Mobile, Desktop, Backend).

### Configuração em `.opencode/oh-my-opencode.json`:
```json
{
  "agents": {
    "Arboria-Mobile": {
      "model": "google/antigravity-gemini-3-pro",
      "system_prompt": "Especialista em Capacitor 6 e Android. Foco em permissões nativas, plugins Capacitor e performance mobile."
    },
    "Arboria-Desktop": {
      "model": "google/antigravity-claude-3-7-sonnet",
      "system_prompt": "Especialista em Tauri 2 e Rust. Foco em integrações de SO, segurança de backend Tauri e performance desktop."
    },
    "Arboria-Supabase": {
      "model": "google/antigravity-gemini-3-flash",
      "system_prompt": "Especialista em PostgreSQL e Supabase. Foco em RLS Policies, Migrations e Edge Functions."
    }
  }
}
```

## 2. Pipeline de Build e Notificações
**Ferramentas:** `opencode-background-agents` + `opencode-notify`
**Objetivo:** Rodar builds pesados em background e receber avisos no desktop.

### Automação no `package.json`:
```json
"scripts": {
  "bg-build:android": "opencode delegate 'npm run build:android' --agent background-agents && opencode notify 'Build Android do Arboria concluído!'",
  "bg-build:windows": "opencode delegate 'npm run build:windows' --agent background-agents && opencode notify 'Build Windows do Arboria concluído!'"
}
```

## 3. Isolamento e Workflow
**Ferramentas:** `opencode-worktree` + `micode`
**Objetivo:** Isolar o desenvolvimento de features e garantir um fluxo de planejamento antes da escrita.

### Fluxo Recomendado:
1. Iniciar feature: `opencode worktree create <branch-name>`
2. Planejar com Micode: Seguir o workflow `Brainstorming → Planning → Implementation`.

## 4. Performance e Escrita
**Ferramenta:** `opencode-morph-fast-apply`
**Objetivo:** Edição instantânea de arquivos grandes (>400 linhas), economizando tokens e tempo.

## 5. Segurança e Continuidade
**Ferramentas:** `claude-code-safety-net` + `opencode-handoff`
**Objetivo:** Evitar comandos destrutivos e facilitar a retomada do trabalho.

### Regras de Segurança (`.opencode/safety-net.json`):
- Bloquear `rm -rf android/app/build`.
- Confirmar `supabase db reset`.

---

## 🛠️ Comandos de Instalação

```bash
# Instalação de Plugins
npx opencode add oh-my-opencode-slim
npx opencode add opencode-notify
npx opencode add opencode-worktree
npx opencode add micode
npx opencode add opencode-handoff
npx opencode add opencode-morph-fast-apply
npx opencode add claude-code-safety-net
```
