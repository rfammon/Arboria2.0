---
steps Completed: [1, 2, 3]
inputDocuments:
  - 'docs/prd.md'
  - 'docs/architecture.md'
  - '.gemini/antigravity/brain/995842a2-9ca9-4f03-8b2d-01470a76dff7/migration-roadmap.md'
---

# Arboria v3 - Epic Breakdown (Migration Completion)

## Overview

This document provides the complete epic and story breakdown for completing the Arboria v3 migration, decomposing the remaining features from the Legacy → v3 Migration Roadmap into implementable stories organized by priority phases.

**Migration Context**: ~60% of legacy features already migrated. This epic breakdown focuses on the remaining 40% of critical functionality to achieve feature parity with the legacy system.

## Requirements Inventory

### Functional Requirements (Features to Migrate)

**Phase 1 - Critical Features (Must-Have for MVP):**

**FR1: Photo Management System**
- FR1.1: Photo capture from camera with compression (4h)
- FR1.2: Photo preview and management in TreeForm (1h)
- FR1.3: Supabase Storage integration with RLS policies (6h)
- FR1.4: Photo display in TreeDetails and Map popup (2h)
- FR1.5: Image optimization utilities (2h)

**FR2: Map Zoom-to-Tree**
- FR2.1: Implement zoom to specific tree from TreeDetails (2h)
- FR2.2: Smooth animation and marker highlight (included)

**FR3: Complete Offline Sync Queue**
- FR3.1: Persist failed operations with retry logic (4h)
- FR3.2: Sync status UI with pending operations indicator (included)

**Phase 2 - Important Features (Should-Have):**

**FR4: DAP Estimator (Computer Vision)**
- FR4.1: Camera feed with real-time preview (3h)
- FR4.2: Circle overlay for diameter measurement (2h)
- FR4.3: Diameter calculation algorithm (2h)

**FR5: Import/Export System**
- FR5.1: Export trees and plans to ZIP file (4h)
- FR5.2: Import ZIP with validation and conflict resolution (4h)
- FR5.3: Email report generation (optional, 6h)

**FR6: Conflict Resolution UI**
- FR6.1: Detect sync conflicts automatically (4h)
- FR6.2: Visual conflict resolution modal with merge strategies (4h)
- FR6.3: Last-write-wins and manual merge options (3h)

**Phase 3 - Enhanced Features (Nice-to-Have):**

**FR7: PDF Report Generation**
- FR7.1: Research and integrate PDF library (jsPDF/react-pdf) (4h)
- FR7.2: Report template with tree data and statistics (4h)
- FR7.3: Map screenshot integration with html2canvas (2h)

**FR8: User Location Tracking on Map**
- FR8.1: GPS location button with real-time tracking (2h)
- FR8.2: User location marker on map (1h)
- FR8.3: Accuracy circle visualization (1h)

**FR9: Realtime Features**
- FR9.1: Supabase Realtime subscriptions for live data (4h)
- FR9.2: Notification service for updates (2h)

**FR10: Admin Panel Enhancements**
- FR10.1: User invite system (3h)
- FR10.2: Activity history viewer (3h)
- FR10.3: Notification badge UI (2h)

**Phase 4 - Polish & Future:**

**FR11: Educational Flashcards**
- FR11.1: Flashcard carousel component (3h)
- FR11.2: TRAQ criteria flashcards service (2h)

**FR12: Advanced Features**
- FR12.1: Code splitting for performance (3h)
- FR12.2: Lazy loading optimization (2h)
- FR12.3: Bundle size reduction (3h)

### Non-Functional Requirements

**NFR1: Performance and Optimization**
- NFR1.1: Photo upload should complete in <5 seconds on 4G
- NFR1.2: Bundle size should remain under 1MB (critical path)
- NFR1.3: Time to interactive (TTI) < 3 seconds on mobile
- NFR1.4: Lazy load components to improve initial load

**NFR2: Offline Capability**
- NFR2.1: All photo operations must work offline with sync
- NFR2.2: Conflict resolution UI must handle offline scenarios
- NFR2.3: Service worker must cache photos for offline viewing

**NFR3: Security and Data Integrity**
- NFR3.1: Supabase Storage RLS policies for photo isolation
- NFR3.2: Photo upload validation (file type, size, malware scan)
- NFR3.3: Secure URL generation with expiration for photos
- NFR3.4: Audit logging for photo operations

**NFR4: User Experience**
- NFR4.1: Photo capture UX optimized for field use (large buttons, touch-friendly)
- NFR4.2: Visual feedback for all async operations (uploads, syncs)
- NFR4.3: Error messages must be user-friendly and actionable
- NFR4.4: Dark mode support for all new components

**NFR5: Code Quality and Maintainability**
- NFR5.1: TypeScript strict mode for all new code
- NFR5.2: Unit tests for critical utilities (photo optimization, conflict resolution)
- NFR5.3: Component documentation with Storybook (optional)
- NFR5.4: Clean up 12 existing TypeScript warnings

### Additional Requirements from Architecture

**From Architecture Document:**
- Supabase Storage bucket structure: `{instalacao_id}/trees/{tree_id}/photos/`
- Photo metadata stored in database (filename, size, upload_date, uploaded_by)
- RLS policies inherited from parent instalacao_id
- CDN caching strategy for frequently accessed photos

**From Migration Roadmap:**
- Zero data loss during migration (100% preservation)
- Backward compatibility maintained throughout phases
- Feature flags for gradual rollout
- Rollback capability for each phase

**Technical Constraints:**
- Must work on mobile (iOS Safari, Android Chrome)
- Must support offline-first architecture
- Must integrate with existing React Query cache
- Must follow existing component patterns (shadcn/ui)

### FR Coverage Map

- **FR1.1-1.5 (Photo Management)** → Epic 1: Rich Tree Documentation with Photos
- **FR2.1-2.2 (Zoom-to-Tree)** → Epic 2: Enhanced Map Navigation & Discovery  
- **FR3.1-3.2 (Sync Queue)** → Epic 3: Reliable Offline Operations
- **FR4.1-4.3 (DAP Estimator)** → Epic 4: Advanced Field Measurements
- **FR5.1-5.3 (Import/Export)** → Epic 5: Data Portability & Reporting
- **FR6.1-6.3 (Conflict Resolution)** → Epic 3: Reliable Offline Operations
- **FR7.1-7.3 (PDF Generation)** → Epic 5: Data Portability & Reporting
- **FR8.1-8.3 (Location Tracking)** → Epic 2: Enhanced Map Navigation & Discovery
- **FR9.1-9.2 (Realtime)** → Epic 6: Collaborative Platform Enhancements
- **FR10.1-10.3 (Admin Panel)** → Epic 6: Collaborative Platform Enhancements
- **FR11.1-11.2 (Flashcards)** → Epic 7: Education & Performance Optimization
- **FR12.1-12.3 (Performance)** → Epic 7: Education & Performance Optimization

**Coverage Status**: ✅ 100% - All 12 FRs mapped to epics

## Epic List

### Epic 1: Rich Tree Documentation with Photos ✅
Inventariadores criam **evidência visual verificável** do inventário arbóreo que funciona 100% offline e sincroniza automaticamente, com storage otimizado (2MB max/foto) e RLS garantindo isolamento por instalação. Cada foto inclui metadata (GPS, timestamp, uploaded_by) para rastreabilidade legal e auditoria.

**FRs covered**: FR1.1, FR1.2, FR1.3, FR1.4, FR1.5  
**Effort**: ~15 hours  
**Priority**: 🔴 Critical (Phase 1)

