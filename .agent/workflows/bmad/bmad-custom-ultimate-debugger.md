---
description: Ultimate Debugging Workflow with MCP Integration
---

# Ultimate Debugger - MCP Enhanced

This workflow uses advanced MCP servers to provide systematic, AI-powered debugging capabilities.

**MCP Tools Used:**
- **sequential-thinking**: For structured problem decomposition and solution development
- **context7**: For accessing up-to-date framework/library documentation
- **deepwiki**: For GitHub repository insights and code pattern analysis
- **debugger**: For advanced error analysis, code quality assessment, and performance profiling

---

## Phase 1: Error Analysis & Initial Assessment

### 1.1 Gather Information

Collect the following information from the user:

**App/Program Context:**
- What is the application/program use case?
- What files are involved? (Attach to conversation)
- What were you doing when the error occurred?

**Error Details:**
- What is the exact error message?
- What is the stack trace (if available)?
- When does the error occur? (Always, intermittently, under specific conditions)

**Environment:**
- What technology stack/frameworks are involved?
- Any recent changes to code or dependencies?
- Is this a GitHub repository? (If yes, note the repo name)

---

### 1.2 Sequential Thinking - Hypothesis Generation

Use `mcp_sequential-thinking_sequentialthinking` to systematically analyze the error:

**Prompt for Sequential Thinking:**
```
Analyze this debugging scenario and generate initial hypotheses:

Error: [ERROR_MESSAGE]
Stack Trace: [STACK_TRACE]
User Task: [WHAT_USER_WAS_DOING]
Technology Stack: [TECH_STACK]

Generate 5 educated predictions for potential root causes. Consider:
1. Coding mistakes (logic errors, type mismatches, null references)
2. Dependency issues (version conflicts, missing packages, configuration)
3. Resource constraints (memory, file locks, network)
4. Environment differences (paths, permissions, OS-specific issues)
5. Timing/concurrency issues (race conditions, async errors)

For each hypothesis, rate the likelihood (High/Medium/Low) and explain your reasoning.
```

**Process:**
- Start with `thoughtNumber: 1, totalThoughts: 10` (adjust as needed)
- Use `isRevision: true` and `revisesThought` to refine hypotheses
- Set `nextThoughtNeeded: false` when initial hypotheses are complete

**Document Output:**
```xml
<initial_hypotheses>
[Paste structured output from sequential thinking]
</initial_hypotheses>
```

---

## Phase 2: Context Research

### 2.1 Framework/Library Context (Context7)

**For each framework/library involved in the error:**

1. **Resolve Library ID:**
```
Use: mcp_context7_resolve-library-id
libraryName: [e.g., "react", "express", "django"]
query: [User's error description]
```

2. **Query Documentation:**
```
Use: mcp_context7_query-docs
libraryId: [Result from resolve-library-id]
query: [Specific question about the error, e.g., "How to properly handle async errors in Express middleware?"]
```

**Document Output:**
```xml
<framework_context>
<library name="[LIBRARY_NAME]">
[Key insights from Context7]
</library>
</framework_context>
```

---

### 2.2 Repository Insights (DeepWiki)

**If the error involves third-party code or a GitHub repo:**

1. **Ask Repository Question:**
```
Use: mcp_deepwiki_ask_question
repoName: [owner/repo, e.g., "facebook/react"]
question: [e.g., "How does error boundary handling work? Are there common pitfalls?"]
```

2. **Read Wiki Structure (if helpful):**
```
Use: mcp_deepwiki_read_wiki_structure
repoName: [owner/repo]
```

**Document Output:**
```xml
<repository_insights>
<repo name="[REPO_NAME]">
[Key patterns, common issues, best practices]
</repo>
</repository_insights>
```

---

## Phase 3: Deep Code Investigation

### 3.1 Debugger MCP - Error Analysis

**Retrieve and Analyze Errors:**

1. **Get Current Errors:**
```
Use: mcp_debugger_debugger-action
action: "get-metrics"
params: {
  type: "errors",
  severity: "error",
  timeframe: "30m"
}
```

2. **AI-Powered Error Analysis:**
```
Use: mcp_debugger_debugger-action
action: "analyze-ai"
params: {
  type: "errors",
  errorId: [Specific error ID if available, or omit for pattern analysis]
}
```

