# Wrioter Projects Auto-Sync Guide

This guide explains how to use the automatic file synchronization system for your Wrioter projects.

## Overview

Three systemd services automatically sync your local Wrioter projects to the remote development server using `inotifywait` and `rsync`.

**Connection Fallback**: All sync operations try the **direct ethernet connection first** (DevServerDirect @ 10.0.0.2), then fall back to WiFi (DevServer @ 192.168.1.252) if the ethernet connection fails. This allows syncing to work whether you're connected via cable or WiFi.

### Projects Configured:
- **Wrioter Main**: `~/Code/Wrioter/` → `sduval@10.0.0.2:~/Code/Wrioter/` (or WiFi fallback)
- **Wrioter Branch 2**: `~/Code/Wrioter Branch 2/` → `sduval@10.0.0.2:~/Code/Wrioter Branch 2/` (or WiFi fallback)
- **Wrioter Branch 3**: `~/Code/Wrioter Branch 3/` → `sduval@10.0.0.2:~/Code/Wrioter Branch 3/` (or WiFi fallback)

## Quick Start

### Starting Sync Services

```bash
# Start individual project sync
sync-wrioter-start    # Start Wrioter main sync
sync-branch2-start    # Start Branch 2 sync
sync-branch3-start    # Start Branch 3 sync

# Start all projects at once
sync-all-start
```

### Stopping Sync Services

```bash
# Stop individual project sync
sync-wrioter-stop     # Stop Wrioter main sync
sync-branch2-stop     # Stop Branch 2 sync
sync-branch3-stop     # Stop Branch 3 sync

# Stop all projects at once
sync-all-stop
```

### Checking Status

```bash
# Check individual project status
sync-wrioter-status   # Check Wrioter main status
sync-branch2-status   # Check Branch 2 status
sync-branch3-status   # Check Branch 3 status

# Check all projects status
sync-all-status
```

### Watching Sync Progress

#### Option 1: Watch Service Logs (File List Only)

Watch what files are being synced by the background service:

```bash
# Watch individual project sync logs
sync-wrioter-watch    # Watch Wrioter main sync logs
sync-branch2-watch    # Watch Branch 2 sync logs
sync-branch3-watch    # Watch Branch 3 sync logs
```

