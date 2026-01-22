# MCP Installation Summary

This document provides a comprehensive overview of the Model Context Protocol (MCP) servers installed on this machine.

## Configuration File Location
The master configuration is located at:
`C:\Users\vinil\.gemini\antigravity\mcp_config.json`

## Server Inventory

### 1. Global / NPX Servers (Automated Installation)
These servers are run using `npx` and do not require local folder migration, but they do require the same `mcp_config.json` entry.

| Server Name | NPM Package / Command | Status | Notes |
| :--- | :--- | :--- | :--- |
| `sequential-thinking` | `@modelcontextprotocol/server-sequential-thinking` | Enabled | Standard thinking tool. |
| `context7` | `@upstash/context7-mcp` | Enabled | Documentation assistant. |
| `supabase-mcp-server` | `@supabase/mcp-server-supabase@latest` | Enabled | Requires Supabase Access Token. |
| `chrome-devtools` | `chrome-devtools-mcp@latest` | **Disabled** | Browser interaction tools. |
| `render` | `mcp-remote` (connecting to `mcp.render.com`) | Enabled | Requires Render API Key (provided in config). |

### 2. Remote / SSE Servers
These connect via web service and require no local installation beyond the URL in the config.

| Server Name | SSE URL | Purpose |
| :--- | :--- | :--- |
| `deepwiki` | `https://mcp.deepwiki.com/sse` | GitHub Repository Analysis. |

### 3. Docker-based Servers
Requires Docker Desktop installed on the destination machine.

| Server Name | Docker Image | Environment Variables |
| :--- | :--- | :--- |
| `github-mcp-server` | `ghcr.io/github/github-mcp-server` | `GITHUB_PERSONAL_ACCESS_TOKEN` |

### 4. Local Source Servers
**IMPORTANT:** These folders must be copied to the same path on the new machine or the `mcp_config.json` paths must be updated.

| Server Name | Local Path | Runtime |
| :--- | :--- | :--- |
| `debugger` | `C:\BMAD-workflow\debugger-mcp` | Node.js |
| `android` | `C:\BMAD-workflow\android-mcp-server` | Python (uv) |

---

## Sensitive Information (API Keys)

> [!WARNING]
> The following keys are currently stored in your `mcp_config.json`. **Do not share this file publicly.**

- **Supabase Token:** `YOUR_TOKEN_HERE`
- **GitHub PAT:** `YOUR_TOKEN_HERE`
- **Render API Key:** `YOUR_TOKEN_HERE`

---

## Reallocation Instructions (New Machine)

1. **Prerequisites**:
   - Install [Node.js](https://nodejs.org/) (latest LTS).
   - Install [Python](https://www.python.org/) 3.10+ and [uv](https://github.com/astral-sh/uv).
   - Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for GitHub MCP).
2. **Setup Folder Structure**:
   - Create `C:\BMAD-workflow` (or your preferred root).
   - Place the source folders for `debugger-mcp` and `android-mcp-server` inside.
3. **Configure Gemini/Claude/Cursor**:
   - Locate the `mcp_config.json` for your specific AI tool (usually in AppData or ~/.gemini/).
   - Merge the contents of the exported `mcp_config.json`.
4. **Update Paths**:
   - If you changed the location of `BMAD-workflow`, search and replace all hardcoded paths in `mcp_config.json`.