**Value Delivered**:
- Photo capture from camera with compression (max 2MB)
- Photo preview and management in forms
- Supabase Storage with RLS security
- Photo display in details and map popups
- Image optimization for mobile/offline use
- **NEW**: Photo metadata table for audit trail (GPS, timestamp, user)

**First Principles Insight**: Foto não é cosmética - é evidência primária para compliance e auditoria legal.

---

### Epic 2: Enhanced Map Navigation (Zoom Focus) ✅
Todos os usuários podem encontrar árvores específicas rapidamente através de zoom automático com animação suave e destaque visual do marcador, minimizando tempo de busca no campo.

**FRs covered**: FR2.1, FR2.2 (GPS tracking moved to Epic 8)
**Effort**: ~2 hours  
**Priority**: 🔴 Critical (Phase 1)
**Status**: Completed

**Value Delivered**:
- Zoom to specific tree from details page with smooth animation
- Marker highlight and camera focus
- **REMOVED from Phase 1**: GPS location tracking (moved to Epic 8)

**First Principles Insight**: Zoom é navigation assist mínimo - não construir sistema de navegação completo. Valor é "encontrar rapidamente", não "substituir Google Maps". GPS tracking drena bateria e não é essencial para zoom.

---

### Epic 3: Reliable Offline Operations & Conflict Resolution ⚠️ EXPANDED
Usuários trabalham no campo sem conectividade com **zero perda de dados** garantida através de queue persistente com retry automático e UI visual one-click para resolução de conflitos (meu / deles / mesclado) quando necessário.

**FRs covered**: FR3.1, FR3.2, FR6.1, FR6.2, FR6.3  
**Effort**: ~19 hours (4h sync + 15h conflicts)
**Priority**: 🔴 Critical (Phase 1) - **MOVED FROM PHASE 2**
**Status**: Completed

**Value Delivered**:
- Persistent sync queue with automatic retry logic
- Visual sync status indicator with pending operations
- Automatic conflict detection on sync
- Interactive conflict resolution UI with visual diff
- Multiple merge strategies: mine, theirs, merged (one-click)

**First Principles Insight**: Conflito não é exceção, é **inevitabilidade** em sistema colaborativo offline-first. Resolução visual é **requisito de segurança de dados**, não enhancement. Movido para Phase 1 (Critical).

---

### Epic 4: Quick Field Estimates (DAP Estimator) ⚠️ REFINED + REBRANDED
Inventariadores obtêm **estimativas rápidas de DAP** para situações onde fita métrica não está disponível, usando câmera com overlay geométrico. Feature posicionada como "quick field estimate tool" (não precision measurement) com indicadores claros de margem de erro (±2cm) e marcação de medições como "estimada" vs "medida" para total transparência.

**FRs covered**: FR4.1, FR4.2, FR4.3  
**Effort**: ~11 hours (7h original + 4h risk mitigation)
**Priority**: 🟡 Important (Phase 2)

**Value Delivered**:
- Real-time camera feed with AR circle overlay
- Interactive circle sizing for diameter measurement
- Automatic diameter calculation with **prominent ±2cm error margin display**
- **NEW**: Measurement tagging as "estimated" vs "measured"
- **NEW**: Visual badge differentiation (orange for estimates, green for measured)
- **NEW**: Validation against species norms (alerts if >2σ from average)

**First Principles Insight**: Computer Vision não é 100% precisa - não substitui fita métrica, **complementa** em ~60% dos casos. Honestidade sobre limitações = confiança profissional. Marketing realista, não hype.

**Cross-Functional War Room Decision**:
```
Desirability: ⭐⭐⭐☆☆ (Nice-to-have IF expectations managed)
Feasibility: ⭐⭐⭐⭐☆ (Technically viable with disclaimers)
Viability: ⭐⭐☆☆☆ (Brand risk if oversold)

CRITICAL REBRAND: "Quick Field Estimates" not "DAP Measurement Tool"
- Marketing message: "Estimate when tape unavailable" not "Eliminate tape measure"
- Prominent disclaimer + error margin display = trust preservation
- Innovation feature showcasing tech, not reliability feature for critical decisions
```

---

### Epic 5: Data Backup & Portability (Export/Import) ⚠️ SPLIT
Gestores garantem **continuidade de negócio** através de backups completos com export/import round-trip validado, permitindo migração de dados e disaster recovery.

**FRs covered**: FR5.1, FR5.2 (FR5.3 Email moved to Epic 7, FR7 PDF moved to Epic 7)
**Effort**: ~8 hours (export/import only)
**Priority**: 🟡 Important (Phase 2)

**Value Delivered**:
- ZIP export of trees, plans, and photos
- ZIP import with validation and error reporting
- Round-trip verification (export → import → verify integrity)
- **REMOVED from this epic**: PDF reports (moved to Epic 7)
- **REMOVED from this epic**: Email distribution (moved to Epic 7)

**First Principles Insight**: Export sem import = one-way door, não portabilidade. Backup tem prioridade sobre apresentação. Epic focado em **business continuity** (Phase 2), não stakeholder communication (Phase 3).

---

### Epic 6: Team Coordination Essentials 🆕 PROMOTED
Gestores mantêm equipes sincronizadas através de notificações em tempo real de ações críticas (nova árvore, plano aprovado, conflito detectado) e rastreiam atividade para auditoria e gestão de equipe.

**FRs covered**: FR9.1, FR9.2, FR10.2, FR10.3  
**Effort**: ~12 hours  
**Priority**: 🟡 Important (Phase 2) - **MOVED FROM PHASE 3**
**Status**: Completed

**Value Delivered**:
- Supabase Realtime subscriptions for live updates
- In-app notification system (push when online)
- Notification categories: new tree, plan status, conflicts, invites
- Activity history viewer for audit trail
- Visual notification badges (unread count)
- **REMOVED from this epic**: User invites (basic, already exists)

**First Principles Insight**: Sistema multi-tenant sem notificações = **comunicação quebrada**. Real-time não é "collaboration enhancement", é **communication foundation**. Promovido para Phase 2.

---

### Epic 7: Professional Reporting & Presentation 🆕 CREATED
Gestores comunicam valor do inventário arbóreo para stakeholders corporativos através de relatórios PDF profissionais com mapas interativos, estatísticas consolidadas, e opção de distribuição por email.

**FRs covered**: FR7.1, FR7.2, FR7.3, FR5.3 (email from Epic 5)
**Effort**: ~10 hours  
**Priority**: 🟢 Enhanced (Phase 3)

**Value Delivered**:
- PDF report generation with jsPDF/react-pdf
- Professional template with branding
- Map screenshots with html2canvas
- Tree statistics and risk distribution charts
- Email report distribution (optional)


**FRs covered**: FR11.1, FR11.2, FR12.1, FR12.2, FR12.3  
**Effort**: ~13 hours  
**Priority**: 🟢 Polish (Phase 4)

**Value Delivered**:
- TRAQ criteria flashcard carousel for education
- Interactive learning module with progress tracking
- Code splitting for faster initial loads
- Lazy loading of heavy components (map, sensors)
- Bundle size optimization target: -50% from current

**First Principles Insight**: Educação não é "extra", é **onboarding** de novos inventariadores. Performance não é polish, é **retenção** (app lento = abandono). Ambos essenciais para platform maturity.

---

## Architecture Decision Records (ADRs)

This section documents key architectural decisions made during epic planning and the trade-offs considered.

### ADR-001: Photo Storage Strategy (Epic 1)
**Decision**: Hybrid Supabase Storage + IndexedDB

**Context**: Field work requires offline photo capability but also multi-device sync and RLS security.

