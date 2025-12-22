# Sprint 0: Setup Guide - Arboria 3.0

**Objective:** Initialize the unified codebase for Web, Desktop (Tauri), and Mobile (Capacitor).

## 1. Prerequisites
- Node.js 18+
- Rust (for Tauri)
- Android Studio (for Capacitor/Android)
- VS Code with extensions (ESLint, Prettier, Tailwind CSS, Tauri)

## 2. Project Initialization
We will create a new root folder `Arboria-V3` (or similar) inside the repo, or use a `src` struct if merging with legacy. **Decision:** Create `apps/arboria-v3` to keep clean from legacy.

```bash
# Initialize Vite (React + TS)
npm create vite@latest arboria-v3 -- --template react-ts
cd arboria-v3
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. Tauri Setup
```bash
# Initialize Tauri in the existing project
npm install -D @tauri-apps/cli
npx tauri init
# Prompts:
# - App Name: Arboria
# - Window Title: Arboria
# - Frontend: ../dist (Vite default)
# - Dev URL: http://localhost:5173
```

## 4. Capacitor Setup
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
# Prompts:
# - Name: Arboria
# - ID: com.arboria.app
npm install @capacitor/android
npx cap add android
```

## 5. Folder Structure Cleanup
Ensure standard BMM structure:
```
/arboria-v3
  /src
    /components
    /hooks
    /pages
    /lib
  /src-tauri
  /android
```

## 6. Verification
- Run `npm run dev` -> Check Web at localhost:5173.
- Run `npx tauri dev` -> Check Windows Window.
- Run `npx cap open android` -> Run in Emulator -> Check Android App.
