# Fix MCP Config Script
# This script applies several fixes to resolve the "invalid UTF-8" marshalling error.

$configPath = "C:\Users\vinil\.gemini\antigravity\mcp_config.json"

if (-not (Test-Path $configPath)) {
    Write-Host "[ERROR] Configuration file not found at $configPath" -ForegroundColor Red
    exit 1
}

Write-Host "Reading $configPath..." -ForegroundColor Cyan
$configJson = Get-Content $configPath -Raw | ConvertFrom-Json

# 1. Add --quiet to npx calls to prevent progress bars polluting stdout
foreach ($serverName in $configJson.mcpServers.PSObject.Properties.Name) {
    $server = $configJson.mcpServers.$serverName
    if ($server.command -eq "npx") {
        if ($server.args -notcontains "--quiet") {
            # Insert --quiet after -y or as the first argument
            if ($server.args[0] -eq "-y") {
                $newArgs = @("-y", "--quiet") + $server.args[1..($server.args.Length-1)]
            } else {
                $newArgs = @("--quiet") + $server.args
            }
            $server.args = $newArgs
            Write-Host "[FIXED] Added --quiet to $serverName" -ForegroundColor Green
        }
    }
}

# 2. Add an environmental variable to suppress further junk if possible (for some node servers)
# (Optional but recommended)

# 3. Handle the filesystem server accented path
if ($configJson.mcpServers.filesystem) {
    $fsArgs = $configJson.mcpServers.filesystem.args
    for ($i = $fsArgs.Count - 1; $i -ge 0; $i--) {
        if ($fsArgs[$i] -like "*Área de Trabalho*") {
            Write-Host "[FIXED] Removed accented path from 'filesystem' server: $($fsArgs[$i])" -ForegroundColor Green
            $fsList = [System.Collections.ArrayList]$fsArgs
            $fsList.RemoveAt($i)
            $fsArgs = $fsList.ToArray()
        }
    }
    $configJson.mcpServers.filesystem.args = $fsArgs
}

# 4. Save the fixed configuration
$newJson = $configJson | ConvertTo-Json -Depth 10
Set-Content $configPath $newJson -Encoding utf8

Write-Host "--- Configuration Updated ---" -ForegroundColor Cyan
Write-Host "Please restart Antigravity (Reload IDE) to apply changes."
