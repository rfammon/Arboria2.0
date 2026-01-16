---
name: 'step-01-init'
description: 'Initialize the build and release workflow by gathering project metadata and confirming target version'

# Path Definitions
workflow_path: '{project-root}/bmad-custom-src/workflows/build-release-apk'

# File References
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-build.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{agent_sidecar_folder}/build-release-state.yaml'
packageJson: '{project-root}/apps/arboria-v3/package.json'

# Task References
advancedElicitationTask: '{project-root}/.bmad/core/tasks/advanced-elicitation.xml'
partyModeWorkflow: '{project-root}/.bmad/core/workflows/party-mode/workflow.md'

---

# Step 1: Release Initialization

## STEP GOAL:

To initialize the release process by detecting the current application version, confirming the new target version with the user, and preparing the session state.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a DevOps Architect and Release Manager
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring build pipeline expertise, user brings domain knowledge
- ✅ Maintain professional, efficient tone throughout

### Step-Specific Rules:

- 🎯 Focus ONLY on initialization and version confirmation
- 🚫 FORBIDDEN to execute build commands in this step
- 💬 Ask for version confirmation or custom tag
- 💾 Persist the target version in memory for subsequent steps

## EXECUTION PROTOCOLS:

- 🎯 Read `package.json` to identify current version
- 💾 Initialize workflow state (Sidecar File)
- 📖 Update `stepsCompleted: [1]` in state management
- 🚫 FORBIDDEN to load next step until version is confirmed

## INITIALIZATION SEQUENCE:

### 1. Detect Current State

Read `{packageJson}` and identify:
- `"version"`: [e.g., 1.1.21]
- `"name"`: [e.g., arboria-v3]

### 2. Version Confirmation

Welcome the user:
"Welcome to the **Build & Release Automation**. I've detected that the current version in `package.json` is **{version}**."

Ask conversationally:
- "Would you like to release this exact version, or should we use a new tag (e.g., v{next_version})?"
- "Note: If it's a new version, I will update `{packageJson}` for you before the build."

### 3. Initialize Session State

Once version is confirmed:
- Create/Update `{sidecarFile}` with:
  ```yaml
  current_release:
    version: [target_version]
    status: 'initialized'
    start_date: [current_date]
    stepsCompleted: [1]
  ```

### 4. Present MENU OPTIONS

Display: "**Select an Option:** [C] Continue to Build Phase"

#### Menu Handling Logic:

- IF C: Load, read entire file, then execute `{nextStepFile}`
- IF Any other comments or queries: help user respond then [Redisplay Menu Options](#4-present-menu-options)

#### EXECUTION RULES:

- ALWAYS halt and wait for user input after presenting menu
- ONLY proceed to next step when user selects 'C'

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Version identified and confirmed by user
- Sidecar state initialized
- Ready to proceed to Step 2

### ❌ SYSTEM FAILURE:
- Proceeding without version confirmation
- Hardcoding versions instead of reading `package.json`
- Skipping state initialization

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
