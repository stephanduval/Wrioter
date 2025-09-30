# Docker Deployment to DigitalOcean

## Prerequisites

Your DigitalOcean server needs:
- Docker and Docker Compose installed
- Git installed
- SSH access

## Installation Steps on DigitalOcean

### 1. Install Docker
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Add current user to docker group (if not root)
usermod -aG docker $USER

# Start Docker service
systemctl enable docker
systemctl start docker

# Test Docker
docker --version
docker compose version
```

### 2. Clone and Setup Project
```bash
# Navigate to web directory
cd /var/www

# Clone project
git clone [your-repo-url] Wrioter
cd Wrioter

# Copy environment file
cp .env.docker .env

# Edit environment file for production
nano .env
```

### 3. Configure Environment
Update `.env` with production values:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://your-domain.com

DB_PASSWORD=your_secure_password
DB_DATABASE=wrioter_production

# Generate secure key
APP_KEY=base64:xxxxxxxxxxxxx
```

### 4. Deploy with Docker
```bash
# Build and start containers
docker compose build
docker compose up -d

# Install dependencies
docker compose exec laravel.test composer install --no-dev --optimize-autoloader

# Generate application key
docker compose exec laravel.test php artisan key:generate --force

# Run migrations
docker compose exec laravel.test php artisan migrate --force

# Optimize for production
docker compose exec laravel.test php artisan config:cache
docker compose exec laravel.test php artisan route:cache
docker compose exec laravel.test php artisan view:cache

# Set permissions
docker compose exec laravel.test chown -R www-data:www-data storage bootstrap/cache
```

### 5. Setup Reverse Proxy (Nginx)
Since the Docker container runs on port 8000, set up Nginx as reverse proxy:

```bash
# Install Nginx
apt install nginx -y

# Create site configuration
nano /etc/nginx/sites-available/wrioter
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/wrioter /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Automated Deployment Script

Create `deploy-production.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Wrioter to production..."

# Pull latest code
git pull origin main

# Build containers
docker compose build

# Start containers
docker compose up -d

# Install/update dependencies
docker compose exec laravel.test composer install --no-dev --optimize-autoloader

# Run migrations
docker compose exec laravel.test php artisan migrate --force

# Clear and cache configs
docker compose exec laravel.test php artisan config:cache
docker compose exec laravel.test php artisan route:cache
docker compose exec laravel.test php artisan view:cache

# Restart queue workers
docker compose restart

echo "✅ Deployment complete!"
echo "🌐 Site: http://your-domain.com"
```

Make it executable:
```bash
chmod +x deploy-production.sh
```

## Monitoring

### View logs
```bash
docker compose logs -f
```

### Check container status
```bash
docker compose ps
```

### Database backup
```bash
docker compose exec mysql mysqldump -u root -p wrioter_production > backup.sql
```

## Troubleshooting

### Container issues
```bash
# Restart all services
docker compose restart

# Rebuild containers
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database connection issues
```bash
# Check MySQL logs
docker compose logs mysql

# Connect to database
docker compose exec mysql mysql -u root -p
```

### Storage permissions
```bash
docker compose exec laravel.test chown -R www-data:www-data storage bootstrap/cache
docker compose exec laravel.test chmod -R 775 storage bootstrap/cache
```

### Memory issues on 1GB droplet
```bash
# Add swap space
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## Benefits Over Current Setup

✅ **Fixes ZipArchive Issue**: Clean PHP environment with all extensions
✅ **Consistent Dependencies**: No more version conflicts
✅ **Easy Updates**: `git pull && ./deploy-production.sh`
✅ **Isolated Environment**: Doesn't interfere with system packages
✅ **Queue Workers**: Managed by Supervisor automatically
✅ **Scalable**: Easy to move to larger servers later

## Next Steps

1. Test deployment on DigitalOcean
2. Verify all functionality works (uploads, Scrivener processing, etc.)
3. Update DNS to point to your server
4. Set up SSL with Let's Encrypt
5. Plan migration to StormWeb when ready