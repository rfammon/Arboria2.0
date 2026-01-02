# Story 1.1: Adaptive Density Tokens (Mobile/Desktop)

**As a** Developer,  
**I want** to use CSS Variables to control UI density based on the device,  
**So that** the app is instantly responsive without JavaScript re-renders.

## Acceptance Criteria
- [ ] Root level `:root[data-density='field|office']` variables implemented in `index.css`.
- [ ] Logic to detect device (Capacitor vs Web/Tauri) and set `data-density` attribute on `<html>`.
- [ ] Standardized spacing (`--spacing-unit`) and touch targets (`--touch-target`) applied to core components.
- [ ] Mobile (field) shows 56px touch targets.
- [ ] Desktop (office) shows 44px touch targets.

## Tasks
- [ ] **Planning**
  - [x] Create story file (this document)
  - [ ] Define Implementation Plan
- [ ] **Technical Foundation**
  - [ ] Implement `:root` variables in `index.css`
  - [ ] Create/Update device detection utility/hook
- [ ] **Implementation**
  - [ ] Apply `--touch-target` to Button component
  - [ ] Apply `--touch-target` to Input/Select components
  - [ ] Adjust global spacing using `--spacing-unit`
- [ ] **Verification**
  - [ ] Verify `data-density` attribute correctly set on different platforms
  - [ ] Visual verification of touch target sizes
  - [ ] Unit tests for device detection logic