**Document Output:**
```xml
<debugger_error_analysis>
[Error categorization, patterns, and AI insights]
</debugger_error_analysis>
```

---

### 3.2 Debugger MCP - Code Quality Analysis

**Analyze Problematic Files:**

1. **AI Code Quality Analysis:**
```
Use: mcp_debugger_debugger-action
action: "analyze-ai"
params: {
  type: "code-quality",
  filePath: [Path to suspect file]
}
```

2. **Complexity Analysis:**
```
Use: mcp_debugger_debugger-action
action: "analyze-complexity"
params: {
  filePath: [Path to suspect file]
}
```

3. **Get Code Violations:**
```
Use: mcp_debugger_debugger-action
action: "get-metrics"
params: {
  type: "violations",
  filePath: [Path to suspect file],
  severity: "error"
}
```

**Document Output:**
```xml
<code_quality_analysis>
[Code smells, complexity metrics, violations]
</code_quality_analysis>
```

---

### 3.3 React-Specific Analysis (if applicable)

**For React applications:**

1. **Analyze React Component:**
```
Use: mcp_debugger_debugger-action
action: "analyze-react"
params: {
  action: "component",
  filePath: [Path to React component],
  componentName: [Component name]
}
```

2. **Detect React Issues:**
```
Use: mcp_debugger_debugger-action
action: "analyze-react"
params: {
  action: "detect-issues",
  filePath: [Path to React file],
  issueType: "all"
}
```

3. **Monitor React Hooks:**
```
Use: mcp_debugger_debugger-action
action: "analyze-react"
params: {
  action: "hooks",
  filePath: [Path to React file],
  hookType: "all"
}
```

**Document Output:**
```xml
<react_analysis>
[Component state, hooks issues, performance problems]
</react_analysis>
```

---

### 3.4 Performance & Memory Analysis (if applicable)

**For performance-related errors:**

1. **Get Performance Dashboard:**
```
Use: mcp_debugger_debugger-action
action: "analyze-performance"
params: {
  type: "dashboard",
  timeframe: 300000
}
```

2. **AI Performance Insights:**
```
Use: mcp_debugger_debugger-action
action: "analyze-ai"
params: {
  type: "performance"
}
```

3. **Memory Analysis:**
```
Use: mcp_debugger_debugger-action
action: "get-metrics"
params: {
  type: "memory",
  limit: 10
}
```

**Document Output:**
```xml
<performance_analysis>
[Performance bottlenecks, memory issues, optimization opportunities]
</performance_analysis>
```

---

## Phase 4: Solution Synthesis

### 4.1 Sequential Thinking - Refine Hypotheses

Use `mcp_sequential-thinking_sequentialthinking` to narrow down root cause:

**Prompt for Sequential Thinking:**
```
Based on the gathered evidence, refine the initial hypotheses:

Initial Hypotheses:
[Paste from Phase 1.2]

New Evidence:
- Framework Context: [Summary from Phase 2.1]
- Repository Insights: [Summary from Phase 2.2]
- Error Analysis: [Summary from Phase 3.1]
- Code Quality: [Summary from Phase 3.2]
- [React/Performance Analysis if applicable]

Using process of elimination:
1. Which hypotheses are supported by the evidence?
2. Which can be ruled out?
3. What is the most likely root cause?
4. What supporting evidence confirms this?

Provide a step-by-step rationale for your conclusion.
```

**Document Output:**
```xml
<refined_analysis>
[Narrowed hypotheses with supporting evidence]
</refined_analysis>
```

---

### 4.2 Identify Problematic Code

**Based on the refined analysis, identify the specific code segment causing the error:**

```xml
<problematic_code>
File: [FILE_PATH]
Lines: [LINE_NUMBERS]

[CODE SNIPPET]

Issue: [Precise description of what's wrong]
</problematic_code>
```

---

### 4.3 Sequential Thinking - Solution Development

Use `mcp_sequential-thinking_sequentialthinking` to develop the fix:

**Prompt for Sequential Thinking:**
```
Develop a comprehensive solution for the identified issue:

Problematic Code:
[Paste from Phase 4.2]

Root Cause:
[Most likely cause from Phase 4.1]

Consider:
1. What is the minimal fix needed?
2. Are there side effects to consider?
3. Should we refactor for better design?
4. What tests should be added?
5. Are there similar issues elsewhere in the codebase?

Develop step-by-step debugging instructions and corrected code.
```

