#!/bin/bash
# Sync code to dev server (excluding .env files and other sensitive/generated files)

echo "🔄 Syncing to dev server (10.0.0.2)..."
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
  sduval@10.0.0.2:~/Code/Wrioter/

echo ""
echo "✅ Sync complete!"
echo ""
echo "⚠️  Remember: .env files are NOT synced (each server has its own config)"
