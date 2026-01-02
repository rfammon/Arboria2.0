# Story 1.2: UI/UX Layout Refinements

## Description
Address visual bugs and UX regressions: sidebar leakage, excessive whitespace in headers, items leaking from containers, and mobile alignment issues.

## Acceptance Criteria
- [x] Sidebar (menu + backdrop) always appears on top of page elements (z-index fix).
- [x] Execution page header is compact (less whitespace).
- [x] Search input on Execution page has consistent icon alignment.
- [x] Topic Page (Education) has reduced gap between header and title.
- [x] Components don't overflow their containers on small screens.

## Tasks
- [x] **Planning**
  - [x] Create implementation plan
  - [x] Create story file (this document)
- [x] **Implementation**
  - [x] Fix Sidebar z-index in `DashboardLayout.tsx`
  - [x] Refactor `Execution.tsx` header and filters
  - [x] Refactor `TopicPage.tsx` header spacing
  - [x] audit `AlertsCenter.tsx` for leaking elements
- [x] **Verification**
  - [x] Visual regression check on mobile/desktop
  - [x] Verify z-index layering with portaled elements