**Alternatives Considered**:
- Pure Supabase Storage: Simple but no offline
- Pure IndexedDB: Offline but no sync or server-side security  
- **Hybrid (chosen)**: Best of both worlds

**Consequences**:
- ✅ Full offline support with eventual consistency
- ✅ Server-side RLS enforced on sync
- ✅ Multi-device automatic sync
- ⚠️ Medium complexity (cache invalidation, sync logic)
- ✅ Storage: effectively unlimited (Supabase) vs 50MB-1GB (IndexedDB alone)

**Implementation Pattern**:
```
Camera → IndexedDB (immediate) → Supabase Storage (when online)
Display ← IndexedDB cache ← Supabase (background fetch)
```

---

### ADR-002: Photo Compression Approach (Epic 1)
**Decision**: Client-side compression to 2MB max, preserve EXIF

**Context**: 4G field uploads are slow (avg 1Mbps). 8MB raw photo = 64s upload time.

**Alternatives**:
- No compression: Simple but expensive storage + slow uploads
- Server-side: No client battery cost but slower UX
- **Client-side (chosen)**: Fast UX, lower storage cost

**Consequences**:
- ✅ 80% storage cost reduction
- ✅ 75% faster uploads (16s vs 64s for typical photo)
- ✅ EXIF preserved for GPS/timestamp metadata
- ⚠️ Client battery drain during compression (~2-3% per photo)
- ✅ One-time cost at capture, not repeated

**Library**: browser-image-compression (quality=0.8, maxWidthOrHeight=1920)

---

### ADR-003: Epic Separation - Zoom vs GPS Tracking (Epics 2 & 8)
**Decision**: Essential zoom (Epic 2, Phase 1) separate from optional GPS tracking (Epic 8, Phase 3)

**Context**: First Principles revealed zoom solves "find tree" without GPS battery drain.

**Alternatives**:
- Bundle everything: Simpler delivery but bloated MVP
- **Separate (chosen)**: Lean MVP, optional enhancement later

**Consequences**:
- ✅ MVP ships faster (2h vs 6h implementation)
- ✅ No battery drain testing needed for Phase 1
- ✅ GPS tracking becomes opt-in feature
- ⚠️ Two separate implementations vs one
- ✅ Users who don't need GPS aren't forced to use battery

**Rationale**: Zoom to marker = 90% of value. GPS tracking = minority use case with battery complexity.

---

### ADR-004: Sync Architecture - React Query + Custom Conflicts (Epic 3)
**Decision**: React Query for mutations, custom layer for conflict resolution

**Context**: React Query excellent for online sync but limited offline conflict handling.

**Alternatives**:
- Pure React Query: Elegant but inadequate for offline conflicts
- Custom sync queue (legacy approach): Full control but reinventing wheel
- **Hybrid (chosen)**: Leverage RQ for 80%, custom for complex 20%

**Consequences**:
- ✅ React Query handles automatic retries, optimistic updates
- ✅ Custom conflict layer handles edge cases (simultaneous edits)
- ✅ Lower maintenance than full custom solution
- ⚠️ Medium complexity at integration boundary
- ✅ Extensible: can add sophisticated conflict strategies later

**Implementation**:
```typescript
// React Query for standard mutations
const { mutate } = useMutation(updateTree)

// Custom conflict detector wraps RQ
if (detectConflict(localVersion, serverVersion)) {
  showConflictModal({ mine, theirs, onResolve })
}
```

---

### ADR-005: Conflict Resolution UX (Epic 3)
**Decision**: One-click resolution (mine/theirs/merged) with visual diff preview

**Context**: Field users are not developers. Complex merge UIs add friction.

**Alternatives**:
- Automatic last-write-wins: Simple but loses data silently
- Field-by-field merge UI: Power-user feature, too complex
- **One-click with preview (chosen)**: Balance of simplicity and control

**Consequences**:
- ✅ 95% of conflicts resolved in <5 seconds
- ✅ Visual diff shows what changed
- ✅ "Merged" option allows manual tweaking for complex cases
- ⚠️ Some rare conflicts might need field-level resolution
- ✅ Mobile-friendly (large touch targets)

**Rationale**: Tree inventory conflicts are typically "my offline changes vs their online changes" - not complex schema merges.

---

### ADR-006: DAP Estimator - Geometric vs ML (Epic 4)
**Decision**: Geometric circle sizing, NO machine learning

**Context**: Computer vision accuracy requires large ML models or cloud APIs.

**Alternatives**:
- TensorFlow.js: Accurate but +20MB bundle size
- Cloud Vision API: Accurate but requires connectivity + cost per call
- **Geometric (chosen)**: Lightweight, offline, good enough

**Consequences**:
- ✅ Zero network dependency (100% offline)
- ✅ <1MB overhead vs 20MB (TensorFlow)
- ✅ Battery-friendly (no ML inference)
- ⚠️ ±2cm accuracy vs ±0.5cm with ML
- ✅ Transparent error margin shown to users

**Rationale**: 60% accuracy offline > 95% accuracy online-only. Field context makes "online" unreliable.

**Implementation**:
```typescript
// User positions circle overlay on tree trunk
// diameter_cm = (circle_pixels / reference_pixels) * reference_cm
// Reference = user's hand width (calibrated once in profile)
```

---

### ADR-007: Export/Import vs PDF Split (Epics 5 & 7)
**Decision**: Data backup (Phase 2) separate from presentation (Phase 3)

**Context**: Business continuity more critical than stakeholder reporting.

**Alternatives**:
- Bundle as one epic: Simpler planning but mixed priorities
- **Separate (chosen)**: Backup before polish

**Consequences**:
- ✅ Critical backup capability ships in Phase 2
- ✅ Can pause after Phase 2 with data portability guaranteed
- ✅ PDF research/integration doesn't block backup feature
- ⚠️ Two epic planning cycles vs one
- ✅ Clear prioritization: operations before communication

---

### ADR-008: PDF Library Selection (Epic 7)
**Decision**: react-pdf for generation

**Context**: Need professional reports with complex layouts (maps, charts, tables).

**Alternatives**:
- jsPDF: Simple API but limited styling control
- pdfmake: Powerful but verbose JSON configuration
- **react-pdf (chosen)**: JSX-like components for templates

**Consequences**:
- ✅ Component-based = reusable report templates
- ✅ Easier to maintain than config objects
- ✅ Familiar React patterns for team
- ⚠️ Larger bundle than jsPDF (+~150KB)
- ✅ Scales better as report requirements evolve

---

### ADR-009: Realtime Strategy - WebSocket + Polling (Epic 6)
**Decision**: Supabase Realtime (WebSocket) with 60s polling fallback

**Context**: Mobile networks drop WebSocket connections frequently.

**Alternatives**:
- Polling only: Works everywhere but inefficient
- WebSocket only: Real-time but fragile on mobile
- **WebSocket + fallback (chosen)**: Best reliability/UX balance

**Consequences**:
- ✅ Instant notifications when WebSocket connected
- ✅ Graceful degradation to 60s polling on connection issues
- ✅ Lower bandwidth than constant polling
- ⚠️ Dual implementation complexity
- ✅ 30-60s delay acceptable for notifications (not mission-critical)

**Implementation**:
```typescript
// Primary: Supabase Realtime
supabase.channel(`instalacao_${id}`)
  .on('INSERT', handleNotification)
  .subscribe()

// Fallback: Poll on channel error
onChannelError(() => {
  setInterval(fetchNotifications, 60000)
})
```

---

## Pre-mortem Analysis: Risk Mitigation Stories

This section documents failure scenarios identified through pre-mortem analysis and the additional stories required to prevent them.

### Epic 1: Photo Management - Identified Risks

