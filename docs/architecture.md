# System Architecture - Arboria 3.0

**Status:** Draft
**Date:** 2025-12-11
**Author:** Ammon (AI Agent)

## 1. Executive Summary

ArborIA 3.0 is a **multi-tenant, offline-first tree management platform** built on a modern, unified codebase. It serves industrial facilities, municipalities, and service providers through a high-performance web application (React), a native Windows desktop app (Tauri), and a native Android mobile app (Capacitor).

The system prioritizes **data isolation** (RLS), **field reliability** (Offline-First), and **operational efficiency** (Shared Codebase).

---

## 2. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph "Clients (Unified Codebase)"
        Web[Web Browser]
        Desktop[Windows Desktop (Tauri)]
        Mobile[Android Mobile (Capacitor)]
    end

    subgraph "Edge Layer"
        CDN[Vite Build Distribution]
        Auth[Supabase Auth]
    end

    subgraph "Backend Services (Supabase)"
        DB[(PostgreSQL + RLS)]
        Storage[Object Storage (Photos)]
        Edge[Edge Functions]
    end

    Web -->|HTTPS| Auth
    Desktop -->|HTTPS| Auth
    Mobile -->|HTTPS| Auth

    Web -->|REST/Realtime| DB
    Desktop -->|REST/Realtime| DB
    Mobile -->|REST/Realtime| DB

    Desktop -.->|Plugin| LocalDB[(SQLite Local)]
    Mobile -.->|Plugin| LocalDB[(SQLite Local)]
```

---

## 3. Technology Stack

### 3.1. Frontend (The Unified Core)
*   **Framework:** React 18+
*   **Language:** TypeScript 5.x
*   **Build Tool:** Vite
*   **State Management:**
    *   **Server State:** TanStack Query (React Query) - *Critical for caching & offline sync*
    *   **Global Client State:** Zustand - *Lightweight, for UI state*
*   **Routing:** React Router v6
*   **UI Library:** Tailwind CSS + Radix UI (Shadcn/ui)
    *   **Adaptive UI Strategy:** **CSS Variables** defined at root level (`:root[data-density='field|office']`) to drive density without React re-renders.
    *   **Blade UI (Desktop):** **URL-Driven State** for side panels to ensure deep-linking and state preservation.
*   **Maps:** React-Leaflet + SuperCluster (Canvas rendering for performance)
*   **Forms:** React Hook Form + Zod (Schema Validation)

### 3.2. Native Containers
*   **Desktop (Windows):** **Tauri v2**
    *   *Why:* Extremely lightweight, secure by default, native OS access.
*   **Mobile (Android):** **Capacitor v6**
    *   *Why:* Uses same web assets, access to native plugins (Camera, Geolocation, Filesystem).

### 3.3. Backend (Backend-as-a-Service)
*   **Platform:** **Supabase**
*   **Database:** PostgreSQL 15+
*   **Security:** Row Level Security (RLS) - *Enforces Multi-tenancy at DB level*
*   **Auth:** Supabase Auth (JWT)
*   **Storage:** Supabase Storage (S3 compatible)
*   **Logic:** PL/pgSQL Functions + Edge Functions (Deno)

---

## 4. Core Architecture Patterns

### 4.1. Offline-First Strategy
Reliability in the field is paramount. We adopt an "Optimistic UI" approach with heavy caching.

1.  **Read Strategy:**
    *   **Web:** React Query caches responses in `localStorage` (persister).
    *   **Native (Tauri/Capacitor):** React Query persists cache to **SQLite** (via plugins) for larger storage capacity and better performance.

3.  **Offline Media Strategy (The Photo Cache):**
    - **Service Worker Interception:** Transparently intercepts requests to Object Storage.
    - **Hybrid Storage:** Thumbnails (WebP) cached in **IndexedDB** for instant offline visual verification during "Verification Drawer" flow.
    - **LRU Policy:** Automatically evicts oldest cached images when quota is reached or `instalacao_id` switches.

### 4.2. Multi-Tenancy & Security
Isolation is guaranteed by the database engine.

*   **Tenant ID:** `instalacao_id` is a required column on all tenant-scoped tables (`arvores`, `planos`, etc.).
*   **RLS Policies:** PostgreSQL policies enforce that `auth.uid()` belongs to the correct `instalacao_membros`.
    *   *Example:* `CREATE POLICY select_arvores ON arvores USING (user_has_access(instalacao_id));`
*   **Frontend Context:** The app boots, checks the user's active `instalacao_id`, and configures global headers/filters to ensure all queries are scoped.

### 4.3. Map Performance
Rendering thousands of trees requires optimization.

*   **Clustering:** Server-side clustering (PostGIS) or Client-side `SuperCluster` depending on zoom level.
*   **Canvas Rendering:** Leaflet's `preferCanvas: true` option used to render markers as a single canvas layer rather than thousands of DOM nodes.
*   **Viewport Fetching:** Only fetch data for the current bounding box (`st_intersects`).

### 4.4. Collaborative Presence
Ensures safety in multi-user environments.

*   **Technology:** **Supabase Realtime (Presence)**.
*   **Presence Payload:** `{ user_id: UUID, tree_id: UUID, last_active: ISO-8601 }`.
*   **UI Feedback:** Subtle "Live Occupation" badges in the Blade (Desktop) or Drawer (Mobile) to alert users if someone else is editing the same tree.

---

## 5. Folder Structure (Monorepo-style)

```
/
├── .vscode/               # Editor config
├── src-tauri/             # Rust backend for Desktop
├── android/               # Native Android project
├── src/
│   ├── api/               # Supabase client & queries
│   ├── assets/            # Static assets
│   ├── components/        # Shared UI components
│   │   ├── core/          # Buttons, Inputs (Design System)
│   │   ├── features/      # Trees, Maps, Blade (Desktop), Drawer (Mobile)
│   │   └── layout/        # Shell, Nav
│   ├── context/           # React Contexts (Auth, Tenant)
│   ├── hooks/             # Custom hooks (useGeolocation, useOffline)
│   ├── lib/               # Utilities (Date, Formatters)
│   ├── pages/             # Route components
│   ├── store/             # Zustand stores (Action Queue)
│   ├── types/             # TypeScript interfaces (DB generated)
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 6. Deployment & CI/CD

*   **Web:** Vercel or Netlify (Auto-deploy on git push).
*   **Desktop:** GitHub Actions builds `.msi` / `.exe` installers.
*   **Mobile:** GitHub Actions builds `.apk` (Release management via Play Console manual upload initially).

---

## 7. Migration Plan (Technical)

1.  **Database:** Run migration scripts to introduce `instalacao_id` and create default installations for legacy users.
2.  **Legacy App:** Continues running.
3.  **New App (MVP):** Builds side-by-side.
    *   Implement Auth & User Profile logic first.
    *   Implement Read-Only views for Trees.
    *   Implement CRUD for Trees (Inventory).
4.  **Cutover:** Users encouraged to switch to new app; legacy deprecated but accessible for read-only historical data if needed.
