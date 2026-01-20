---
description: Build and release a new version of the ArborIA Android app
---

This workflow automates the process of creating a GitHub release, uploading the APK, and notifying users.

### Prerequisites
- Assets must be built (run `npm run build` and `./gradlew assembleRelease` in the `android` directory).
- GitHub CLI (`gh`) must be authenticated.
- Supabase CLI / Edge Functions environment must be configured for notifications.

### Steps

1. **Verify Assets**
   Check if the APK exists in the root or build directory.
   ```bash
   dir arboria-v*.apk
   ```

2. **Extract Version**
   Get the version from `package.json`.

3. **Create GitHub Release**
   // turbo
   ```bash
   gh release create v1.1.56 --title "v1.1.56 - Melhorias Visuais no Cabeçalho" --notes "Esta versão traz ajustes no cabeçalho para melhor visualização no Android, corrigindo truncamentos e adicionando um visual premium."
   ```

4. **Upload APK to Release**
   // turbo
   ```bash
   gh release upload v1.1.56 arboria-v1.1.56-header-fix.apk
   ```

5. **Send Notification**
   // turbo
   ```bash
   node scripts/send-release-notification.mjs
   ```

6. **Verify OTA**
   Ensure the OTA bundle was created and remind the user to upload it to Capawesome Cloud if not done automatically.