**Generate hypothesis and verify until satisfied**

**Document Output:**
```xml
<solution>
[Detailed solution with corrected code snippets]
</solution>
```

---

## Phase 5: Comprehensive Output

### 5.1 Final Report Structure

Compile all findings into a comprehensive debugging report:

```xml
<debugging_report>

<error>
[Original error message]
</error>

<user_task>
[What the user was doing when error occurred]
</user_task>

<root_cause>
[Final determined root cause with confidence level]
</root_cause>

<supporting_evidence>
1. Framework Documentation: [Key points from Context7]
2. Repository Patterns: [Key points from DeepWiki]
3. Error Analysis: [Key points from Debugger MCP]
4. Code Quality Issues: [Key points from code analysis]
</supporting_evidence>

<problematic_code>
File: [FILE_PATH]
Lines: [LINE_NUMBERS]

[ORIGINAL CODE]
</problematic_code>

<corrected_code>
File: [FILE_PATH]
Lines: [LINE_NUMBERS]

[CORRECTED CODE]

Changes Made:
- [Change 1]
- [Change 2]
- [etc.]
</corrected_code>

<step_by_step_fix>
1. [First step]
2. [Second step]
3. [etc.]
</step_by_step_fix>

<verification_steps>
1. [How to verify the fix works]
2. [Tests to run]
3. [Expected behavior after fix]
</verification_steps>

<additional_recommendations>
- [Recommendation 1: e.g., add error handling]
- [Recommendation 2: e.g., improve logging]
- [Recommendation 3: e.g., refactor similar code]
</additional_recommendations>

<prevention_tips>
- [How to prevent this error in the future]
- [Tools or practices to adopt]
- [Code review checklist items]
</prevention_tips>

</debugging_report>
```

---

## Usage Instructions

**To use this workflow:**

1. **Invoke the workflow:** `/bmad-custom-ultimate-debugger`

2. **Provide context:** The workflow will ask for:
   - Error message and stack trace
   - User task when error occurred
   - Relevant files
   - Technology stack

3. **Follow the phases:** The workflow will guide you through:
   - Hypothesis generation (Sequential Thinking)
   - Context research (Context7 + DeepWiki)
   - Code investigation (Debugger MCP)
   - Solution development (Sequential Thinking)

4. **Review the report:** You'll receive a comprehensive debugging report with:
   - Root cause analysis
   - Supporting evidence from multiple sources
   - Corrected code
   - Step-by-step fix instructions
   - Prevention recommendations

---

## Advanced Tips

**For Complex Bugs:**
- Use `branchFromThought` in sequential thinking to explore alternative theories
- Query Context7 multiple times for different aspects of the framework
- Use debugger MCP's AI optimization suggestions: `mcp_debugger_suggest-optimizations`

**For Performance Issues:**
- Start CPU profiling: `mcp_debugger_start-cpu-profiling`
- Stop and analyze: `mcp_debugger_stop-cpu-profiling`
- Get optimization recommendations: `mcp_debugger_get-performance-optimization-recommendations`

**For Memory Leaks:**
- Take heap snapshot: `mcp_debugger_take-heap-snapshot`
- Start heap sampling: `mcp_debugger_start-heap-sampling`
- Analyze memory patterns: `mcp_debugger_get-memory-snapshots`

---

## MCP Tool Reference

### Sequential Thinking
- `mcp_sequential-thinking_sequentialthinking`: Dynamic problem-solving with revision capability

### Context7
- `mcp_context7_resolve-library-id`: Find Context7-compatible library ID
- `mcp_context7_query-docs`: Query documentation for frameworks/libraries

### DeepWiki
- `mcp_deepwiki_ask_question`: Ask questions about GitHub repositories
- `mcp_deepwiki_read_wiki_structure`: Get documentation topics
- `mcp_deepwiki_read_wiki_contents`: View repository documentation

### Debugger
- `mcp_debugger_debugger-action`: Unified tool for all debugging, metrics, profiling, and analysis.
- `action`: "get-metrics", "performance-profiling", "analyze-performance", "analyze-react", "analyze-ai", "debug-variables", "get-debug-session", "analyze-complexity", "manage-breakpoints", "browser-control", "update-config"
- `params`: Arguments specific to each action.
