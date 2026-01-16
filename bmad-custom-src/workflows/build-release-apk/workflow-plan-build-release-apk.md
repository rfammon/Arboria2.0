---
stepsCompleted: [1, 2, 3, 4, 5, 6]
---

# Workflow Creation Plan: build-release-apk

## Initial Project Context

- **Module:** stand-alone
- **Target Location:** c:\BMAD-workflow\bmad-custom-src\workflows\build-release-apk
- **Created:** 2026-01-06
- **App Type:** Capacitor (React/Vite)
- **Repo:** rfammon/Arboria2.0

## Description

This workflow automates the end-to-end release process:
1. Building the APK using Capacitor/Gradle.
2. Creating a GitHub Release for the current version.
3. Uploading the generated APK to the release.
4. Sending a push notification to users alerting them of the update.
5. Deleting the oldest release to keep the history clean.

## Detailed Requirements

### 1. Workflow Classification
- **Type:** Action Workflow
- **Flow Pattern:** Linear
- **Interaction Style:** Highly autonomous execution after initial parameters (version) are confirmed.
- **Instruction Style:** Prescriptive for technical execution (build/CLI), Intent-based for notification messaging.

### 2. Technical Steps & Tooling
- **Build Engine:** Android Gradle (`./gradlew assembleRelease`).
- **Release Management:** GitHub CLI (`gh release`).
- **Notification System:** Supabase Edge Functions (via `fetch` to `send-push-notification`).
- **Cleanup Logic:** Use `gh release list` with JSON output and JQ to identify the release with the earliest `createdAt` timestamp.

### 3. Inputs & Outputs
- **Prerequisites:** GitHub CLI authenticated, Supabase Anon Key in `.env`.
- **Primary Input:** New version tag (e.g., `v1.1.22`).
- **Primary Output:** Published GitHub release with `.apk` asset.
- **Verification:** Confirmation of successful notification and deletion of oldest record.

## Tools Configuration

### Core BMAD Tools

- **Party-Mode**: Included - Integration points: Creative phase for release notes and design review.
- **Advanced Elicitation**: Included - Integration points: Final verification and quality gate for release metadata.

### LLM Features

- **File I/O**: Included - Essential for reading app metadata and managing build artifacts.
- **Sub-Processes**: Included - Used for long-running build operations.

### Memory Systems

- **Sidecar File**: Included - Purpose: Maintaining state (last build version, release logs) between sessions.

### External Integrations

- **GitHub CLI**: For release creation and asset upload.
- **Supabase Edge Functions**: API integration for push notification dispatch.

## Workflow Structure Design

### Step Sequence

1. **step-01-init.md**: 
   - Detect project version from `package.json`.
   - Ask user for confirmation/input on the new version tag.
   - Initialize the `Sidecar File` with session state.
2. **step-02-build.md**: 
   - Run `npm run build` for the web assets.
   - Sync Capacitor with `npx cap sync android`.
   - Execute Gradle build: `./gradlew assembleRelease` via Sub-Process.
   - Verify `.apk` generation.
3. **step-03-release.md**:
   - Use **Party-Mode** to brainstorm/refine Release Notes.
   - Use **Advanced Elicitation** to double-check the notes.
   - Create GitHub Release and upload the APK.
4. **step-04-notify.md**:
   - Fetch target user IDs (or broadcast).
   - Send POST request to Supabase Edge Function with release metadata.
5. **step-05-cleanup.md**:
   - List all releases.
   - Identify and delete the one with the oldest `createdAt` timestamp.
   - Final summary and state update.

### Interaction Patterns
- **Halt points**: At initialization (version confirmation) and Release Notes review.
- **Auto-proceed**: During the build and cleanup phases (with status updates).
