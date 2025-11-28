#!/bin/bash

# Create backup directory with timestamp
BACKUP_BASE="/home/sduval/Code/Wrioter_gitIgnored_backups"
BACKUP_DIR="$BACKUP_BASE/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Backing up docs folder and .env files to $BACKUP_DIR..."

# Copy docs folder if it exists
if [ -d "docs" ]; then
    echo "Copying docs folder..."
    cp -r docs "$BACKUP_DIR/docs"
fi

# Copy all .env* files
echo "Copying .env files..."
for env_file in .env*; do
    if [ -f "$env_file" ]; then
        cp "$env_file" "$BACKUP_DIR/"
        echo "  - Copied $env_file"
    fi
done

# Create tar.gz archive
echo "Creating archive..."
tar -czf "${BACKUP_DIR}.tar.gz" -C "$BACKUP_BASE" "$(basename $BACKUP_DIR)"

# Remove the uncompressed backup directory
rm -rf "$BACKUP_DIR"

echo ""
echo "Backup completed: ${BACKUP_DIR}.tar.gz"
echo "Size: $(du -h ${BACKUP_DIR}.tar.gz | cut -f1)"
