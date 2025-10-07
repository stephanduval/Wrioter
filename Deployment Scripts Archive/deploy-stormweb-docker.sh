#!/bin/bash

# StormWeb Docker Deployment Script
# Uses root access to install Docker and deploy containers

# Configuration
SERVER_HOST="23.180.104.108"
ROOT_USER="root"
DOMAIN="stephandouglasduval.com"
APP_DIR="/opt/wrioter"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🐳 StormWeb Docker Deployment${NC}"
echo "Server: $SERVER_HOST"
echo "Domain: $DOMAIN"
echo "Deploy Path: $APP_DIR"
echo ""

# Step 1: Build locally first (for speed)
echo -e "${YELLOW}📦 Building assets locally...${NC}"
yarn install
yarn build
composer install --no-dev --optimize-autoloader

# Step 2: Create deployment package
echo -e "${YELLOW}📁 Creating deployment package...${NC}"
tar -czf docker-deploy.tar.gz \
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
    .

# Step 3: Upload to server
echo -e "${YELLOW}📤 Uploading to StormWeb...${NC}"
scp docker-deploy.tar.gz docker-compose.yml .env.docker ${ROOT_USER}@${SERVER_HOST}:~/

# Step 4: Install Docker and deploy
echo -e "${YELLOW}🔧 Installing Docker and deploying...${NC}"
ssh ${ROOT_USER}@${SERVER_HOST} << ENDSSH
    echo "📦 Installing Docker..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sh get-docker.sh
        systemctl enable docker
        systemctl start docker
        rm get-docker.sh
    fi

    echo "✅ Docker installed: \$(docker --version)"

    echo "📁 Setting up application directory..."
    mkdir -p ${APP_DIR}
    cd ${APP_DIR}

    # Backup existing if present
    if [ -f "docker-compose.yml" ]; then
        echo "📦 Creating backup..."
        docker compose down || true
        tar -czf backup-\$(date +%Y%m%d-%H%M%S).tar.gz . || true
    fi

    # Extract new deployment
    echo "📤 Extracting deployment..."
    tar -xzf ~/docker-deploy.tar.gz
    mv ~/docker-compose.yml .
    mv ~/.env.docker .env
    rm ~/docker-deploy.tar.gz

    # Update environment for production
    echo "⚙️ Configuring environment..."
    sed -i "s|APP_URL=.*|APP_URL=https://${DOMAIN}|g" .env
    sed -i "s|APP_ENV=.*|APP_ENV=production|g" .env
    sed -i "s|APP_DEBUG=.*|APP_DEBUG=false|g" .env

    # Generate app key if not set
    if ! grep -q "APP_KEY=base64:" .env; then
        echo "🔑 Generating application key..."
        docker run --rm -v \$(pwd):/var/www/html -w /var/www/html \
            php:8.3-cli php artisan key:generate --force --no-interaction
    fi

    echo "🚀 Starting Docker containers..."
    docker compose up -d

    # Wait for containers to be ready
    echo "⏳ Waiting for containers to start..."
    sleep 30

    echo "🗄️ Running database migrations..."
    docker compose exec -T laravel.test php artisan migrate --force

    echo "🌱 Seeding database..."
    docker compose exec -T laravel.test php artisan db:seed --force --class=UserSeeder

    echo "⚡ Optimizing for production..."
    docker compose exec -T laravel.test php artisan config:cache
    docker compose exec -T laravel.test php artisan route:cache
    docker compose exec -T laravel.test php artisan view:cache
    docker compose exec -T laravel.test php artisan storage:link

    echo "🔧 Setting up reverse proxy..."
    # Install nginx if not present
    if ! command -v nginx &> /dev/null; then
        apt update
        apt install nginx -y
    fi

    # Create nginx site
    cat > /etc/nginx/sites-available/${DOMAIN} << 'EOF'
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx

    echo "✅ Docker deployment complete!"
    echo "🌐 Application running at: http://${DOMAIN}"
    echo "📊 Container status:"
    docker compose ps
ENDSSH

# Step 5: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm docker-deploy.tar.gz

echo -e "${GREEN}✅ StormWeb Docker deployment complete!${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Test the application: http://${DOMAIN}"
echo "2. Set up SSL certificate"
echo "3. Configure DNS to point to ${SERVER_HOST}"
echo ""
echo -e "${YELLOW}Default admin credentials:${NC}"
echo "Email: info@freynet-gagne.com"
echo "Password: ChangeMe2024!"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "ssh root@${SERVER_HOST} 'cd ${APP_DIR} && docker compose ps'"
echo "ssh root@${SERVER_HOST} 'cd ${APP_DIR} && docker compose logs -f'"