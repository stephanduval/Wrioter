#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 Backing up .env files with timestamp: $TIMESTAMP"

# Backup main Wrioter
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter && mkdir -p .env-backups && cp .env.testing .env-backups/.env.testing.$TIMESTAMP"
echo "✅ Main Wrioter backed up"

# Backup Branch 2
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter\ Branch\ 2 && mkdir -p .env-backups && cp .env.testing .env-backups/.env.testing.$TIMESTAMP"
echo "✅ Branch 2 backed up"

# Backup Branch 3
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter\ Branch\ 3 && mkdir -p .env-backups && cp .env.testing .env-backups/.env.testing.$TIMESTAMP"
echo "✅ Branch 3 backed up"

echo ""
echo "📋 Current configs:"
echo ""
echo "=== Main Wrioter ==="
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter && grep -E 'APP_URL=|VITE_API_BASE_URL=' .env.testing"
echo ""
echo "=== Branch 2 ==="
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter\ Branch\ 2 && grep -E 'APP_URL=|VITE_API_BASE_URL=' .env.testing"
echo ""
echo "=== Branch 3 ==="
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter\ Branch\ 3 && grep -E 'APP_URL=|VITE_API_BASE_URL=' .env.testing"
