#!/bin/bash

# Docker Setup Script for Wrioter
echo "🐳 Setting up Wrioter Docker environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please ensure Docker includes Compose v2."
    exit 1
fi

# Copy environment file for Docker
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.docker template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file and set your APP_KEY and other required values"
else
    echo "✅ .env file already exists"
fi

# Build and start containers
echo "🔨 Building Docker containers..."
docker compose build

echo "🚀 Starting Docker containers..."
docker compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 30

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
docker compose exec laravel.test composer install

# Install Node dependencies
echo "📦 Installing Node dependencies..."
docker compose exec laravel.test yarn install

# Generate application key if not done yet
echo "🔑 Generating Laravel application key..."
docker compose exec laravel.test php artisan key:generate --force

# Run migrations
echo "🗄️  Running database migrations..."
docker compose exec laravel.test php artisan migrate --force

# Seed database
echo "🌱 Seeding database..."
docker compose exec laravel.test php artisan db:seed --force

# Clear caches
echo "🧹 Clearing caches..."
docker compose exec laravel.test php artisan config:clear
docker compose exec laravel.test php artisan cache:clear
docker compose exec laravel.test php artisan route:clear
docker compose exec laravel.test php artisan view:clear

# Set permissions
echo "🔐 Setting permissions..."
docker compose exec laravel.test chown -R www-data:www-data /var/www/html/storage
docker compose exec laravel.test chown -R www-data:www-data /var/www/html/bootstrap/cache

echo ""
echo "✅ Docker setup complete!"
echo ""
echo "🌐 Your application is running at: http://localhost:8000"
echo "🗄️  MySQL is available at: localhost:3307"
echo "🔴 Redis is available at: localhost:6380"
echo ""
echo "📝 Useful commands:"
echo "  yarn docker:up      - Start containers"
echo "  yarn docker:down    - Stop containers"
echo "  yarn docker:logs    - View logs"
echo "  yarn docker:shell   - Open shell in app container"
echo "  yarn docker:artisan - Run artisan commands"
echo ""