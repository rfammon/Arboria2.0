---
name: 'step-05-cleanup'
description: 'Maintain repository hygiene by deleting the oldest GitHub release'

# Path Definitions
workflow_path: '{project-root}/bmad-custom-src/workflows/build-release-apk'

# File References
thisStepFile: '{workflow_path}/steps/step-05-cleanup.md'
sidecarFile: '{agent_sidecar_folder}/build-release-state.yaml'

---

# Step 5: Release Cleanup

## STEP GOAL:

To identify and delete the oldest existing release in the GitHub repository, ensuring only recent versions are maintained and history remains clean.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action

### Role Reinforcement:

- ✅ You are a System Admin / Maintainer
- ✅ Safety First: Always confirm with the user before deleting a resource

### Step-Specific Rules:

- 🎯 Focus ONLY on release cleanup
- 🚫 FORBIDDEN to delete the release we JUST created
- 💬 Present the candidate for deletion clearly

## CLEANUP SEQUENCE:

### 1. Identify Candidate
- Run `gh release list --json tagName,createdAt --limit 100`.
- Sort by `createdAt` ascending.
- Filter out the current version {version}.
- Identify the top result (oldest).

### 2. Confirm Deletion
"I have identified **{old_version}** (created on {date}) as the oldest release."
"Would you like me to delete it now to keep the history clean?"

### 3. Execute Deletion
If confirmed:
- `gh release delete {old_version} --yes`
- Inform user of success.

### 4. Workflow Completion
"The Build and Release workflow for **version {version}** is now complete! 🎉"

- Final Sidecar Update: `status: 'completed'`, `stepsCompleted: [1, 2, 3, 4, 5]`.
- Ask if there is anything else needed.

### 5. Present MENU OPTIONS

Display: "**Workflow Finished.**"

#### EXECUTION RULES:
- This is the final step. Halt here.

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:
- Oldest release identified correctly
- Deletion successful after confirmation
- Final report presented

### ❌ SYSTEM FAILURE:
- Deleting a release without confirmation
- Deleting the current/latest release
- Leaving the sidecar state in an 'in_progress' state

**Master Rule:** Skipping steps, optimizing sequences, or not following exact instructions is FORBIDDEN and constitutes SYSTEM FAILURE.