**Risk PM-01: IndexedDB Quota Exceeded**
- **Scenario**: Users hit 50MB limit, app crashes silently
- **Mitigation Story**: "As a system, I monitor IndexedDB quota usage and warn users at 80% capacity with cleanup suggestions"
- **Priority**: 🔴 Critical
- **Effort**: +2h

**Risk PM-02: Orphaned Photos**
- **Scenario**: Deleted trees leave photos in storage, causing bloat
- **Mitigation Story**: "As a system, I automatically cascade-delete photos from Supabase Storage and IndexedDB when trees are deleted"
- **Priority**: 🔴 Critical  
- **Effort**: +3h

**Risk PM-03: EXIF Data Loss**
- **Scenario**: Compression strips GPS metadata, audit trail broken
- **Mitigation Story**: "As a system, I explicitly preserve EXIF data (GPS, timestamp) during compression and validate after processing"
- **Priority**: 🔴 Critical
- **Effort**: +1h (config)

**Total Epic 1 Risk Mitigation**: +6h (21h total)

---

### Epic 2: Map Zoom - Identified Risks

**Risk MZ-01: User Can't Find Target Tree**
- **Scenario**: Zoom completes but user doesn't know which marker is the target
- **Mitigation Story**: "As a user, I see a 2-second pulsing highlight animation on the target tree marker after zoom completes"
- **Priority**: 🟡 Medium
- **Effort**: +1h

**Risk MZ-02: Coordinate Conversion Bug**
- **Scenario**: UTM ↔ Lat/Lon conversion places tree in wrong location
- **Mitigation Story**: "As a system, I have integration tests validating coordinate conversion accuracy for all supported UTM zones"
- **Priority**: 🔴 Critical
- **Effort**: +2h (tests)

**Total Epic 2 Risk Mitigation**: +3h (5h total)

---

### Epic 3: Offline Sync & Conflicts - Identified Risks

**Risk OS-01: Queue Overflow**
- **Scenario**: 100+ pending operations exceed localStorage, data loss
- **Mitigation Story**: "As a system, I limit sync queue to 100 operations and warn users at 50, preventing new edits until sync completes"
- **Priority**: 🔴 Critical
- **Effort**: +2h

**Risk OS-02: Blind Conflict Resolution**
- **Scenario**: Users click wrong resolution button, lose data without understanding
- **Mitigation Story**: "As a user, I see a visual before/after diff preview of conflict changes BEFORE choosing resolution strategy, with 30s undo window"
- **Priority**: 🔴 Critical
- **Effort**: +4h

**Risk OS-03: No Offline Awareness**
- **Scenario**: Users don't know they're offline, expect instant sync
- **Mitigation Story**: "As a user, I see a persistent banner when offline showing 'X pending changes' with visual sync status"
- **Priority**: 🟡 Medium
- **Effort**: +1h

**Total Epic 3 Risk Mitigation**: +7h (26h total)

---

### Epic 4: DAP Estimator - Identified Risks

**Risk DAP-01: Uncalibrated Estimates**
- **Scenario**: Users skip calibration, estimates wildly inaccurate
- **Mitigation Story**: "As a system, I FORCE hand width calibration on first DAP estimator use and block feature until completed"
- **Priority**: 🔴 Critical
- **Effort**: +1h

**Risk DAP-02: Unrealistic Measurements**
- **Scenario**: User estimates 200cm DAP (impossible), no validation
- **Mitigation Story**: "As a system, I validate DAP estimates against species norms and alert users to measurements >2σ from average"
- **Priority**: 🟡 Medium
- **Effort**: +3h (species database + validation)

**Total Epic 4 Risk Mitigation**: +4h (11h total)

---

### Epic 5: Export/Import - Identified Risks

**Risk EI-01: Import Failure No Rollback**
- **Scenario**: Import partially succeeds, leaves database in inconsistent state
- **Mitigation Story**: "As a system, I implement transactional all-or-nothing import with automatic rollback on any failure"
- **Priority**: 🔴 Critical
- **Effort**: +3h

**Risk EI-02: No Import Preview**
- **Scenario**: Users import without knowing what will change, surprises occur
- **Mitigation Story**: "As a user, I see a detailed preview before confirming import: X trees, Y photos, with warnings for schema mismatches"
- **Priority**: 🔴 Critical
- **Effort**: +2h

**Total Epic 5 Risk Mitigation**: +5h (13h total)

---

### Epic 6: Team Coordination - Identified Risks

**Risk TC-01: Notification Spam**
- **Scenario**: Every edit = notification, users disable and miss critical updates
- **Mitigation Story**: "As a user, I can configure notification preferences (real-time / daily digest / critical only) and system batches similar events within 5min"
- **Priority**: 🟡 Medium
- **Effort**: +3h

**Risk TC-02: WebSocket Reconnect Storm**
- **Scenario**: Mobile network switching causes 100 reconnects/hour, battery drain
- **Mitigation Story**: "As a system, I implement exponential backoff for WebSocket reconnects (max 1 attempt/minute) with graceful fallback to polling"
- **Priority**: 🟡 Medium
- **Effort**: +2h

**Total Epic 6 Risk Mitigation**: +5h (17h total)

---

### Epic 7: PDF Reports - Identified Risks

**Risk PDF-01: Memory Overflow on Mobile**
- **Scenario**: 1000 trees + map = 200MB PDF, mobile out-of-memory crash
- **Mitigation Story**: "As a system, I warn users when dataset >500 trees and implement automatic pagination (100 trees/page) for large reports"
- **Priority**: 🟡 Medium
- **Effort**: +2h

**Risk PDF-02: Blank Map Screenshot**
- **Scenario**: html2canvas timing issue, map not loaded when captured
- **Mitigation Story**: "As a system, I wait for map 'load' event before screenshot with 5s timeout and retry mechanism"
- **Priority**: 🟡 Medium
- **Effort**: +1h

**Total Epic 7 Risk Mitigation**: +3h (13h total)

---

### Epic 8: GPS Tracking - Identified Risks

**Risk GPS-01: Battery Drain**
- **Scenario**: Tracking enabled by default or forgotten, drains battery excessively
- **Mitigation Story**: "As a system, I auto-disable GPS tracking after 5 minutes of inactivity and show battery impact indicator when active"
- **Priority**: 🔴 Critical
- **Effort**: +1h

**Total Epic 8 Risk Mitigation**: +1h (5h total)

---

### Epic 9: Performance - Identified Risks

**Risk PERF-01: No Production Monitoring**
- **Scenario**: App slow in production, team doesn't know what's causing it
- **Mitigation Story**: "As a system, I track Core Web Vitals (TTI, FCP, LCP) in production and alert when >5% of users exceed thresholds"
- **Priority**: 🟡 Medium
- **Effort**: +2h (analytics setup)

**Total Epic 9 Risk Mitigation**: +2h (15h total)

---

### Pre-mortem Risk Summary

| Epic | Original Effort | Risk Mitigation | Total with Risks | Δ |
|------|----------------|-----------------|------------------|---|
| 1 - Photos | 15h | +6h | 21h | +40% |
| 2 - Map Zoom | 2h | +3h | 5h | +150% |
| 3 - Offline/Conflicts | 19h | +7h | 26h | +37% |
| 4 - DAP Estimator | 7h | +4h | 11h | +57% |
| 5 - Export/Import | 8h | +5h | 13h | +63% |
| 6 - Team Coord | 12h | +5h | 17h | +42% |
| 7 - PDF Reports | 10h | +3h | 13h | +30% |
| 8 - GPS Tracking | 4h | +1h | 5h | +25% |
| 9 - Performance | 13h | +2h | 15h | +15% |
| **TOTAL** | **90h** | **+36h** | **126h** | **+40%** |

