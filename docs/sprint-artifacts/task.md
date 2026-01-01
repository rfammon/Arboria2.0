# Task: Implementação de Push Notifications (RF5.3)

**Data Início:** 23/12/2025  
**Prioridade:** P0 - Alta  
**Epic:** RF5 - Sistema de Notificações  
**Story:** RF5.3 - Push Notifications  

## Objetivos
- [ ] Implementar notificações push via Capacitor
- [ ] Integrar com Firebase Cloud Messaging (FCM)
- [ ] Suportar notificações locais e remotas
- [ ] Gerenciar permissões e tokens de dispositivo
- [ ] Criar interface de preferências de notificações
- [ ] Testar em Android real

## Checklist de Implementação

### [/] 1. Planejamento e Pesquisa
- [x] Analisar requisitos do RF5.3
- [ ] Pesquisar plugins Capacitor disponíveis
- [ ] Definir arquitetura de notificações
- [ ] Criar implementation plan
- [ ] Documentar fluxos de notificação

### [ ] 2. Setup Firebase
- [ ] Criar projeto Firebase (ou usar existente)
- [ ] Configurar FCM (Firebase Cloud Messaging)
- [ ] Baixar `google-services.json`
- [ ] Adicionar ao projeto Android
- [ ] Configurar Firebase Admin SDK no backend

### [x] 3. Instalação e Configuração Capacitor
- [x] Instalar `@capacitor/push-notifications`
- [x] Configurar `capacitor.config.ts`
- [x] Sincronizar projeto Android (`npx cap sync`)
- [x] Configurar permissões no `AndroidManifest.xml`
- [x] Atualizar `build.gradle` com Firebase dependencies

### [x] 4. Implementação Frontend
- [x] Criar hook `usePushNotifications.ts`
  - [x] Request permissions
  - [x] Register device token
  - [x] Listen to notifications
  - [x] Handle notification tap
- [x] Criar componente `PushNotificationSettings.tsx`
- [x] Integrar com `NotificationPreferencesCard.tsx` existente
- [x] Adicionar toggle para habilitar/desabilitar push
- [x] Store device token no Supabase

### [x] 5. Implementação Backend (Supabase)
- [x] Criar tabela `device_tokens`
  - [x] Colunas: id, user_id, token, platform, created_at, updated_at
  - [x] RLS policies
- [x] Criar Edge Function `send-push-notification`
  - [x] Integração com Firebase Admin SDK
  - [x] Envio de notificações para múltiplos devices
  - [x] Tratamento de erros e tokens inválidos
  - [x] Debugging e Correção de Inicialização Firebase
- [x] Atualizar triggers de notificação
  - [x] Enviar push quando criar notificação in-app
  - [x] Suportar deep links
- [x] Implementar Deep Linking e OTA Alerts
  - [x] Atualizar `usePushNotifications.ts` com deep linking
  - [x] Rota específica para OTA (`/settings`)
  - [x] Fallback rota para alertas (`/alerts`)

### [ ] 6. Tipos de Notificações
- [ ] **Task Completion** - Tarefa completada
- [ ] **Task Assigned** - Nova tarefa atribuída
- [ ] **Plan Updated** - Plano de intervenção modificado
- [ ] **Comment Added** - Novo comentário
- [ ] **Urgent Alert** - SOS ou alerta urgente
- [ ] **System Update** - Atualizações do sistema

### [ ] 7. Features Avançadas
- [ ] Notificações locais agendadas
- [ ] Badge count no ícone do app
- [ ] Vibration patterns customizados
- [ ] Notification channels (Android)
- [ ] Deep linking para navegação
- [ ] Ações rápidas (Quick Actions)

### [x] 11. Automação e UX (Fixes)
- [x] Script `update-version.mjs` para sincronizar versões
- [x] Hook `useOTA` otimizado (sem auto-check agressivo)
- [x] Correção de mensagens de erro ("Sync in progress")
- [x] Sincronização APK Nativo vs OTA Bundle

### [ ] 8. Testes
- [ ] Teste de permissões
- [ ] Teste de registro de token
- [ ] Teste de recebimento (app foreground)
- [ ] Teste de recebimento (app background)
- [ ] Teste de recebimento (app closed)
- [ ] Teste de tap notification
- [ ] Teste de deep links
- [ ] Teste de desinscrição

