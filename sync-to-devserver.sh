#!/bin/bash
# Sync code to dev server (excluding .env files and other sensitive/generated files)

echo "🔄 Syncing to dev server (192.168.1.252)..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

rsync -av \
  --exclude='.env*' \
  --exclude='node_modules/' \
  --exclude='vendor/' \
  --exclude='.git/' \
  --exclude='storage/logs/*' \
  --exclude='storage/framework/cache/*' \
  --exclude='storage/framework/sessions/*' \
  --exclude='storage/framework/views/*' \
  --exclude='bootstrap/cache/*' \
  --progress \
  "$SCRIPT_DIR/" \
  sduval@192.168.1.252:"~/Code/Wrioter Branch 2/"

echo ""
echo "✅ Sync complete!"
echo ""
echo "⚠️  Remember: .env files are NOT synced (each server has its own config)"