**Key Insight**: Pre-mortem analysis reveals ~40% additional effort needed for production-ready implementation. Most risk mitigation is in critical epics (1, 2, 3) - validates prioritization.

---

## ADR Summary Table

| Epic | ADR | Decision | Key Trade-off | Why It Matters |
|------|-----|----------|---------------|----------------|
| 1 | 001 | Hybrid Storage | Complexity vs Offline | Field = offline required |
| 1 | 002 | Client Compression | Battery vs UX | Slow 4G makes server prohibitive |
| 2/8 | 003 | Separate Zoom/GPS | Scope vs Battery | Zoom sufficient for MVP |
| 3 | 004 | RQ + Custom Conflicts | Elegance vs Control | 80/20 rule applies |
| 3 | 005 | One-click Conflict UI | Power vs Simplicity | Field users not developers |
| 4 | 006 | Geometric DAP | Accuracy vs Bundle/Offline | 60% offline > 95% online-only |
| 5/7 | 007 | Split Export/PDF | One epic vs Priority | Backup before presentation |
| 7 | 008 | react-pdf | Bundle vs Maintainability | Reports will evolve |
| 6 | 009 | WebSocket + Polling | Real-time vs Reliability | Mobile networks unreliable |

---

## Epic Stories Breakdown

This section contains the detailed user stories for each epic with specific acceptance criteria using Given/When/Then format.

---

## Epic 1: Rich Tree Documentation with Photos

### Story 1.1: Camera Photo Capture with Compression

As an **Inventariador**,  
I want to capture photos directly from my device camera with automatic compression,  
So that I can document trees visually without worrying about storage space or slow uploads.

**Acceptance Criteria:**

**Given** I am viewing a tree registration or edit form  
**When** I click the "Add Photo" button  
**Then** the device camera opens with capture interface  
**And** after capturing, the photo is automatically compressed to max 2MB  
**And** EXIF data (GPS, timestamp) is preserved during compression  
**And** I see a preview of the compressed photo before confirming

**Given** I am in an area with poor lighting  
**When** I capture a photo  
**Then** the system warns me if image quality is too low (exposure check)  
**And** I can choose to retake or proceed anyway

---

### Story 1.2: Photo Preview and Management in TreeForm

As an **Inventariador**,  
I want to preview and manage photos attached to a tree,  
So that I can ensure correct documentation before saving.

**Acceptance Criteria:**

**Given** I have captured or selected photos for a tree  
**When** I view the tree form  
**Then** I see thumbnail previews of all attached photos  
**And** I can remove individual photos before saving  
**And** I can reorder photos by drag-and-drop  
**And** each photo shows sync status (synced ✓ or pending ⚠️)

**Given** I am offline  
**When** I attach photos to a tree  
**Then** photos are stored in IndexedDB immediately  
**And** sync status shows as "pending" with orange indicator

---

### Story 1.3: Supabase Storage Integration with RLS

As a **Sistema**,  
I want to upload photos to Supabase Storage with proper RLS policies,  
So that photos are secure, isolated by installation, and accessible across devices.

**Acceptance Criteria:**

**Given** a user uploads a photo online  
**When** the photo is saved  
**Then** it is uploaded to Supabase Storage bucket: `{instalacao_id}/trees/{tree_id}/photos/{filename}`  
**And** RLS policy verifies user has access to the installation  
**And** photo metadata is saved to `tree_photos` table (filename, size, uploaded_by, upload_date, gps_coords)  
**And** IndexedDB is updated with the Storage URL

**Given** a user from Installation A tries to access Installation B's photos  
**When** they attempt to retrieve the photo URL  
**Then** Supabase RLS returns 403 Forbidden  
**And** error is logged for security audit

---

### Story 1.4: Photo Display in TreeDetails and Map Popup

As an **Inventariador** or **Planejador**,  
I want to view tree photos in details pages and map popups,  
So that I can visually verify tree conditions when reviewing inventory.

**Acceptance Criteria:**

**Given** I am viewing a tree's detail page  
**When** the tree has associated photos  
**Then** I see a photo gallery carousel showing all photos  
**And** I can navigate between photos with prev/next arrows  
**And** I can click a photo to view full-screen with pinch-to-zoom  
**And** each photo shows capture date and uploader name

**Given** I click a tree marker on the map  
**When** the popup opens  
**Then** I see the first photo as a thumbnail (if photos exist)  
**And** clicking the thumbnail opens the full tree details page

---

### Story 1.5: IndexedDB Quota Monitoring and Cleanup

As a **Sistema**,  
I want to monitor IndexedDB quota usage and clean up orphaned photos,  
So that users don't hit storage limits and deleted trees don't leave photo bloat.

**Acceptance Criteria:**

**Given** IndexedDB usage reaches 80% of quota (typically 40MB of 50MB)  
**When** the user opens the app  
**Then** a warning banner appears: "Storage almost full. Clean up synced photos?"  
**And** user can click to remove synced photos from local cache (keeping only pending ones)

**Given** a tree with photos is deleted  
**When** the deletion is confirmed  
**Then** all associated photos are deleted from Supabase Storage  
**And** all photos are removed from IndexedDB  
**And** entries are removed from `tree_photos` table  
**And** deletion is logged for audit trail

---

### Story 1.6: Photo Metadata Audit Trail

As a **Gestor**,  
I want complete audit trail for all photos uploaded,  
So that I can prove compliance and track accountability for tree documentation.

**Acceptance Criteria:**

**Given** a photo is uploaded to a tree  
**When** the upload completes successfully  
**Then** `tree_photos` table record includes: tree_id, filename, file_size, uploaded_by (user_id), upload_date, gps_latitude, gps_longitude, camera_model (from EXIF)  
**And** audit log records photo creation event

**Given** I am viewing a photo in tree details  
**When** I click "Photo Info"  
**Then** I see metadata: uploaded by {name}, on {date}, at {GPS coords}, file size {MB}

---

## Epic 2: Enhanced Map Navigation (Zoom Focus)

### Story 2.1: Zoom to Specific Tree from Details

As an **Inventariador**,  
I want to zoom the map to a specific tree when viewing its details,  
So that I can quickly locate the tree's position in the field.

**Acceptance Criteria:**

**Given** I am viewing a tree's detail page  
**When** I click the "Show on Map" button  
**Then** the map view opens (or returns to map tab)  
**And** the camera smoothly animates to the tree's coordinates  
**And** zoom level is set to 17 (shows tree + 50m radius context)  
**And** the animation takes ~800ms (not instant, not slow)

**Given** the tree has invalid coordinates (0,0 or null)  
**When** I click "Show on Map"  
**Then** I see error message: "Tree location not set"  
**And** map does not zoom

---

### Story 2.2: Marker Highlight with Pulsing Animation

As an **Inventariador**,  
I want the target tree marker to pulse/highlight after zoom,  
So that I know exactly which marker represents the tree I'm looking for.

**Acceptance Criteria:**

**Given** the map has zoomed to a tree  
**When** the zoom animation completes  
**Then** the target marker pulses with a 2-second fade animation  
**And** marker temporarily increases size by 20% during pulse  
**And** pulse uses accent color (brand color) to stand out

**Given** there are multiple trees clustered near the target  
**When** zoom completes  
**Then** only the target tree marker pulses  
**And** other markers remain normal size/color

---

## Epic 3: Reliable Offline Operations & Conflict Resolution

### Story 3.1: Persistent Sync Queue with Retry Logic

