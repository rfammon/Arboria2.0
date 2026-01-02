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
- [x] **Planning**
  - [x] Create story file (this document)
  - [x] Define Implementation Plan
- [x] **Technical Foundation**
  - [x] Implement `:root` variables in `index.css` (Pre-existing)
  - [x] Create/Update device detection utility/hook (Pre-existing)
- [x] **Implementation**
  - [x] Apply `--touch-target` to Button component
  - [x] Apply `--touch-target` to Input/Select components
  - [x] Adjust global spacing using `--spacing-unit`
  - [x] Fix Textarea and Checkbox tokens
- [x] **Verification**
  - [x] Verify `data-density` attribute correctly set on different platforms
  - [x] Visual verification of touch target sizes
  - [x] Unit tests for device detection logic
