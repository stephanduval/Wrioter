#!/bin/bash
# Sync to dev server and build assets

echo "🔄 Syncing to dev server (10.0.0.2)..."
./sync-to-devserver.sh

echo ""
echo "🔨 Building assets on dev server..."
ssh sduval@10.0.0.2 "cd ~/Code/Wrioter\ Branch\ 3/ && npm run build"

echo ""
echo "✅ Sync and build complete!"