As a **Sistema**,  
I want to persist failed operations in a queue with automatic retry,  
So that no data is lost when users work offline for extended periods.

**Acceptance Criteria:**

**Given** a user creates/updates/deletes a tree while offline  
**When** the operation completes locally  
**Then** it is added to the sync queue in localStorage  
**And** queue entry includes: operation_type (CREATE/UPDATE/DELETE), entity_id, payload, timestamp, retry_count=0

**Given** the device comes online  
**When** the sync service detects connectivity  
**Then** sync queue processes operations in FIFO order  
**And** successful operations are removed from queue  
**And** failed operations increment retry_count and use exponential backoff (1min, 2min, 4min, 8min, max 30min)

**Given** an operation fails 5 times  
**When** max retries reached  
**Then** operation is marked as "requires manual review"  
**And** user sees notification: "Sync issue detected. Contact support if persists."

---

### Story 3.2: Offline Awareness Banner with Pending Count

As an **Inventariador**,  
I want to see when I'm offline and how many changes are pending sync,  
So that I understand my data's sync status and don't expect immediate updates.

**Acceptance Criteria:**

**Given** the device loses internet connectivity  
**When** the app detects offline status  
**Then** a persistent banner appears at top: "⚠️ Offline - 3 pending changes"  
**And** banner color is orange (warning, not error)  
**And** banner shows count of operations in sync queue

**Given** I am offline and make 5 additional changes  
**When** each change completes  
**Then** the pending count updates live: "8 pending changes"

**Given** device comes online and sync completes  
**When** all operations sync successfully  
**Then** banner changes to: "✓ Online - All changes synced" (green)  
**And** banner auto-dismisses after 3 seconds

---

### Story 3.3: Sync Queue Size Limits and Warnings

As a **Sistema**,  
I want to prevent sync queue overflow by limiting size and warning users,  
So that localStorage doesn't exceed capacity and users sync regularly.

**Acceptance Criteria:**

**Given** sync queue has 50 pending operations (50% of limit)  
**When** user performs another offline operation  
**Then** warning toast appears: "50 changes pending. Please sync soon."

**Given** sync queue has 100 pending operations (limit reached)  
**When** user attempts another offline operation  
**Then** operation is blocked  
**And** modal appears: "Sync queue full (100 operations). Please connect to internet to sync before making more changes."  
**And** user cannot create/edit until queue drains below 95

---

### Story 3.4: Automatic Conflict Detection

As a **Sistema**,  
I want to automatically detect conflicts when syncing offline changes,  
So that users don't silently overwrite others' work.

**Acceptance Criteria:**

**Given** User A edits Tree X offline (local version timestamp T1)  
**When** User A syncs while online  
**Then** system checks if server version of Tree X has timestamp > T1  
**And** if yes, conflict is detected and sync pauses for that operation  
**And** conflict entry is created with: local_version, server_version, conflicted_fields[]

**Given** a conflict is detected for a tree update  
**When** sync continues  
**Then** the conflicted operation is skipped (not applied)  
**And** user is notified: "1 conflict requires resolution"  
**And** conflict modal appears automatically

---

### Story 3.5: Visual Conflict Diff Viewer

As an **Inventariador**,  
I want to see exactly what changed between my version and the server version,  
So that I can make an informed decision when resolving conflicts.

**Acceptance Criteria:**

**Given** a conflict exists for a tree  
**When** the conflict resolution modal opens  
**Then** I see a 3-column diff view:  
- Column 1: "Your Changes" (local version)  
- Column 2: "Changes Made" (diff highlighting)  
- Column 3: "Server Version" (current server state)  
**And** conflicting fields are highlighted in yellow  
**And** for each conflicted field, I see: Field Name | Your Value → Server Value

**Given** the conflict is for a text field (e.g., notes)  
**When** I view the diff  
**Then** I see character-level diff with additions in green, deletions in red

---

### Story 3.6: One-Click Conflict Resolution

As an **Inventariador**,  
I want to resolve conflicts with one click using clear strategies,  
So that I can quickly handle conflicts without complex merge tools.

**Acceptance Criteria:**

**Given** I am viewing a conflict in the resolution modal  
**When** I see the resolution options  
**Then** I have 3 buttons:  
- "Keep Mine" (use local version, discard server changes)  
- "Use Theirs" (use server version, discard my changes)  
- "Merge Manually" (opens field-by-field selection)

**Given** I click "Keep Mine"  
**When** I confirm the action  
**Then** my local version overwrites the server version  
**And** conflict is marked as resolved  
**And** sync queue retries the operation immediately  
**And** I have 30 seconds to click "Undo" if I made a mistake

**Given** I click "Merge Manually"  
**When** the merge UI opens  
**Then** I see each conflicted field with radio buttons: ( ) Mine ( ) Theirs  
**And** I can select per-field which version to keep

---

## Epic 4: Quick Field Estimates (DAP Estimator)

### Story 4.1: Forced Hand Width Calibration

As a **Sistema**,  
I want to force users to calibrate their hand width before using DAP estimator,  
So that estimates have a known reference point and aren't wildly inaccurate.

**Acceptance Criteria:**

**Given** a user opens DAP estimator for the first time  
**When** the camera view loads  
**Then** a calibration overlay blocks usage  
**And** instructions appear: "Measure your hand width with a ruler. Enter the width in cm:"  
**And** input field accepts only numbers 5-15 (realistic hand widths)  
**And** "Start Estimating" button is disabled until valid calibration entered

**Given** I have calibrated my hand width  
**When** I save the calibration  
**Then** value is stored in user profile  
**And** calibration overlay never shows again (unless user resets)  
**And** I can view/edit my calibration in Settings

---

### Story 4.2: Camera Overlay with Circle Sizing

As an **Inventariador**,  
I want to position a circle overlay on a tree trunk via camera,  
So that I can estimate the diameter using visual reference.

**Acceptance Criteria:**

**Given** I have completed calibration  
**When** I open DAP estimator and point camera at tree  
**Then** I see live camera feed with semi-transparent circle overlay (green, 30% opacity)  
**And** I can resize circle by pinching or using +/- buttons  
**And** reference scale appears showing calibrated hand width for size comparison

**Given** camera exposure is too low (dark environment)  
**When** brightness falls below threshold  
**Then** warning appears: "⚠️ Poor lighting. Estimate may be inaccurate."  
**And** I can proceed anyway or cancel

---

### Story 4.3: Automatic DAP Calculation with Error Margin

As an **Inventariador**,  
I want the system to automatically calculate DAP from my circle sizing,  
So that I get a quick estimate without manual math.

**Acceptance Criteria:**

**Given** I have positioned the circle overlay on the trunk  
**When** I click "Capture Estimate"  
**Then** system calculates: `diameter_cm = (circle_pixels / hand_width_pixels) * calibrated_hand_width_cm`  
**And** result displays prominently: "Estimated DAP: 34 cm (±2 cm)"  
**And** error margin is always shown (±2cm minimum)

**Given** calculated DAP is unusually large (>150cm)  
**When** result displays  
**Then** warning appears: "⚠️ Unusually large diameter. Please double-check with tape measure."

---

### Story 4.4: Measurement Tagging and Visual Differentiation

As an **Inventariador**,  
I want measurements tagged as "estimated" vs "measured" with visual badges,  
So that planners know which measurements to trust for critical decisions.

**Acceptance Criteria:**

**Given** I save a DAP estimate from the estimator  
**When** the tree is saved  
**Then** tree record includes field: `dap_measurement_type = 'ESTIMATED'`  
**And** tree details page shows orange badge: "📏 Estimated (±2cm)" next to DAP value

