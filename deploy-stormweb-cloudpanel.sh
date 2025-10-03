#!/bin/bash

# StormWeb CloudPanel Deployment Script
# Server: 23.180.104.108
# Domain: stephandouglasduval.com

# Configuration
SERVER_HOST="23.180.104.108"
SSH_USER="sduval"
DOMAIN="stephandouglasduval.com"
SITE_ROOT="/home/sduval/htdocs/${DOMAIN}"
WEB_ROOT="${SITE_ROOT}/public"
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
    --exclude=deploy.tar.gz \
    --exclude=.deployignore \
    --exclude='*.md' \
    --exclude=.claude \
    .

# Step 4: Upload to server
echo -e "${YELLOW}📤 Uploading to StormWeb...${NC}"
scp deploy.tar.gz ${SSH_USER}@${SERVER_HOST}:~/deploy.tar.gz

# Step 5: Execute deployment on server
echo -e "${YELLOW}🔧 Running deployment on server...${NC}"
ssh ${SSH_USER}@${SERVER_HOST} << 'ENDSSH'
    set -e

    # Variables
    SITE_ROOT="/home/sduval/htdocs/stephandouglasduval.com"
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)

    # Create backup
    echo "Creating backup..."
    mkdir -p ~/backups
    if [ -d "${SITE_ROOT}" ] && [ "$(ls -A ${SITE_ROOT})" ]; then
        tar -czf ~/backups/backup-${TIMESTAMP}.tar.gz -C ${SITE_ROOT} . 2>/dev/null || true
        echo "Backup created: backup-${TIMESTAMP}.tar.gz"
    fi

    # Extract new deployment
    echo "Extracting deployment..."
    cd ${SITE_ROOT}
    tar -xzf ~/deploy.tar.gz
    rm ~/deploy.tar.gz

    # Check if .env exists, if not copy from example
    if [ ! -f "${SITE_ROOT}/.env" ]; then
        if [ -f "${SITE_ROOT}/.env.stormweb" ]; then
            echo "Creating .env from .env.stormweb..."
            cp ${SITE_ROOT}/.env.stormweb ${SITE_ROOT}/.env
            echo "NOTE: Please update the .env file with your database credentials!"
        elif [ -f "${SITE_ROOT}/.env.example" ]; then
            echo "Creating .env from .env.example..."
            cp ${SITE_ROOT}/.env.example ${SITE_ROOT}/.env
            echo "NOTE: Please update the .env file with your database credentials!"
        fi
    fi

    # Set permissions for CloudPanel
    echo "Setting permissions..."
    chmod -R 755 ${SITE_ROOT}
    chmod -R 775 ${SITE_ROOT}/storage
    chmod -R 775 ${SITE_ROOT}/bootstrap/cache

    # Run Laravel commands
    echo "Running Laravel setup..."
    cd ${SITE_ROOT}

    # Generate key if not exists
    if grep -q "^APP_KEY=$" .env || grep -q "^APP_KEY=base64:YOUR_APP_KEY_HERE" .env; then
        php artisan key:generate
    fi

    # Run migrations
    php artisan migrate --force

    # Cache configuration
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    # Create storage link
    php artisan storage:link --force

    # Restart queue if running
    php artisan queue:restart 2>/dev/null || true

    echo "✅ Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with CloudPanel database credentials"
    echo "2. Set up queue workers for file processing"
    echo "3. Test the site at https://stephandouglasduval.com"
ENDSSH

# Step 6: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -f deploy.tar.gz

echo -e "${GREEN}✅ Deployment to StormWeb CloudPanel complete!${NC}"
echo ""
echo -e "${YELLOW}Important reminders:${NC}"
echo "1. SSH to server and update .env with database credentials"
echo "   ssh ${SSH_USER}@${SERVER_HOST}"
echo "   nano ${SITE_ROOT}/.env"
echo ""
echo "2. Set up queue workers for file processing"
echo "3. Visit: https://${DOMAIN}"