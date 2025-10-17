# ⚠️ CRITICAL: Environment File Management

## DO NOT Sync .env Files!

**All rsync sync services now EXCLUDE `.env*` files to prevent overwriting server configurations.**

### Why?
Each environment needs its own URLs:
- **Local dev**: `http://localhost:8000` (or production URLs)
- **Remote dev server (192.168.1.252)**:
  - Main: `http://192.168.1.252:8000`
  - Branch 2: `http://192.168.1.252:8001`
  - Branch 3: `http://192.168.1.252:8002`

If you sync your local `.env.testing` to the server, it will break the remote dev environment!

## What's Protected

All three rsync services now exclude:
- `.env*` (all environment files)
- `.env-backups/` (backup directory)

## Managing .env Files

### Backup Current Configs
```bash
./backup-env-files.sh
```

### View Current Configs
The backup script shows current URLs for all three environments.

### Restore from Backup
```bash
# List backups
ssh sduval@192.168.1.252 "ls -la ~/Code/Wrioter/.env-backups/"

# Restore
ssh sduval@192.168.1.252 "cd ~/Code/Wrioter && cp .env-backups/.env.testing.TIMESTAMP .env.testing"
```

## Correct Configuration Reference

### Main Wrioter (Server)
```
APP_URL=http://192.168.1.252:8000
VITE_API_BASE_URL=http://192.168.1.252:8000/api
```

### Branch 2 (Server)
```
APP_URL=http://192.168.1.252:8001
VITE_API_BASE_URL=http://192.168.1.252:8001/api
ASSET_URL=http://192.168.1.252:5174
```

### Branch 3 (Server)
```
APP_URL=http://192.168.1.252:8002
VITE_API_BASE_URL=http://192.168.1.252:8002/api
```

### Database (All Server Environments)
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wrioter_test
DB_USERNAME=wrioter_test
DB_PASSWORD='WrioterTest123!@#'
```

## If You Accidentally Overwrite

1. Stop the affected dev server (Ctrl+C in tmux)
2. Run `./backup-env-files.sh` to see current state
3. Fix the URLs using the reference above
4. Restart the dev server: `yarn dev:test:all` (or branch2/branch3:all)
5. Hard refresh browser (Ctrl+Shift+R)

## Service Status

All three rsync services have been updated:
- ✅ `wrioter-sync.service` - Excludes `.env*`
- ✅ `wrioter-branch2-sync.service` - Excludes `.env*`
- ✅ `wrioter-branch3-sync.service` - Excludes `.env*`

Last updated: 2025-10-11
