# Arboria Core Skill

## Trigger
When working on any file within `apps/arboria-v3/` or related to the Arboria project.

## Core Principles

### 1. Visual-First UI
- **Rule:** UI components must prioritize imagery over text.
- **Constraint:** Cards MUST contain fewer than 50 words.
- **Goal:** Immersive education through visual storytelling.

### 2. Platform Isolation
- **Rule:** Windows (Tauri) and Android (Capacitor) versions are ISOLATED.
- **Action:** Treat them as separate codebases. Do not leak features unless explicitly asked for both.
- **Implementation:** Use `PlatformAdapter` or similar patterns to keep logic distinct.

### 3. Education Architecture
- **Model:** Core (Safety) -> Gate (Exam) -> Specialization.
- **Legacy Assets:** Must be wrapped in modern containers with overlays.

### 4. Search & Discovery
- **Mandatory Tool:** Use `mgrep` for all semantic searches and file discovery.

### 5. Technical Standards
- **Strict Types:** No `any`. Use interfaces for all props and data.
- **Accessibility:** Ensure Keyboard Navigation and High Contrast support.
- **TDD:** Required for logic-heavy components (Quizzes, Calculators).

## Directory Patterns
- `src/components/education/`: Education-specific UI.
- `src/stores/`: Zustand stores.
- `src/hooks/`: Custom hooks (e.g., TTS).

## Anti-Patterns
- Using `any` types.
- Text-heavy component designs (>50 words in cards).
- Shared logic that breaks platform isolation without abstraction.
- Using standard `grep` instead of `mgrep` for discovery.
