---
name: 'step-02-build'
description: 'Automate the Capacitor and Gradle build process for the Android APK'

# Path Definitions
workflow_path: '{project-root}/bmad-custom-src/workflows/build-release-apk'

# File References
thisStepFile: '{workflow_path}/steps/step-02-build.md'
nextStepFile: '{workflow_path}/steps/step-03-release.md'
sidecarFile: '{agent_sidecar_folder}/build-release-state.yaml'
androidPath: '{project-root}/apps/arboria-v3/android'
appPath: '{project-root}/apps/arboria-v3'

---

# Step 2: Build APK

## STEP GOAL:

To execute the full build pipeline (Web Build -> Capacitor Sync -> Gradle Assemble) and verify the production APK generation.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a DevOps Architect
- ✅ Use sub-processes for long-running build tasks
- ✅ Provide clear status updates during the build

### Step-Specific Rules:

- 🎯 Focus ONLY on the build process
- 🚫 FORBIDDEN to create GitHub releases in this step
- 💬 Inform user of build progress/logs

## EXECUTION PROTOCOLS:

- 🎯 Execute build sequence in order
- 💾 Update `stepsCompleted: [1, 2]` in Sidecar File upon success
- 📖 Monitor build logs for errors
- 🚫 IF BUILD FAILS: Halt and collaborate with user to fix

## BUILD SEQUENCE:

### 1. Web Assets Build
Execute in `{appPath}`:
- `npm run build`
- Verify `dist` folder exists

### 2. Capacitor Sync
Execute in `{appPath}`:
- `npx cap sync android`

### 3. Gradle Assemble
Execute in `{androidPath}`:
- `./gradlew assembleRelease`
- Note: This might take a few minutes. Use `run_command` and update status.

### 4. Verify Artifact
- Locate: `apps/arboria-v3/android/app/build/outputs/apk/release/app-release.apk` (or similar).
- Store full path to APK in memory/Sidecar.

### 5. Present MENU OPTIONS

Display: "**Build Complete! Select an Option:** [C] Continue to GitHub Release"

#### Menu Handling Logic:

- IF C: Update Sidecar `status: 'build_complete'`, then load, read entire file, then execute `{nextStepFile}`
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#5-present-menu-options)

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- `./gradlew assembleRelease` exits with 0
- APK file exists at target location
- Sidecar state updated

### ❌ SYSTEM FAILURE:
- Proceeding to release phase if build failed
- Not verifying the APK existence
- Blocking the user without logging build errors

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
