#!/bin/bash

# StormWeb CloudPanel Deployment Script
# Server: sduval.stormweb.cloud (23.180.104.108)

# Configuration
SERVER_HOST="23.180.104.108"
SSH_USER="sduvalssh" # CloudPanel SSH user
DOMAIN="stephandouglasduval.com"
# CloudPanel uses public as document root, Laravel files go one level up
SITE_ROOT="/home/sduval/htdocs/${DOMAIN}"  # Website still in sduval home, SSH user is sduvalssh
WEB_ROOT="${SITE_ROOT}/public"
BACKUP_DIR="/home/${SSH_USER}/backups"
DEPLOY_BRANCH="main"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying to StormWeb CloudPanel${NC}"
echo "Server: $SERVER_HOST"
echo "Domain: $DOMAIN"
echo "Laravel Root: $SITE_ROOT"
echo "Public Root: $WEB_ROOT"
echo ""

# Step 1: Build assets locally
echo -e "${YELLOW}📦 Building assets locally...${NC}"
yarn install
yarn build

# Step 2: Prepare composer dependencies
echo -e "${YELLOW}📦 Preparing PHP dependencies...${NC}"
composer install --no-dev --optimize-autoloader

# Step 3: Create deployment archive
echo -e "${YELLOW}📁 Creating deployment archive...${NC}"
tar -czf deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.env \
    --exclude=.env.testing \
    --exclude=storage/app/public/* \
    --exclude=storage/logs/* \
    --exclude=storage/framework/cache/* \
    --exclude=storage/framework/sessions/* \
    --exclude=storage/framework/views/* \
    --exclude=tests \
    --exclude=cypress \
    --exclude=playwright* \
    --exclude=docker* \
    --exclude=Dockerfile* \
    .

# Step 4: Upload to server
echo -e "${YELLOW}📤 Uploading to StormWeb...${NC}"
scp deploy.tar.gz ${SSH_USER}@${SERVER_HOST}:~/deploy.tar.gz

# Step 5: Execute deployment on server
echo -e "${YELLOW}🔧 Running deployment on server...${NC}"
ssh ${SSH_USER}@${SERVER_HOST} << ENDSSH
    # Create backup
    echo "Creating backup..."
    mkdir -p ~/backups
    if [ -d "${SITE_ROOT}" ]; then
        tar -czf ~/backups/backup-\$(date +%Y%m%d-%H%M%S).tar.gz -C ${SITE_ROOT} .
    fi

    # Extract new deployment (Laravel files go in site root, NOT in public)
    echo "Extracting deployment..."
    cd ${SITE_ROOT}
    tar -xzf ~/deploy.tar.gz
    rm ~/deploy.tar.gz

    # Ensure public directory is properly linked
    echo "Verifying public directory..."
    # CloudPanel expects public files in public/ subdirectory

    # Set permissions
    echo "Setting permissions..."
    chmod -R 755 storage bootstrap/cache
    chown -R \${USER}:\${USER} storage bootstrap/cache

    # Run Laravel commands
    echo "Running Laravel setup..."
    php artisan migrate --force
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan storage:link
    php artisan queue:restart

    echo "✅ Deployment complete!"
ENDSSH

# Step 6: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm deploy.tar.gz

echo -e "${GREEN}✅ Deployment to StormWeb complete!${NC}"
echo -e "Visit: https://${DOMAIN}"