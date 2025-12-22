# Epics & Stories - Arboria 3.0 Core Experience

This document defines the implementation-ready stories for the platform-wide UX and technical hardening of Arboria 3.0.

---

## Epic 1: Context-Adaptive Core Shell 🎨
**Goal:** Implement the "Dual Density" architecture to provide a native-feeling experience on both Mobile (field) and Desktop (office) using a single codebase.

### Story 1.1: Adaptive Density Tokens (Mobile/Desktop)
**As a** Developer,  
**I want** to use CSS Variables to control UI density based on the device,  
**So that** the app is instantly responsive without JavaScript re-renders.

**Acceptance Criteria:**
- [ ] Root level `:root[data-density='field|office']` variables implemented in `index.css`.
- [ ] Logic to detect device (Capacitor vs Web/Tauri) and set `data-density` attribute on `<html>`.
- [ ] Standardized spacing (`--spacing-unit`) and touch targets (`--touch-target`) applied to core components (Button, Input, Select).
- [ ] Mobile shows 56px touch targets; Desktop shows 44px.

### Story 1.2: The Infinite Blade (Desktop Context)
**As a** Planejador/Gestor,  
**I want** tree details to open in a side panel (Blade) that syncs with the URL,  
**So that** I can navigate the map and view multiple trees without losing context.

**Acceptance Criteria:**
- [ ] `Blade` component implemented using Radix UI `Sheet` (persistent mode).
- [ ] URL synchronized with `tree_id` parameter (e.g., `/map?tree=UUID`).
- [ ] Blade contains tabs for `Status | History | Trends`.
- [ ] Deep-linking to specific trees works on page refresh.

---

## Epic 2: Field Resilience & Offline Verification 🛡️
**Goal:** Ensure 100% confidence during high-speed field inventory, even without connectivity.

### Story 2.1: Robust Inventory "Burst" Loop
**As a** Inventariador,  
**I want** a "Point-and-Verify" flow that forces a photo match before editing,  
**So that** I don't accidentally update the wrong tree due to GPS drift.

**Acceptance Criteria:**
- [ ] Tapping a tree pin opens a **Full-Screen Photo Verifier**.
- [ ] User must explicitly click "Confirm Match" to open the edit form.
- [ ] "Burst Mode" form uses 24px vertical spacing for high-friction environments.
- [ ] Form includes `ImpactNumericInput` with large [-][+] buttons for DAP/Height.

### Story 2.2: Intelligent Offline Photo Cache
**As a** Field Worker,  
**I want** tree thumbnails to be available instantly even when I'm offline,  
**So that** I can verify trees without waiting for network fetches.

**Acceptance Criteria:**
- [ ] Service Worker intercepts image requests to Supabase Storage.
- [ ] Thumbnails are transcoded to WebP and stored in **IndexedDB**.
- [ ] System automatically evicts old thumbnails (LRU Policy) to save space.
- [ ] Switch of `instalacao_id` triggers a cache wipe of irrelevant images.

---

## Epic 3: Collaborative Awareness (Presence) 👥
**Goal:** Prevent data conflicts and improve coordination by showing who is active on the same assets.

### Story 3.1: Live Occupation Badges
**As a** Multi-user team,  
**I want** to see if another user is currently editing or viewing the same tree,  
**So that** we don't overwrite each other's work.

**Acceptance Criteria:**
- [ ] Supabase Realtime Presence channel joined on active installation.
- [ ] "Live Occupation" badge appears in the Blade/Drawer when `tree_id` matches another user's state.
- [ ] Badge displays `user_name` and `action` (Visualizando... | Editando...).
- [ ] Presence state updates automatically on component mount/unmount.
