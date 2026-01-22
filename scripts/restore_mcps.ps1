# Restore and Sanitize MCP Setup
# This script ensures dependencies are installed and the config file is valid UTF-8.

$configPath = "C:\Users\vinil\.gemini\antigravity\mcp_config.json"
$backupPath = "$configPath.bak"

Write-Host "--- Starting MCP Restoration ---" -ForegroundColor Cyan

# 1. Backup Configuration
if (Test-Path $configPath) {
    Copy-Item $configPath $backupPath -Force
    Write-Host "[OK] Backup created at $backupPath" -ForegroundColor Green
}
else {
    Write-Host "[ERROR] Configuration file not found at $configPath" -ForegroundColor Red
    Exit
}

# 2. Sanitize Encoding (Force UTF-8 without BOM)
try {
    $content = Get-Content $configPath -Raw
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($configPath, $content, $utf8NoBom)
    Write-Host "[OK] Configurations sanitized to UTF-8" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Failed to sanitize encoding: $_" -ForegroundColor Red
}

# 3. Restore Debugger MCP (Node.js)
$debuggerPath = "C:\BMAD-workflow\debugger-mcp"
if (Test-Path $debuggerPath) {
    Write-Host "Restoring debugger-mcp dependencies..." -NoNewline
    Push-Location $debuggerPath
    try {
        Start-Process -FilePath "npm" -ArgumentList "install" -Wait -NoNewWindow
        Start-Process -FilePath "npm" -ArgumentList "run build" -Wait -NoNewWindow
        Write-Host " [OK]" -ForegroundColor Green
    }
    catch {
        Write-Host " [FAILED]" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Host "[SKIP] debugger-mcp path not found" -ForegroundColor Yellow
}

# 4. Restore Android MCP (Python/uv)
$androidPath = "C:\BMAD-workflow\android-mcp-server"
if (Test-Path $androidPath) {
    Write-Host "Checking android-mcp-server environment..." -NoNewline
    Push-Location $androidPath
    # Assuming 'uv' is in PATH or using the path from config if known. 
    # For now we check if 'uv' runs.
    try {
        $uvCheck = Start-Process -FilePath "uv" -ArgumentList "--version" -Wait -NoNewWindow -PassThru
        if ($uvCheck.ExitCode -eq 0) {
            # Trigger a sync to ensure environment is ready
            Start-Process -FilePath "uv" -ArgumentList "sync" -Wait -NoNewWindow
            Write-Host " [OK]" -ForegroundColor Green
        }
        else {
            Write-Host " [WARN] uv returned non-zero exit code" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " [WARN] uv not found or failed to run. Ensure 'uv' is installed." -ForegroundColor Yellow
    }
    finally {
        Pop-Location
    }
}

Write-Host "--- Restoration Complete ---" -ForegroundColor Cyan
Write-Host "Please restart your AI tool (Claude/Gemini/Cursor) to reload the configuration."