### [ ] 9. Documentação
- [ ] Documentar configuração Firebase
- [ ] Documentar tipos de notificações
- [ ] Documentar payload structure
- [ ] Atualizar user guide

### [x] 10. Deployment
- [x] Build APK com push habilitado
- [x] Testar em dispositivo real
- [x] Validar com múltiplos usuários
- [x] Deploy Edge Function
- [x] Atualizar sprint-status.yaml
- [x] Deploy OTA Update (v1.0.21)
  - [x] Bump version
  - [x] Upload bundle via Capawesome CLI
  - [x] Verificar deep linking com script `mock_pushes.js`
- [x] Recompile APK (Fix OTA Channel)
  - [x] `npx cap sync android`
  - [x] `./gradlew assembleDebug`
- [x] Automate Version Sync
  - [x] Update `scripts/update-version.mjs` to write to `build.gradle`
  - [x] Validar sincronização (npm run build)
- [x] Implementar Downgrade Prevention
  - [x] Add semantic version comparison to `useOTA.ts`
  - [x] Allow UUID fallback (permissive mode)
- [x] Fix OTA Version Mismatch (v1.0.22+)
  - [x] Configurar channel 'Production' explícito
  - [x] Refinar lógica de toast `useOTA.ts`
  - [x] Implementar Cache Busting (`?t=timestamp`)
  - [x] Deploy v1.0.26 Final w/ Native Sync
  - [x] Configurar channel 'Production' explícito
  - [x] Refinar lógica de toast `useOTA.ts`
- [x] Fix OTA Version Display (Manual Refactor)
  - [x] Refactor `OTAContext` (Manual Check/Download)
  - [x] Update Settings UI
  - [x] Bump to 1.0.31 (Built)
- [x] Deploy v1.0.31 (Manual Steps)
  - [x] Delete `fa269...` (Bad Bundle)
  - [x] Create Bundle `ade46...` (v1.0.31)
  - [ ] Assign to 'Production' (Blocked: User to do Manually)
  - [ ] Verify Update on Device

- [x] Restore Glossary (OTA Test v1.0.32)
  - [x] Expand glossary terms (legacy content)
  - [x] Bump to 1.0.32 & Build
  - [x] Create Bundle `3f011...` (v1.0.32)
  - [ ] Assign to 'Production' (User Manual Action)

- [x] Restore Concepts & Tooltips (OTA Test v1.0.33)
  - [x] Restore "Definições e Termos" content
  - [x] Generate & Embed Images (Anatomy, DAP, Pruning)
  - [x] Implement Tooltip function in ContentViewer
  - [x] Create Bundle (v1.0.33)
  - [ ] Assign to 'Production' (User Manual Action)

- [x] Fix OTA "Verification Failed" Loop (v1.0.34)
  - [x] Fix: Check active vs target bundle equality
  - [x] Fix: Handle redundant sync() in `downloadUpdate`
  - [x] Create Bundle v1.0.34 (`1f0f2288...`)
  - [x] Assign to 'Production' (Verify in Console)

- [x] Release v1.0.35 (Logic Fix + Version Bump)
  - [x] Bump Version to 1.0.35
  - [x] Create Bundle v1.0.35 (`b8465775...`)
  - [x] Auto-assign to 'Production' via CLI

- [x] Release v1.0.36 (Final Verification)
  - [x] Bump Version to 1.0.36
  - [x] Create Bundle v1.0.36 (`915a870a...`)
  - [x] Auto-assign to 'Production' via CLI
  - [x] Verify OTA Update on Device (User Action - Confirmed v1.0.36)

- [x] Fix Tooltips Rendering (v1.0.37)
  - [x] Implement Markdown Pre-processor
  - [x] Bump Version to 1.0.37
  - [x] Create Bundle v1.0.37 (`5bd50e94...`)
  - [x] Auto-assign to 'Production' via CLI
  - [x] Implementar Cache Busting (`?t=timestamp`)
  - [x] Deploy v1.0.24 Final

- [x] Fix Tooltip Crash (v1.0.38)
  - [x] Switch ContentViewer to use `Popover`
  - [x] Create Bundle v1.0.38 (`05f89883...`)
  - [x] Auto-assign to 'Production' via CLI (Deployed but OTA checked failed)

- [x] Fix OTA Channel Configuration (v1.0.39)
  - [x] Explicitly pass `channel: 'Production'` in `OTAContext.tsx`
  - [x] Bump Version to 1.0.39
  - [x] Build and Sync Android project
  - [x] Manual Install via USB (Done)
  - [x] Create Bundle v1.0.39 (`165abf09...`) to sync cloud with native