**Given** I manually enter DAP with tape measure  
**When** I use the standard DAP input field  
**Then** tree record has: `dap_measurement_type = 'MEASURED'`  
**And** tree details shows green checkmark: "✓ Measured" next to DAP

**Given** I am viewing tree list  
**When** trees are displayed  
**Then** estimated DAPs show with orange color, measured DAPs show in default color

---

### Story 4.5: DAP Validation Against Species Norms

As a **Sistema**,  
I want to validate DAP estimates against species averages,  
So that users are alerted to measurements that are statistically unlikely.

**Acceptance Criteria:**

**Given** a tree has species selected and DAP estimated  
**When** DAP is >2 standard deviations from species average  
**Then** warning modal appears: "This DAP ({value} cm) is unusual for {species}. Typical range: {avg ± 2σ}. Please verify with tape measure."  
**And** user can confirm "I verified, this is correct" or "Re-measure"

**Given** species has no known average in database  
**When** DAP is estimated  
**Then** no species validation occurs (skip this check)

---

## Epic 5: Data Backup & Portability (Export/Import)

### Story 5.1: Export Trees and Plans to ZIP

As a **Gestor**,  
I want to export all trees and intervention plans from my installation to a ZIP file,  
So that I have a complete offline backup for disaster recovery.

**Acceptance Criteria:**

**Given** I am viewing my installation  
**When** I click "Export Data"  
**Then** I select what to export: [ ] Trees [ ] Intervention Plans [ ] Photos  
**And** I click "Generate Export"  
**Then** ZIP file is created containing:  
- `metadata.json` (schema version, export date, installation info)  
- `trees.json` (all tree records)  
- `plans.json` (all intervention plans, if selected)  
- `/photos/` folder (if photos selected, organized by tree_id)  
**And** ZIP downloads to device with filename: `arboria_export_{instalacao_name}_{YYYY-MM-DD}.zip`

**Given** export includes 1000 trees with photos  
**When** generation starts  
**Then** progress modal shows: "Exporting: 45% (450/1000 trees)"  
**And** export can take up to 60 seconds without timeout

---

### Story 5.2: Import Preview with Validation

As a **Gestor**,  
I want to preview what will be imported before confirming,  
So that I don't accidentally overwrite or duplicate existing data.

**Acceptance Criteria:**

**Given** I select a ZIP file for import  
**When** I click "Import"  
**Then** system validates ZIP structure (metadata.json exists, schema version compatible)  
**And** preview modal shows:  
- "Import will add: 150 trees, 20 plans, 300 photos"  
- "Target installation: {current_instalacao}"  
- Warnings if schema version mismatch detected  
**And** I must explicitly click "Confirm Import" to proceed

**Given** ZIP file is corrupted or missing metadata.json  
**When** I attempt import  
**Then** error modal appears: "Invalid export file. Cannot import."  
**And** import is blocked

---

### Story 5.3: Transactional All-or-Nothing Import

As a **Sistema**,  
I want import to be transactional with automatic rollback on failure,  
So that partial imports don't leave the database in an inconsistent state.

**Acceptance Criteria:**

**Given** import process is running  
**When** 50% of trees imported  
**And** a foreign key constraint error occurs (e.g., missing species_id)  
**Then** all imported records from this session are rolled back  
**And** database returns to pre-import state  
**And** error message shows: "Import failed: {specific error}. No data was imported."

**Given** import completes successfully  
**When** all records processed  
**Then** success modal shows: "✓ Import complete: 150 trees, 20 plans, 300 photos"  
**And** audit log records import event with user_id, timestamp, record counts

---

## Epic 6: Team Coordination Essentials

### Story 6.1: Supabase Realtime Subscriptions

As a **Sistema**,  
I want to subscribe to Realtime database changes for the current installation,  
So that users see live updates when teammates make changes.

**Acceptance Criteria:**

**Given** a user is viewing trees for Installation X  
**When** the component mounts  
**Then** Supabase Realtime subscription is created: `channel('instalacao_{X}').on('postgres_changes', handler)`  
**And** subscription listens for INSERT/UPDATE/DELETE on tables: trees, intervention_plans, tree_photos

**Given** another user (User B) creates a new tree in Installation X  
**When** INSERT event fires  
**Then** User A's tree list automatically updates with new tree  
**And** newness indicator (blue dot) appears on the new tree for 30 seconds

---

### Story 6.2: Notification Batching and Categories

As a **Sistema**,  
I want to batch similar notifications and categorize by importance,  
So that users aren't spammed but still receive critical updates.

**Acceptance Criteria:**

**Given** 5 trees are created within 5 minutes by the same user  
**When** notification service processes events  
**Then** instead of 5 separate notifications, one batched notification is created: "{User} added 5 trees"  
**And** batch updates every minute until 5-minute window closes

**Given** a notification is created  
**When** it is categorized  
**Then** priority is set:  
- HIGH: Conflicts detected, Installation deleted, Plan approved  
- MEDIUM: New tree added, Plan created  
- LOW: Tree updated, Photo added  
**And** users can filter notifications by priority in preferences

---

### Story 6.3: In-App Notification System with Badges

As a **Gestor** or **Planejador**,  
I want to see in-app notifications with unread count badges,  
So that I stay informed of team activity without email spam.

**Acceptance Criteria:**

**Given** I have 3 unread notifications  
**When** I view the app navigation  
**Then** notification bell icon shows badge: "3" (red circle)  
**And** clicking bell opens notification dropdown

**Given** notification dropdown is open  
**When** I view notifications  
**Then** I see list of recent notifications (max 20), newest first  
**And** each notification shows: icon, message, timestamp, read/unread status  
**And** unread notifications have blue background highlight

**Given** I click a notification for "New tree added by João"  
**When** notification is clicked  
**Then** I navigate to that tree's detail page  
**And** notification is marked as read  
**And** badge count decrements

---

### Story 6.4: Notification Preferences Configuration

As a **Inventariador**,  
I want to configure which notifications I receive and how often,  
So that I'm not overwhelmed but still informed of critical issues.

**Acceptance Criteria:**

**Given** I am in Settings > Notifications  
**When** I view preferences  
**Then** I can select notification mode:  
- ( ) Real-time (all notifications immediately)  
- ( ) Daily Digest (one email/notification per day with summary)  
- ( ) Critical Only (conflicts, deletions, approvals only)

**Given** I select "Critical Only"  
**When** a MEDIUM priority notification (new tree) is triggered  
**Then** I do NOT receive the notification  
**And** only HIGH priority notifications reach me

---

### Story 6.5: Activity History Viewer for Audit

As a **Gestor**,  
I want to view complete activity history for my installation,  
So that I can audit team actions and track accountability.

**Acceptance Criteria:**

**Given** I navigate to Settings > Activity History  
**When** the page loads  
**Then** I see paginated table of all actions (50 per page):  
- Columns: Timestamp, User, Action (created/updated/deleted), Entity Type (tree/plan/photo), Entity ID  
**And** I can filter by: user, date range, action type

**Given** I click on an activity entry  
**When** detail modal opens  
**Then** I see full details: before/after values for updates, full record for creates/deletes

---

## Epic 7: Professional Reporting & Presentation

### Story 7.1: PDF Library Integration (react-pdf)

As a **Sistema**,  
I want to integrate react-pdf for professional PDF generation,  
So that reports are well-formatted for stakeholder presentation.

**Acceptance Criteria:**

**Given** PDF generation is triggered  
**When** react-pdf renders the document  
**Then** template uses professional styling:  
- Header with installation logo and name  
- Page numbers (bottom right)  
- Section headings with brand colors  
- Tables with alternating row colors for readability  
**And** font size is minimum 10pt (readable when printed)

