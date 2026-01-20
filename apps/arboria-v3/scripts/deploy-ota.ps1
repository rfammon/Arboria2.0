# ArborIA OTA Update - Version 1.0.17
# This script creates and uploads an OTA bundle to Capawesome Cloud

# Get version from package.json
$PACKAGE_JSON = Get-Content -Raw -Path ".\package.json" | ConvertFrom-Json
$VERSION = $PACKAGE_JSON.version
$APP_ID = "216e18cb-b177-44ed-803c-92acf67ed27f"
$BUNDLE_DIR = ".\dist"

Write-Host "🚀 ArborIA OTA Update - Version $VERSION" -ForegroundColor Green
Write-Host "==========================================="

# Check if dist directory exists
if (-not (Test-Path $BUNDLE_DIR)) {
    Write-Host "❌ Error: Build directory not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# Create a zip file of the dist directory
Write-Host "📦 Creating bundle archive..." -ForegroundColor Yellow
Compress-Archive -Path "$BUNDLE_DIR\*" -DestinationPath "arboria-bundle-$VERSION.zip" -Force

Write-Host "✅ Bundle created: arboria-bundle-$VERSION.zip" -ForegroundColor Green
Write-Host ""
Write-Host "📤 To upload to Capawesome Cloud:" -ForegroundColor Cyan
Write-Host "   1. Go to: https://cloud.capawesome.io/"
Write-Host "   2. Navigate to your app: $APP_ID"
Write-Host "   3. Upload: arboria-bundle-$VERSION.zip"
Write-Host "   4. Set bundle version: $VERSION"
Write-Host ""
Write-Host "Or use the Capawesome CLI (if configured):" -ForegroundColor Cyan
Write-Host "   npx @capawesome/live-update-cli bundle upload \"
Write-Host "     --app-id=$APP_ID \"
Write-Host "     --bundle-id=$VERSION \"
Write-Host "     --path=./dist"
