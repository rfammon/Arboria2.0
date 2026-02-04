---
description: arboria-test-suite - Execute the full Arboria v3 test battery (Vitest + Playwright)
---

This workflow executes the complete testing protocol for Arboria v3 to ensure maintenance tasks haven't introduced regressions.

### Steps:

1. **Verify Environment**
   Check for necessary dependencies and configurations.
   // turbo
   `npm list @playwright/test vitest`

2. **Run Logic & Store Tests (Vitest)**
   Execute all unit and integration tests.
   // turbo
   `npm run test -- --run`

3. **Run Specialized Component Scrutiny (Atomic & Adversarial)**
   Execute granular tests for UI primitives and adversarial states.
   // turbo
   `npm run test -- src/components/ui/`

4. **Run E2E Smoke Tests (Playwright)**
   Execute the critical user journey battery.
   // turbo
   `npx playwright test --project=chromium`

5. **Review Results**
   Analyze tool output for failures and generate a summary for the user.
