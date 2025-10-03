#!/bin/bash

# Create backup directory with timestamp
BACKUP_BASE="/home/rogers/Code/Wrioter_gitIgnored_backups"
BACKUP_DIR="$BACKUP_BASE/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Backing up gitignored files to $BACKUP_DIR..."

# Method 1: Using git ls-files to find ignored files
git ls-files --others --ignored --exclude-standard | while read -r file; do
    if [ -e "$file" ]; then
        # Create directory structure in backup
        mkdir -p "$BACKUP_DIR/$(dirname "$file")"
        cp -r "$file" "$BACKUP_DIR/$file" 2>/dev/null
    fi
done

echo "Backup created in: $BACKUP_DIR"
echo "Total size: $(du -sh $BACKUP_DIR | cut -f1)"

# Optionally create a tar archive
read -p "Create compressed archive? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    tar -czf "${BACKUP_DIR}.tar.gz" -C "$BACKUP_BASE" "$(basename $BACKUP_DIR)"
    echo "Archive created: ${BACKUP_DIR}.tar.gz"
    echo "Archive size: $(du -h ${BACKUP_DIR}.tar.gz | cut -f1)"
fi