**Note:** These show file names being transferred but **not progress bars** (systemd logging doesn't support live progress display).

Press `Ctrl+C` to stop watching (the sync continues in the background).

#### Option 2: Manual Sync with Progress Bar (Recommended)

For a **real progress bar** with transfer speeds and percentages, use the manual sync commands:

```bash
# Manual sync with live progress display
sync-wrioter-manual    # Sync Wrioter main with progress bar
sync-branch2-manual    # Sync Branch 2 with progress bar
sync-branch3-manual    # Sync Branch 3 with progress bar
```

**Output shows:**
- Each file being transferred with name
- Bytes transferred and percentage complete
- Transfer speed (KB/s or MB/s)
- Files remaining (e.g., "xfr#45, to-chk=123/456")

**Example output:**
```
sending incremental file list
app/Models/User.php
       1,245  100%  856.32kB/s    0:00:00 (xfr#1, to-chk=1234/5678)
resources/views/dashboard.blade.php
      12,456  67%    2.45MB/s    0:00:01 (xfr#2, to-chk=1233/5678)
```

**When to use manual sync:**
- Initial sync to see progress
- After making many changes at once
- When you want to verify sync completed
- The automatic service handles ongoing changes

## How It Works

1. **inotifywait** monitors the local directory for any file changes (create, modify, delete, move)
2. When a change is detected, **rsync** automatically syncs the changes to the remote server
3. The service runs continuously until you stop it
4. If the service crashes, it automatically restarts after 5 seconds

## What Gets Synced

All files in your project directories are synced **except**:
- `node_modules/` - Node.js dependencies (install on server separately)
- `vendor/` - PHP/Composer dependencies (install on server separately)
- `.git/` - Git repository data
- `storage/logs/` - Laravel log files
- `storage/framework/cache/` - Laravel cache
- `storage/framework/sessions/` - Laravel sessions
- `storage/framework/views/` - Compiled views
- `.env` - Environment configuration (keep separate per environment)
- `docker-deploy.tar.gz` - Large deployment archives
- `deploy-stormweb.tar.gz` - Large deployment archives

## Sync Behavior

- **Automatic deletion**: Files deleted locally are also deleted on the remote server (`--delete` flag)
- **Compression**: Files are compressed during transfer (`-z` flag)
- **Archive mode**: Preserves permissions, timestamps, and symlinks (`-a` flag)
- **Verbose**: Shows what's being synced (`-v` flag)
- **Progress display**: Shows transfer speed and progress for each file (`--progress` flag)

## Manual Commands (Without Aliases)

If you need to use systemctl directly:

```bash
# Start services
systemctl --user start wrioter-sync
systemctl --user start wrioter-branch2-sync
systemctl --user start wrioter-branch3-sync

# Stop services
systemctl --user stop wrioter-sync
systemctl --user stop wrioter-branch2-sync
systemctl --user stop wrioter-branch3-sync

# Check status
systemctl --user status wrioter-sync
systemctl --user status wrioter-branch2-sync
systemctl --user status wrioter-branch3-sync

# View logs
journalctl --user -u wrioter-sync -f
journalctl --user -u wrioter-branch2-sync -f
journalctl --user -u wrioter-branch3-sync -f
```

## Troubleshooting

### Check if SSH is working

```bash
# Test ethernet connection (preferred)
ssh DevServerDirect

# Test WiFi connection (fallback)
ssh DevServer
```

If neither SSH connection is working, the sync won't work either. Ensure SSH is configured and you can connect without password (use SSH keys). The sync will automatically try ethernet first, then fall back to WiFi if needed.

### View sync logs in real-time

```bash
journalctl --user -u wrioter-sync -f
journalctl --user -u wrioter-branch2-sync -f
journalctl --user -u wrioter-branch3-sync -f
```

### Restart a stuck service

```bash
systemctl --user restart wrioter-sync
systemctl --user restart wrioter-branch2-sync
systemctl --user restart wrioter-branch3-sync
```

### Manually trigger a sync with progress bar

Use the manual sync aliases to force a full sync and see live progress:

```bash
sync-wrioter-manual    # Sync Wrioter main with progress display
sync-branch2-manual    # Sync Branch 2 with progress display
sync-branch3-manual    # Sync Branch 3 with progress display
```

These commands are the same as the automatic service but run in your terminal so you can see the progress bar.

### Service won't start

Check the service status for errors:
```bash
systemctl --user status wrioter-sync
```

Common issues:
- SSH not configured or password required
- Remote directory doesn't exist
- Permission issues

### Reload aliases after editing .bashrc

If you've just set up the system, reload your bash configuration:
```bash
source ~/.bashrc
```

## Service Files Location

The systemd service files are located at:
- `~/.config/systemd/user/wrioter-sync.service`
- `~/.config/systemd/user/wrioter-branch2-sync.service`
- `~/.config/systemd/user/wrioter-branch3-sync.service`

## After Modifying Service Files

If you edit any service files, reload the systemd daemon:
```bash
systemctl --user daemon-reload
systemctl --user restart wrioter-sync
systemctl --user restart wrioter-branch2-sync
systemctl --user restart wrioter-branch3-sync
```

## Best Practices

1. **Start sync when you begin development** on a project
2. **Stop sync when you're done** to save resources
3. **Don't run sync for projects you're not actively working on** (avoid running all 3 simultaneously unless needed)
4. **Watch progress during initial sync** - Use `sync-wrioter-manual` to do the first sync with a visible progress bar
5. **After initial sync, start the automatic service** - Use `sync-wrioter-start` so changes sync automatically as you work
6. **Changes sync instantly** - Subsequent syncs only transfer modified files
7. **Check status** if something seems wrong
8. **View logs** if sync appears to not be working
9. **Use separate .env files** on local and remote (they're excluded from sync)
10. **Install dependencies separately** on the remote server (node_modules, vendor are excluded)

## Performance Notes

- **Overhead**: Minimal CPU/memory when idle (inotifywait is very efficient)
- **Network**: Only changed files are transferred (rsync is incremental)
- **Initial sync**: First sync transfers entire project (~2GB), can take several minutes depending on network speed
- **Subsequent syncs**: Near-instant for small changes (only modified files are transferred)
- **Multiple projects**: You can run all three syncs simultaneously, but initial syncs will be slower due to bandwidth sharing

## Initial Setup (Already Done)

For reference, the setup included:
1. Created three systemd service files
2. Added shell aliases to `~/.bashrc`
3. Created this documentation
4. Configured automatic restart on failure

No automatic startup on boot is configured - you must manually start the services when needed.
