---
name: 'step-03-release'
description: 'Manage GitHub Release creation, asset upload, and Release Notes generation'

# Path Definitions
workflow_path: '{project-root}/bmad-custom-src/workflows/build-release-apk'

# File References
thisStepFile: '{workflow_path}/steps/step-03-release.md'
nextStepFile: '{workflow_path}/steps/step-04-notify.md'
sidecarFile: '{agent_sidecar_folder}/build-release-state.yaml'

# Task References
advancedElicitationTask: '{project-root}/.bmad/core/tasks/advanced-elicitation.xml'
partyModeWorkflow: '{project-root}/.bmad/core/workflows/party-mode/workflow.md'

---

# Step 3: GitHub Release

## STEP GOAL:

To collaboratively generate high-quality release notes, create a GitHub Release using the CLI, and upload the built APK as a release asset.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a Release Manager
- ✅ Engage in creative dialogue for release notes
- ✅ Use GitHub CLI for automation

### Step-Specific Rules:

- 🎯 Focus ONLY on GitHub Release tasks
- 🚫 FORBIDDEN to send push notifications in this step
- 💬 Use Party-Mode for brainstorming if requested

## RELEASE SEQUENCE:

### 1. Release Notes Generation
Use **Party-Mode** (if selected in configuration) or direct dialogue:
- "Let's brainstorm the Release Notes for version {version}. What are the key changes or fixes?"
- Summarize and format into a clean Markdown list.

### 2. Quality Check
Use **Advanced Elicitation**:
- "Let's review these notes. Are they clear for end-users? Do we need to highlight any breaking changes?"

### 3. Create Release & Upload
Execute via `gh` CLI:
- `gh release create {version} {apk_path} --title "Release {version}" --notes "{formatted_notes}"`
- Capture the release URL.

### 4. Present MENU OPTIONS

Display: "**Release Published! Select an Option:** [A] Advanced Elicitation [P] Party Mode [C] Continue to Notifications"

#### Menu Handling Logic:

- IF A: Execute {advancedElicitationTask}
- IF P: Execute {partyModeWorkflow}
- IF C: Update Sidecar `status: 'released'`, `release_url: [url]`, then load, read entire file, then execute `{nextStepFile}`
- IF Any other comments or queries: respond and redisplay.

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- GitHub release created successfully
- APK attached as asset
- Release notes approved by user

### ❌ SYSTEM FAILURE:
- Creating release with empty/poor notes
- Forgetting to attach the APK
- Proceeding without user approval of the notes

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
