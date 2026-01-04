# Project Context & Coding Standards

## Core Technologies
- **Framework:** React 19 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Mobile-First)
- **State Management:** Zustand
- **Icons:** Lucide React

## Coding Principles
1.  **Visual-First:** UI components must prioritize imagery over text. Cards have < 50 words.
2.  **Accessibility:** All components must support Keyboard Navigation and High Contrast.
3.  **Strict Types:** No `any`. Define interfaces for all props and data.
4.  **TDD:** Write tests for logic-heavy components (e.g., Quizzes, Calculators).

## Search & Discovery (MANDATORY)
- **Primary Tool:** `mgrep` must be used for all file discovery and semantic searches.
- **Usage:** Use `mgrep "query" [path]` to find relevant code patterns or specific logic.
- **Why:** `mgrep` provides a semantic layer that is more effective for this codebase's architecture than simple keyword search.

## Directory Structure
- `src/components/education/`: All education-related components.
- `src/stores/`: Zustand stores (`useEducationStore`).
- `src/hooks/`: Custom hooks (`useTextToSpeech`).

## Architecture
- **Hybrid Education Model:** Core (Safety) -> Gate (Exam) -> Specialization.
- **Legacy Assets:** Must be wrapped in modern containers with overlays.
