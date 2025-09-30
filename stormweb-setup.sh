#!/bin/bash

# First-time setup script for StormWeb CloudPanel
# Run this after creating the site in CloudPanel

# Configuration
SERVER_HOST="23.180.104.108"
SSH_USER="sduval" # CloudPanel site user
DOMAIN="stephandouglasduval.com"
SITE_ROOT="/home/${SSH_USER}/htdocs/${DOMAIN}"
WEB_ROOT="${SITE_ROOT}/public"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}StormWeb CloudPanel Initial Setup${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""

# Step 1: Get CloudPanel details
echo -e "${YELLOW}Please provide the following information from CloudPanel:${NC}"
echo ""

read -p "Site User (created in CloudPanel): " SSH_USER
read -p "Database Name (from CloudPanel): " DB_NAME
read -p "Database Username (from CloudPanel): " DB_USER
read -sp "Database Password (from CloudPanel): " DB_PASS
echo ""
read -sp "Site User SSH Password (for initial setup): " SSH_PASS
echo ""

# Update configuration
SITE_ROOT="/home/${SSH_USER}/htdocs/${DOMAIN}"
WEB_ROOT="${SITE_ROOT}/public"

echo ""
echo -e "${GREEN}Configuration Summary:${NC}"
echo "Server: $SERVER_HOST"
echo "User: $SSH_USER"
echo "Domain: $DOMAIN"
echo "Database: $DB_NAME"
echo "Laravel Root: $SITE_ROOT"
echo "Public Root: $WEB_ROOT"
echo ""

read -p "Continue with setup? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Step 2: Generate application key
echo -e "${YELLOW}🔑 Generating Laravel application key...${NC}"
APP_KEY=$(php artisan key:generate --show)

# Step 3: Create production .env file
echo -e "${YELLOW}📝 Creating production .env file...${NC}"
cat > .env.production.temp << EOF
APP_NAME="Wrioter"
APP_ENV=production
APP_KEY=${APP_KEY}
APP_DEBUG=false
APP_TIMEZONE=UTC
APP_URL=https://${DOMAIN}

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=${DOMAIN}

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=wrioter_cache_

MAIL_MAILER=log
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@${DOMAIN}"
MAIL_FROM_NAME="Wrioter"

VITE_APP_NAME="Wrioter"

SEEDER_DEFAULT_PASSWORD="ChangeMe2024!"

SECURE_COOKIES=true
SESSION_SECURE_COOKIE=true
EOF

# Step 4: Initial deployment
echo -e "${YELLOW}📦 Building application...${NC}"
yarn install
yarn build
composer install --no-dev --optimize-autoloader

# Step 5: Create deployment
echo -e "${YELLOW}📤 Deploying to StormWeb...${NC}"
tar -czf initial-deploy.tar.gz \
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
    --exclude=docker* \
    .

# Step 6: Upload and setup
echo -e "${YELLOW}🚀 Uploading to server...${NC}"
sshpass -p "$SSH_PASS" scp initial-deploy.tar.gz .env.production.temp ${SSH_USER}@${SERVER_HOST}:~/

echo -e "${YELLOW}🔧 Running server setup...${NC}"
sshpass -p "$SSH_PASS" ssh ${SSH_USER}@${SERVER_HOST} << ENDSSH
    # Extract files to Laravel root (NOT in public)
    cd ${SITE_ROOT}
    tar -xzf ~/initial-deploy.tar.gz
    mv ~/.env.production.temp .env
    rm ~/initial-deploy.tar.gz

    # Create required directories
    mkdir -p storage/app/public
    mkdir -p storage/framework/{cache,sessions,views}
    mkdir -p bootstrap/cache

    # Set permissions
    chmod -R 775 storage bootstrap/cache

    # Install composer dependencies if not included
    if [ ! -d "vendor" ]; then
        composer install --no-dev --optimize-autoloader
    fi

    # Run Laravel setup
    php artisan migrate --force
    php artisan storage:link
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    # Create first admin user
    php artisan db:seed --class=UserSeeder --force

    echo "✅ Initial setup complete!"
ENDSSH

# Step 7: Save configuration
echo -e "${YELLOW}💾 Saving configuration...${NC}"
cat > .stormweb-config << EOF
SERVER_HOST="${SERVER_HOST}"
SSH_USER="${SSH_USER}"
DOMAIN="${DOMAIN}"
WEB_ROOT="${WEB_ROOT}"
DB_NAME="${DB_NAME}"
DB_USER="${DB_USER}"
EOF

# Cleanup
rm -f initial-deploy.tar.gz .env.production.temp

echo -e "${GREEN}✅ StormWeb setup complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Set up SSH key authentication:"
echo "   ssh-copy-id ${SSH_USER}@${SERVER_HOST}"
echo ""
echo "2. Update mail settings in production .env file"
echo ""
echo "3. Configure CloudPanel SSL certificate for ${DOMAIN}"
echo ""
echo "4. Test the application at https://${DOMAIN}"
echo ""
echo "5. Use './deploy-stormweb.sh' for future deployments"
echo ""
echo -e "${YELLOW}Default admin credentials:${NC}"
echo "Email: info@freynet-gagne.com"
echo "Password: ChangeMe2024!"
echo ""