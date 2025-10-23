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

# Step 3: Create deployment archive (including .env.production)
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

# Also upload the systemd service files
echo -e "${YELLOW}📤 Uploading queue worker and scheduler service files...${NC}"
scp wrioter-queue.service ${SSH_USER}@${SERVER_HOST}:~/wrioter-queue.service
scp wrioter-scheduler.service ${SSH_USER}@${SERVER_HOST}:~/wrioter-scheduler.service
scp wrioter-scheduler.timer ${SSH_USER}@${SERVER_HOST}:~/wrioter-scheduler.timer

# Step 5: Execute deployment on server
echo -e "${YELLOW}🔧 Running deployment on server...${NC}"
ssh ${SSH_USER}@${SERVER_HOST} << 'ENDSSH'
    # Create backup
    echo "Creating backup..."
    mkdir -p ~/backups
    if [ -d "/home/sduval/htdocs/stephandouglasduval.com" ]; then
        tar -czf ~/backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C /home/sduval/htdocs/stephandouglasduval.com .
    fi

    # Extract new deployment (Laravel files go in site root, NOT in public)
    echo "Extracting deployment..."
    cd /home/sduval/htdocs/stephandouglasduval.com
    tar -xzf ~/deploy.tar.gz
    rm ~/deploy.tar.gz

    # Set up .env file from .env.production.stormweb
    echo "Setting up environment..."
    if [ -f .env.production.stormweb ]; then
        cp .env.production.stormweb .env
        echo "✅ Environment file configured"
    else
        echo "⚠️ Warning: .env.production.stormweb not found!"
    fi

    # Set permissions
    echo "Setting permissions..."
    chmod -R 755 storage bootstrap/cache
    chown -R ${USER}:${USER} storage bootstrap/cache

    # Run Laravel commands
    echo "Running Laravel setup..."
    php artisan migrate --force
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan storage:link

    # Install queue worker and scheduler services (requires sudo)
    echo "Setting up queue worker and scheduler..."
    if [ -f ~/wrioter-queue.service ]; then
        echo "Queue worker service file found. To install:"
        echo "1. Ask your hosting provider to install the systemd services"
        echo "2. Or run: sudo cp ~/wrioter-queue.service /etc/systemd/system/"
        echo "3. Then: sudo systemctl daemon-reload && sudo systemctl enable wrioter-queue && sudo systemctl start wrioter-queue"
    fi

    if [ -f ~/wrioter-scheduler.service ] && [ -f ~/wrioter-scheduler.timer ]; then
        echo "Scheduler service files found. To install:"
        echo "1. sudo cp ~/wrioter-scheduler.service ~/wrioter-scheduler.timer /etc/systemd/system/"
        echo "2. sudo systemctl daemon-reload"
        echo "3. sudo systemctl enable wrioter-scheduler.timer"
        echo "4. sudo systemctl start wrioter-scheduler.timer"
        echo ""
        echo "Alternative: Add to crontab instead:"
        echo "* * * * * cd /home/sduval/htdocs/stephandouglasduval.com && php artisan schedule:run >> /dev/null 2>&1"
    fi

    # Try to restart queue if already running
    php artisan queue:restart 2>/dev/null || true

    echo "✅ Deployment complete!"
    echo ""
    echo "⚠️ IMPORTANT: Queue worker and scheduler setup required!"
    echo "1. Queue worker - needed for processing imports"
    echo "2. Scheduler - needed for cleaning up old import files"
    echo ""
    echo "Contact your hosting provider to set up the systemd services,"
    echo "or run the queue worker in a screen/tmux session:"
    echo "php /home/sduval/htdocs/stephandouglasduval.com/artisan queue:work --sleep=3 --tries=3 --timeout=3600"
ENDSSH

# Step 6: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm deploy.tar.gz

echo -e "${GREEN}✅ Deployment to StormWeb complete!${NC}"
echo -e "Visit: https://${DOMAIN}"
echo ""
echo -e "${YELLOW}⚠️ IMPORTANT NEXT STEPS:${NC}"
echo "1. The .env file has been updated with correct domain settings"
echo "2. Queue worker needs to be set up for import processing to work"
echo "3. Scheduler needs to be set up for cleanup tasks to run"
echo "4. Contact hosting provider or manually configure services"