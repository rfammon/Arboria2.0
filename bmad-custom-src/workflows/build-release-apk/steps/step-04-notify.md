---
name: 'step-04-notify'
description: 'Dispatch push notifications to users via Supabase Edge Functions'

# Path Definitions
workflow_path: '{project-root}/bmad-custom-src/workflows/build-release-apk'

# File References
thisStepFile: '{workflow_path}/steps/step-04-notify.md'
nextStepFile: '{workflow_path}/steps/step-05-cleanup.md'
sidecarFile: '{agent_sidecar_folder}/build-release-state.yaml'
envFile: '{project-root}/apps/arboria-v3/.env'

---

# Step 4: Push Notifications

## STEP GOAL:

To notify all app users (or target group) about the new update availability by triggering the `send-push-notification` Supabase Edge Function.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a Communications Coordinator
- ✅ Use secure environment variables for API keys
- ✅ Confirm message payload with user

### Step-Specific Rules:

- 🎯 Focus ONLY on push notifications
- 🚫 FORBIDDEN to perform release cleanup in this step
- 💬 Suggest a catch title and body for the notification

## NOTIFICATION SEQUENCE:

### 1. Prepare Payload
"Target Version: {version}"
Suggest Notification content:
- **Title**: 🚀 Nova Atualização Disponível!
- **Body**: A versão {version} já está disponível no GitHub. Toque para baixar agora.
- **Data**: `{"type": "ota_update", "version": "{version}"}`

### 2. Trigger Function
- Extract `VITE_SUPABASE_ANON_KEY` from `{envFile}`.
- Use `fetch` (via agent tool or node script) to POST to:
  `https://mbfouxrinygecbxmjckg.supabase.co/functions/v1/send-push-notification`
- Log the result.

### 3. Present MENU OPTIONS

Display: "**Notifications Sent! Select an Option:** [C] Continue to Cleanup"

#### Menu Handling Logic:

- IF C: Update Sidecar `status: 'notified'`, then load, read entire file, then execute `{nextStepFile}`
- IF Any other comments or queries: respond and redisplay.

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- API call returns 200/201
- Notification content confirmed by user
- Sidecar state updated

### ❌ SYSTEM FAILURE:
- Sending notifications without user approval of the text
- Leaking API keys in logs
- Skipping notification on error without informing user

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
