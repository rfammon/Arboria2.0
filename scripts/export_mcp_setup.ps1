# Export MCP Setup Script
# Use this to package your current MCP configuration and local server source code.

$exportDir = Join-Path (Get-Location) "MCP_Export_$(Get-Date -Format 'yyyyMMdd_HHmm')"
New-Item -ItemType Directory -Path $exportDir -Force | Out-Null

$configPath = "C:\Users\vinil\.gemini\antigravity\mcp_config.json"
$targetConfig = Join-Path $exportDir "mcp_config.json"

Write-Host "--- Starting MCP Export ---" -ForegroundColor Cyan

# 1. Copy Configuration
if (Test-Path $configPath) {
    Copy-Item $configPath $targetConfig
    Write-Host "[OK] Copied mcp_config.json" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Configuration file not found at $configPath" -ForegroundColor Red
}

# 2. Package Local Servers
$localServers = @(
    @{ Name="debugger-mcp"; Path="C:\BMAD-workflow\debugger-mcp" },
    @{ Name="android-mcp-server"; Path="C:\BMAD-workflow\android-mcp-server" }
)

foreach ($server in $localServers) {
    if (Test-Path $server.Path) {
        $zipPath = Join-Path $exportDir "$($server.Name).zip"
        Write-Host "Packaging $($server.Name)..." -NoNewline
        # Exclude node_modules and .venv to keep it light
        Compress-Archive -Path "$($server.Path)\*" -DestinationPath $zipPath -Force
        Write-Host " [OK]" -ForegroundColor Green
    } else {
        Write-Host "[SKIP] Local path for $($server.Name) not found at $($server.Path)" -ForegroundColor Yellow
    }
}

# 3. Copy Documentation
$docPath = "C:\BMAD-workflow\docs\MCP_Setup_Summary.md"
if (Test-Path $docPath) {
    Copy-Item $docPath (Join-Path $exportDir "READ_ME_FIRST.md")
    Write-Host "[OK] Included Readme" -ForegroundColor Green
}

Write-Host "--- Export Complete ---" -ForegroundColor Cyan
Write-Host "Exported to: $exportDir" -ForegroundColor White
Write-Host "Instructions: Move the contents of this folder to the new machine and refer to READ_ME_FIRST.md."
