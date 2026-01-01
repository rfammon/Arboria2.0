#!/bin/bash

# ArborIA OTA Update Script
# This script creates and uploads an OTA bundle to Capawesome Cloud

VERSION="1.0.17"
APP_ID="216e18cb-b177-44ed-803c-92acf67ed27f"
BUNDLE_DIR="./dist"

echo "🚀 ArborIA OTA Update - Version $VERSION"
echo "==========================================="

# Check if dist directory exists
if [ ! -d "$BUNDLE_DIR" ]; then
  echo "❌ Error: Build directory not found. Run 'npm run build' first."
  exit 1
fi

# Create a zip file of the dist directory
echo "📦 Creating bundle archive..."
cd dist
zip -r ../arboria-bundle-${VERSION}.zip ./*
cd ..

echo "✅ Bundle created: arboria-bundle-${VERSION}.zip"
echo ""
echo "📤 To upload to Capawesome Cloud:"
echo "   1. Go to: https://cloud.capawesome.io/"
echo "   2. Navigate to your app: $APP_ID"
echo "   3. Upload: arboria-bundle-${VERSION}.zip"
echo "   4. Set bundle version: $VERSION"
echo ""
echo "Or use the Capawesome CLI (if configured):"
echo "   npx @capawesome/live-update-cli bundle upload \\"
echo "     --app-id=$APP_ID \\"
echo "     --bundle-id=$VERSION \\"
echo "     --path=./dist"
