#!/bin/bash
# Sync code to dev server (excluding .env files and other sensitive/generated files)

echo "🔄 Syncing to dev server (192.168.1.252)..."
echo ""

rsync -av \
  --exclude-from=/home/rogers/Code/Wrioter/.rsyncignore \
  --progress \
  "/home/rogers/Code/Wrioter Branch 3/" \
  "sduval@192.168.1.252:~/Code/Wrioter Branch 3/"

echo ""
echo "✅ Sync complete!"
echo ""
echo "⚠️  Remember: .env files are NOT synced (each server has its own config)"
