#!/bin/bash

# StormWeb Rollback Script
# Quickly restore to previous backup

# Configuration
SERVER_HOST="23.180.104.108"
SSH_USER="wrioter" # Update with your CloudPanel site user
DOMAIN="stephandouglasduval.com"
SITE_ROOT="/home/${SSH_USER}/htdocs/${DOMAIN}"
BACKUP_DIR="/home/${SSH_USER}/backups"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🔄 StormWeb Rollback Utility${NC}"
echo "Server: $SERVER_HOST"
echo "Site: $DOMAIN"
echo ""

# Connect to server and list backups
echo -e "${YELLOW}📋 Available backups:${NC}"
ssh ${SSH_USER}@${SERVER_HOST} << 'ENDSSH'
    ls -lht ~/backups/*.tar.gz 2>/dev/null | head -10 | awk '{print NR". "$9" ("$5")"}'
ENDSSH

echo ""
read -p "Enter backup number to restore (or 'q' to quit): " CHOICE

if [[ $CHOICE == "q" ]]; then
    echo "Rollback cancelled."
    exit 0
fi

# Perform rollback
echo -e "${YELLOW}⏮️ Starting rollback...${NC}"
ssh ${SSH_USER}@${SERVER_HOST} << ENDSSH
    # Get backup filename
    BACKUP_FILE=\$(ls -t ~/backups/*.tar.gz | sed -n "${CHOICE}p")

    if [ -z "\$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Invalid backup selection${NC}"
        exit 1
    fi

    echo "Restoring from: \$BACKUP_FILE"

    # Create current backup before rollback
    echo "Creating safety backup of current state..."
    cd ${SITE_ROOT}
    tar -czf ~/backups/pre-rollback-\$(date +%Y%m%d-%H%M%S).tar.gz .

    # Clear current files except storage
    echo "Clearing current deployment..."
    find . -mindepth 1 -maxdepth 1 ! -name 'storage' -exec rm -rf {} \;

    # Extract backup
    echo "Extracting backup..."
    tar -xzf \$BACKUP_FILE

    # Run Laravel commands
    echo "Running Laravel setup..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan queue:restart

    echo "✅ Rollback complete!"
ENDSSH

echo -e "${GREEN}✅ Rollback completed successfully!${NC}"
echo "Site restored from backup."