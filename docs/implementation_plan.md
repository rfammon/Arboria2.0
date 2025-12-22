# Implementation Plan - Arboria 3.0

**Goal**: Migrate Arboria Legacy to a unified React/Tauri/Capacitor codebase, implementing offline-first architecture and multi-tenancy.

## User Review Required
> [!IMPORTANT]
> **Monorepo Strategy:** This plan assumes a "side-by-side" migration where the new app `Arboria 3.0` is built in a new directory structure (`src/`, `src-tauri/`, `android/`) within the existing repo to facilitate reference to legacy code.

## Proposed Changes

### Phase 1: Foundation & Infrastructure (Sprint 1-2)
**Goal:** Operational "Walking Skeleton" with Auth and Offline Sync.

#### [NEW] [Project Structure]
- Initialize Vite + React + TypeScript project.
- Initialize Tauri (v2) for Desktop.
- Initialize Capacitor (v6) for Mobile.
- Configure Tailwind CSS + Shadcn/UI.

#### [NEW] [Core Logic]
- Set up `TanStack Query` with SQLite persistence (Offline cache).
- Implement `AuthProvider` (Supabase Auth Listener).
- Implement `OfflineSyncProvider` (Action Queue for mutations).
- Create generic Layouts (Sidebar, Header, Mobile Nav).

### Phase 2: Core Data & Maps (Sprint 3-4)
**Goal:** Users can view and manage trees on a map offline.

#### [NEW] [Inventory Module]
- Implement Tree CRUD (Create, Read, Update, Delete).
- Migrate validation logic (Schema Zod) from Legacy.
- Implement `LeafletMap` component with `SuperCluster`.
- Implement Filter Context (search trees by species, risk, etc.).

### Phase 3: Planning & Field Execution (Sprint 5-6)
**Goal:** Managers plan, Executors execute in the field.

#### [NEW] [Planning Module]
- Plan Manager UI (CRUD Plans).
- Task assignment logic.

#### [NEW] [Execution Module (Field App)]
- Task List UI (Mobile optimized).
- Execution Flow (Start -> Photos -> Finish).
- Camera integration (Capacitor Camera).
- Geolocation tracking (Capacitor Geolocation).

### Phase 4: Polish & Release (Sprint 7)
**Goal:** Production ready artifacts.

#### [NEW] [Release Engineering]
- Configure GitHub Actions for Tauri Build (Windows .msi).
- Configure GitHub Actions for Android Build (.apk).
- User Acceptance Testing (UAT) with legacy users.

## Verification Plan

### Automated Tests
- **Unit:** Vitest for utility functions (Sync logic, calculations).
- **Component:** React Testing Library for critical UI components.
- **E2E:** Playwright for critical user flows (Login -> Create Tree -> Sync).

### Manual Verification
- **Offline Test:** Turn off WiFi -> Create Tree -> Turn on WiFi -> Verify Sync.
- **Map Performance:** Load 5k trees -> Pan/Zoom -> Verify 60fps.
- **Cross-Platform:** Verify UI responsiveness on Desktop (Windows) vs Mobile (Android).