- [x] Fix Tooltip Crash & UI Polish (v1.0.40)
  - [x] Replace `Popover` with `TooltipItem` (Simple React State) to fix crash
  - [x] Remove hardcoded version in Settings UI
  - [x] Build and Sync Android v1.0.40
  - [x] Manual Install via USB (v1.0.40)

- [x] Implement Downgrade Prevention (v1.0.41)
  - [x] Added `LiveUpdate.reset()` on Native Version Change
  - [x] Bump Version to 1.0.41
  - [x] Build and Sync Android v1.0.41
  - [x] Manual Install via USB (v1.0.41)

- [x] Stabilization (v1.0.42)
  - [x] Fix Tooltip Crash (Use Toasts)
  - [x] Upload Bundle v1.0.42 to 'Production' (Sync Cloud)
  - [x] Manual Install via USB (v1.0.42)

- [x] Final Stabilization (v1.0.43)
  - [x] Tooltip: Wrap in `setTimeout` to prevent WebView crash
  - [x] OTA: Aggressive Reset on First Run/Upgrade
  - [x] Upload Bundle v1.0.43 to 'Production'
  - [x] Manual Install via USB (v1.0.43)

- [x] Major Refactor: Tooltip -> Modal (v1.0.44)
  - [x] Replaced unstable tooltips with Global Definition Modal
  - [x] Implemented `DefinitionContext` & `DefinitionModal`
  - [x] Upload Bundle v1.0.44 to 'Production'
  - [x] Manual Install via USB (v1.0.44)

- [x] Re-Deploy v1.0.45 (Fix Missing Feature)
  - [x] Clean Build
  - [x] Upload Bundle v1.0.45
  - [x] Manual Install via USB (v1.0.45)

- [x] Nuclear Reset (v1.0.46)
  - [x] Delete `dist`, `android/build`, and `assets/public`
  - [x] Clean Build v1.0.46
  - [ ] Upload Bundle v1.0.46
  - [ ] Manual Install via USB (v1.0.46)

## Requisitos Técnicos

### Capacitor Plugins Necessários:
- `@capacitor/push-notifications` - Push notifications
- `@capacitor/local-notifications` - Local notifications (opcional)
- `@capacitor/action-sheet` - Quick actions (opcional)

### Firebase Services:
- Firebase Cloud Messaging (FCM)
- Firebase Admin SDK (backend)

### Supabase:
- Tabela `device_tokens`
- Edge Function `send-push-notification`
- Triggers atualizados

## Arquivos Principais

### Novos Arquivos:
- `src/hooks/usePushNotifications.ts`
- `src/components/features/PushNotificationSettings.tsx`
- `supabase/functions/send-push-notification/index.ts`
- `supabase/migrations/XXXXXX_create_device_tokens.sql`

### Arquivos a Modificar:
- `capacitor.config.ts`
- `android/app/google-services.json`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `src/components/features/NotificationPreferencesCard.tsx`
- `src/types/notification.ts`

## Critérios de Aceitação

- ✅ Usuário pode habilitar/desabilitar push notifications
- ✅ Device token é armazenado no Supabase
- ✅ Notificações são recebidas em foreground, background e closed
- ✅ Tap na notificação abre o app na tela correta (deep link)
- ✅ Tipos principais de notificação implementados
- ✅ Permissões gerenciadas adequadamente
- ✅ Badge count atualizado corretamente
- ✅ Funcionamento validado em dispositivo Android real

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Delay na aprovação Firebase | Baixa | Alto | Usar projeto existente se possível |
| Problemas com FCM tokens | Média | Médio | Implementar retry logic e token refresh |
| Deep links não funcionando | Média | Médio | Testar exaustivamente com URL scheme |
| Notificações bloqueadas pelo SO | Baixa | Alto | UX clara para solicitar permissões |

## Estimativa

- **Complexidade:** Média-Alta
- **Tempo Estimado:** 8-12 horas
- **Story Points:** 8

## Notas

- Firebase project já existe (`google-services.json` encontrado em 18/12)
- Hook `usePushNotifications.ts` já existe mas precisa ser revisado e expandido
- Integrar com sistema de notificações existente (`NotificationService.ts`)
- Considerar rate limiting para evitar spam

## Referências

- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
