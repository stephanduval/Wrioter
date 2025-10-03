#!/bin/bash

# StormWeb CloudPanel Deployment Script using Rsync
# Server: 23.180.104.108
# Domain: stephandouglasduval.com

# Configuration
SERVER_HOST="23.180.104.108"
SSH_USER="sduval"
DOMAIN="stephandouglasduval.com"
SITE_ROOT="/home/sduval/htdocs/${DOMAIN}"
WEB_ROOT="${SITE_ROOT}/public"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying to StormWeb CloudPanel (Rsync Method)${NC}"
echo "Server: $SERVER_HOST"
echo "Domain: $DOMAIN"
echo "Laravel Root: $SITE_ROOT"
echo ""

# Step 1: Build assets locally
echo -e "${YELLOW}📦 Building assets locally...${NC}"
yarn install
yarn build

# Step 2: Create backup on server
echo -e "${YELLOW}💾 Creating backup on server...${NC}"
ssh ${SSH_USER}@${SERVER_HOST} << 'ENDSSH'
    SITE_ROOT="/home/sduval/htdocs/stephandouglasduval.com"
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)

    mkdir -p ~/backups
    if [ -d "${SITE_ROOT}" ] && [ "$(ls -A ${SITE_ROOT})" ]; then
        tar -czf ~/backups/backup-${TIMESTAMP}.tar.gz -C ${SITE_ROOT} . 2>/dev/null || true
        echo "Backup created: backup-${TIMESTAMP}.tar.gz"
    fi
ENDSSH

# Step 3: Sync files using rsync (excluding unnecessary files)
echo -e "${YELLOW}📤 Syncing files to server...${NC}"
rsync -avz --delete \
    --exclude='node_modules/' \
    --exclude='.git/' \
    --exclude='.env' \
    --exclude='.env.testing' \
    --exclude='.env.local' \
    --exclude='storage/app/public/*' \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/data/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='tests/' \
    --exclude='cypress/' \
    --exclude='playwright*' \
    --exclude='docker*' \
    --exclude='Dockerfile*' \
    --exclude='.deployignore' \
    --exclude='*.md' \
    --exclude='.claude/' \
    --exclude='deploy*.sh' \
    --exclude='vendor/' \
    --exclude='deploy.tar.gz' \
    --exclude='.DS_Store' \
    --exclude='Thumbs.db' \
    ./ ${SSH_USER}@${SERVER_HOST}:${SITE_ROOT}/

# Step 4: Install composer dependencies on server
echo -e "${YELLOW}🔧 Installing dependencies on server...${NC}"
ssh ${SSH_USER}@${SERVER_HOST} << 'ENDSSH'
    set -e

    SITE_ROOT="/home/sduval/htdocs/stephandouglasduval.com"
    cd ${SITE_ROOT}

    # Install composer dependencies
    echo "Installing PHP dependencies..."
    composer install --no-dev --optimize-autoloader

    # Check if .env exists, if not copy from example
    if [ ! -f "${SITE_ROOT}/.env" ]; then
        if [ -f "${SITE_ROOT}/.env.stormweb" ]; then
            echo "Creating .env from .env.stormweb..."
            cp ${SITE_ROOT}/.env.stormweb ${SITE_ROOT}/.env
            echo ""
            echo "⚠️  IMPORTANT: Update .env with your database credentials!"
            echo "Run: nano ${SITE_ROOT}/.env"
        elif [ -f "${SITE_ROOT}/.env.example" ]; then
            echo "Creating .env from .env.example..."
            cp ${SITE_ROOT}/.env.example ${SITE_ROOT}/.env
            echo ""
            echo "⚠️  IMPORTANT: Update .env with your database credentials!"
        fi
    fi

    # Set permissions for CloudPanel
    echo "Setting permissions..."
    chmod -R 755 ${SITE_ROOT}
    chmod -R 775 ${SITE_ROOT}/storage
    chmod -R 775 ${SITE_ROOT}/bootstrap/cache

    # Generate key if not exists
    if [ -f .env ]; then
        if grep -q "^APP_KEY=$" .env || grep -q "^APP_KEY=base64:YOUR_APP_KEY_HERE" .env; then
            php artisan key:generate
        fi
    fi

    # Create storage directories if they don't exist
    mkdir -p storage/framework/cache/data
    mkdir -p storage/framework/sessions
    mkdir -p storage/framework/views
    mkdir -p storage/logs
    mkdir -p storage/app/public

    # Clear and rebuild caches
    echo "Clearing caches..."
    php artisan config:clear
    php artisan cache:clear
    php artisan route:clear
    php artisan view:clear

    # Check database connection before running migrations
    echo "Checking database connection..."
    php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'Database connection successful!'; } catch (Exception \$e) { echo 'Database connection failed. Please update .env file with correct credentials.'; exit(1); }" || {
        echo ""
        echo "⚠️  Database not configured. Please:"
        echo "1. SSH to server: ssh ${USER}@$(hostname -I | awk '{print $1}')"
        echo "2. Edit .env file: nano ${SITE_ROOT}/.env"
        echo "3. Update database credentials from CloudPanel"
        echo "4. Run: php artisan migrate --force"
        exit 0
    }

    # Run migrations if database is configured
    echo "Running migrations..."
    php artisan migrate --force

    # Cache configuration
    echo "Caching configuration..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    # Create storage link
    echo "Creating storage link..."
    php artisan storage:link --force

    # Restart queue if running
    php artisan queue:restart 2>/dev/null || true

    echo ""
    echo "✅ Deployment complete!"
ENDSSH

echo ""
echo -e "${GREEN}✅ Deployment to StormWeb CloudPanel complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. If database is not configured:"
echo "   ssh ${SSH_USER}@${SERVER_HOST}"
echo "   nano ${SITE_ROOT}/.env"
echo "   (Update DB_DATABASE, DB_USERNAME, DB_PASSWORD from CloudPanel)"
echo ""
echo "2. Run migrations if needed:"
echo "   php artisan migrate --force"
echo ""
echo "3. Set up queue workers for file processing"
echo ""
echo "4. Visit: https://${DOMAIN}"