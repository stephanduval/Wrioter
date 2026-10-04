# Branch-Specific Configuration (Wrioter Branch 3)

**Shared rules:** Read `docs/development/claude-rules.md` for code standards, feature checklist, and efficiency guidelines.

**Latest documentation location:**
/home/sduval/Code/Wrioter Branch 3/docs/

**Legacy documentation (less recent):**
/home/sduval/Code/Wrioter/docs/LLM_GUIDE.md


# Remote Dev Server Sync Rules

## ⚠️ YOU MUST START SYNC MANUALLY

Sync does **NOT** run automatically on startup. You must start it when you begin development:

```bash
sync-all-start    # Start syncing all three projects
```

## Sync Quick Commands

**Start/Stop:**
```bash
sync-all-start     # Start syncing all projects
sync-all-stop      # Stop syncing all projects
sync-all-status    # Check sync status
```

**Individual projects:**
```bash
sync-wrioter-start      # Wrioter Main
sync-branch2-start      # Branch 2
sync-branch3-start      # Branch 3
```

## How Sync Works

- **Automatic file monitoring** — inotifywait watches for local file changes
- **Continuous syncing** — rsync automatically transfers changed files to remote server
- **Connection fallback** — Tries ethernet (10.0.0.2) first, then WiFi (192.168.1.252)
- **Incremental transfer** — Only changed files are synced (fast after initial sync)

## Important Sync Rules

- **Start sync at beginning of session** — `sync-all-start` before starting development
- `.env*` files are NOT synced — Each environment has its own config
- `public/build/` is NOT synced — Server builds its own frontend with correct URLs
- `node_modules/` and `vendor/` NOT synced — Install on server separately
- Deleted files are deleted remotely — Sync includes `--delete` flag

## CSS Changes & Refresh

After modifying CSS:
1. Build completes automatically (watch mode)
2. Sync transfers files (automatic, no action needed)
3. Hard refresh in browser: `Ctrl+Shift+R` to clear cache

**If changes don't appear:**
```bash
# On remote server - clear build cache and rebuild
ssh sduval@10.0.0.2 "cd ~/Code/Wrioter\ Branch\ 3 && rm -rf public/build node_modules/.vite"
ssh sduval@10.0.0.2 "tmux kill-session -t wrioter:2"
# Then restart via tmux
```

## Full Documentation

See `SYNC-GUIDE.md` in project root for:
- Manual sync with progress bar
- Troubleshooting
- Service configuration
- Performance notes