---

### Story 7.2: Report Template with Tree Statistics

As a **Gestor**,  
I want PDF reports to include comprehensive tree statistics,  
So that I can present inventory metrics to stakeholders.

**Acceptance Criteria:**

**Given** I generate a PDF report for my installation  
**When** the report renders  
**Then** it includes sections:  
1. **Executive Summary**: Total trees, total risk score, high-risk count  
2. **Risk Distribution**: Pie chart showing Alto/Médio/Baixo counts  
3. **Species Distribution**: Bar chart of top 10 species  
4. **Tree Table**: Paginated list (100 trees per page) with columns: ID, Species, DAP, Height, Risk  
5. **Map Visualization**: Static map screenshot showing all tree locations

**Given** installation has 500 trees  
**When** report is generated  
**Then** report has 5-6 pages (summary + 5 pages of tree table)  
**And** generation completes in <10 seconds

---

### Story 7.3: Map Screenshot with html2canvas

As a **Sistema**,  
I want to capture a static map screenshot for PDF inclusion,  
So that stakeholders see tree locations without needing interactive access.

**Acceptance Criteria:**

**Given** PDF report is being generated  
**When** map screenshot is needed  
**Then** system waits for map 'load' event (all tiles rendered)  
**And** uses html2canvas to capture map canvas element  
**And** screenshot includes legend showing risk color coding  
**And** screenshot resolution is 1920x1080 (high quality for print)

**Given** map fails to load within 5 seconds  
**When** timeout occurs  
**Then** screenshot step is skipped  
**And** PDF shows placeholder: "Map unavailable at generation time"

---

### Story 7.4: Email Report Distribution (Optional)

As a **Gestor**,  
I want to email generated PDF reports to stakeholders,  
So that I can share inventory data without manual download/send process.

**Acceptance Criteria:**

**Given** PDF report is generated  
**When** I click "Email Report"  
**Then** modal opens with fields: recipient_email, subject (pre-filled), message (optional)  
**And** I click "Send"  
**Then** Supabase Edge Function is invoked asynchronously to send email  
**And** modal closes with message: "Email queued. You'll be notified when sent."

**Given** email send completes (via Edge Function webhook)  
**When** status updates  
**Then** I receive in-app notification: "✓ Report emailed to {recipient}"

---

## Epic 8: GPS Location Tracking (Optional)

### Story 8.1: "Show My Location" Toggle Button

As an **Inventariador**,  
I want to toggle GPS tracking on demand,  
So that I can see my position on the map when needed without constant battery drain.

**Acceptance Criteria:**

**Given** I am viewing the map  
**When** I see the map controls  
**Then** there is a "📍 My Location" button (toggle style)  
**And** button is OFF by default (grey)

**Given** I click "My Location" button  
**When** toggle activates  
**Then** button turns blue (active state)  
**And** GPS tracking starts  
**And** modal briefly appears: "⚡ GPS active - battery impact: medium"

**Given** GPS tracking is ON for 5 minutes  
**When** 5-minute timer expires  
**Then** tracking auto-disables  
**And** button returns to grey (OFF state)  
**And** tooltip appears: "GPS auto-disabled to save battery"

---

### Story 8.2: User Location Marker with Accuracy Circle

As an **Inventariador**,  
I want to see my current location on the map with accuracy visualization,  
So that I understand how precise my position is.

**Acceptance Criteria:**

**Given** GPS tracking is active  
**When** position is acquired  
**Then** blue dot marker appears at my location  
**And** semi-transparent circle shows accuracy radius (e.g., 10m radius if GPS accuracy is ±10m)  
**And** marker updates every 2 seconds as I move

**Given** GPS accuracy is poor (>50m)  
**When** location updates  
**Then** accuracy circle is red and very large  
**And** tooltip warns: "⚠️ GPS accuracy poor. Move to open area."

---

## Epic 9: Platform Maturity (Education + Performance)

### Story 9.1: TRAQ Criteria Flashcard Carousel

As an **Inventariador**,  
I want to learn TRAQ risk assessment criteria through interactive flashcards,  
So that I can make more accurate risk evaluations in the field.

**Acceptance Criteria:**

**Given** I navigate to Education > TRAQ Flashcards  
**When** the page loads  
**Then** I see a card carousel with 20 TRAQ criterion flashcards  
**And** each card shows: criterion name (front), full explanation + examples (back)  
**And** I can navigate with prev/next arrows or swipe gestures

**Given** I am viewing a flashcard  
**When** I click the card  
**Then** it flips to show the answer side with smooth animation  
**And** I can mark "Got it" or "Review Later"

**Given** I have completed all flashcards  
**When** carousel ends  
**Then** summary shows: "Mastered: 15/20, Review: 5/20"  
**And** progress is saved to user profile

---

### Story 9.2: Code Splitting for Faster Initial Load

As a **Sistema**,  
I want to implement route-based code splitting,  
So that initial page load is fast and users don't download code for pages they don't visit.

**Acceptance Criteria:**

**Given** app is built for production  
**When** Webpack/Vite processes the build  
**Then** each route generates a separate chunk:  
- `inventory.chunk.js` (loaded only when visiting inventory page)  
- `map.chunk.js` (loaded only when map is opened)  
- `reports.chunk.js` (loaded only for reports)

**Given** a user lands on the home page  
**When** page loads  
**Then** only core chunks are downloaded: `main.js`, `vendor.js`, `home.chunk.js`  
**And** total initial download is <300KB (gzipped)

**Given** user navigates to Map page  
**When** route changes  
**Then** `map.chunk.js` is lazy-loaded  
**And** loading spinner shows for <500ms while chunk downloads

---

### Story 9.3: Lazy Loading of Map and Sensor Components

As a **Sistema**,  
I want to lazy-load heavy components (Map, Camera, Sensors),  
So that pages without these features load quickly.

**Acceptance Criteria:**

**Given** TreeForm page is loading (has optional camera)  
**When** initial render occurs  
**Then** camera component is NOT loaded yet  
**And** "Add Photo" button shows as available

**Given** user clicks "Add Photo"  
**When** button is clicked  
**Then** camera component lazy-loads  
**And** loading indicator shows: "Loading camera..."  
**And** camera opens in <1 second

---

### Story 9.4: Production Performance Monitoring (Core Web Vitals)

As a **Sistema**,  
I want to track Core Web Vitals in production,  
So that performance regressions are detected before users complain.

**Acceptance Criteria:**

**Given** user loads any page in production  
**When** page fully loads  
**Then** Web Vitals are measured and sent to analytics:  
- TTI (Time to Interactive)  
- FCP (First Contentful Paint)  
- LCP (Largest Contentful Paint)  
- CLS (Cumulative Layout Shift)

**Given** TTI exceeds 3 seconds for >5% of users in a 24-hour period  
**When** analytics threshold is triggered  
**Then** alert is sent to development team: "⚠️ Performance degradation detected: TTI = 3.8s (p95)"

---

### Story 9.5: Bundle Size Optimization Target

As a **Sistema**,  
I want to reduce bundle size by 50% from current baseline,  
So that app loads quickly even on slow 3G connections.

**Acceptance Criteria:**

**Given** current bundle size is measured at 800KB (gzipped)  
**When** optimization work completes  
**Then** bundle size is reduced to ≤400KB (gzipped) via:  
- Tree-shaking unused code  
- Replacing heavy libraries with lighter alternatives  
- Code splitting (see Story 9.2)  
- Image optimization

**Given** build pipeline runs  
**When** bundle exceeds 450KB threshold  
**Then** CI build fails with error: "Bundle size limit exceeded. Optimize before merging."
