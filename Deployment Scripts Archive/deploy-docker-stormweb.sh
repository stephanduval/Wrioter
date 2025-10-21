#!/bin/bash

# StormWeb Docker Deployment Script
# This script deploys the application using Docker, completely bypassing CloudPanel's PHP configuration

set -e

echo "🚀 Starting Docker deployment to StormWeb..."

# Configuration
SSH_USER="sduval"
SERVER_HOST="23.180.104.108"
SITE_ROOT="/home/sduval/htdocs/stephandouglasduval.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Building Docker image locally...${NC}"

# Build the Docker image locally
docker build -t wrioter:latest .

# Save the Docker image to a tar file
echo -e "${YELLOW}💾 Saving Docker image...${NC}"
docker save wrioter:latest | gzip > wrioter-docker.tar.gz

# Get file size
FILE_SIZE=$(du -h wrioter-docker.tar.gz | cut -f1)
echo -e "${GREEN}✅ Docker image saved (${FILE_SIZE})${NC}"

# Upload the Docker image to the server
echo -e "${YELLOW}📤 Uploading Docker image to server...${NC}"
scp wrioter-docker.tar.gz ${SSH_USER}@${SERVER_HOST}:~/

# Upload docker-compose.production.yml
echo -e "${YELLOW}📤 Uploading docker-compose file...${NC}"
scp docker-compose.production.yml ${SSH_USER}@${SERVER_HOST}:~/docker-compose.yml

# Upload .env.production as .env
echo -e "${YELLOW}📤 Uploading environment file...${NC}"
scp .env.production.stormweb ${SSH_USER}@${SERVER_HOST}:~/.env

# SSH into the server and set up Docker
echo -e "${YELLOW}🔧 Setting up Docker on server...${NC}"
ssh ${SSH_USER}@${SERVER_HOST} << 'ENDSSH'
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "Docker is not installed. Please install Docker first:"
        echo "curl -fsSL https://get.docker.com -o get-docker.sh"
        echo "sudo sh get-docker.sh"
        echo "sudo usermod -aG docker $USER"
        exit 1
    fi

    # Load the Docker image
    echo "Loading Docker image..."
    gunzip -c ~/wrioter-docker.tar.gz | docker load

    # Stop existing containers
    echo "Stopping existing containers..."
    docker-compose down 2>/dev/null || true

    # Start the new containers
    echo "Starting Docker containers..."
    docker-compose up -d

    # Wait for containers to be ready
    echo "Waiting for containers to start..."
    sleep 10

    # Run migrations inside the container
    echo "Running database migrations..."
    docker exec wrioter-app php artisan migrate --force

    # Create storage link
    echo "Creating storage link..."
    docker exec wrioter-app php artisan storage:link

    # Cache configuration
    echo "Caching configuration..."
    docker exec wrioter-app php artisan config:cache
    docker exec wrioter-app php artisan route:cache
    docker exec wrioter-app php artisan view:cache

    # Show container status
    echo "Container status:"
    docker ps

    # Clean up
    rm ~/wrioter-docker.tar.gz

    echo "✅ Docker deployment complete!"
    echo "🌐 Application should be available at http://23.180.104.108:8000"
ENDSSH

# Clean up local file
rm wrioter-docker.tar.gz

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Your application is running at: http://23.180.104.108:8000${NC}"
echo -e "${YELLOW}📝 Note: To use domain name, you'll need to configure CloudPanel to proxy to port 8000${NC}"