# Wrioter Production Deployment Guide

## Server Information
- **Server IP**: 138.197.142.132
- **Server OS**: Ubuntu 24.10 with Apache
- **Project Directory**: `/var/www/enter.project.name.here`
- **SSH Access**: `ssh -i ~/.ssh/id_rsa root@138.197.142.132`

## Deployment Scripts

### Available Commands

#### From Local Machine:
```bash
# Deploy only frontend build files
yarn deploy:prod

# Deploy entire application (excluding files in .deployignore)
yarn deploy:full

# Deploy debug scripts
yarn deploy:debug
```

#### On Production Server:
```bash
# Fresh database with seeds (CAUTION: Destroys all data)
yarn db:fresh:prod

# Run migrations only (for updates)
yarn db:migrate:prod
```

## First-Time Production Setup

### 1. Prepare Production Environment

```bash
# SSH into server
ssh -i ~/.ssh/id_rsa root@138.197.142.132

# Navigate to project directory
cd /var/www/enter.project.name.here

# Create database and user (run as MySQL root)
mysql -u root -p
```

```sql
CREATE DATABASE wrioter_production;
CREATE USER 'wrioter_prod'@'localhost' IDENTIFIED BY 'YourSecurePasswordHere';
GRANT ALL PRIVILEGES ON wrioter_production.* TO 'wrioter_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Deploy Application

```bash
# From local machine
yarn deploy:full
```

### 3. Server Configuration

```bash
# SSH into server
ssh -i ~/.ssh/id_rsa root@138.197.142.132
cd /var/www/enter.project.name.here

# Install dependencies
composer install --optimize-autoloader --no-dev

# Copy and configure environment file
cp .env.production .env
# Edit .env file to set correct database credentials and domain

# Generate application key
php artisan key:generate

# Run initial migrations and seeders
php artisan migrate --force
php artisan db:seed --force

# Create storage symlink
php artisan storage:link

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chown -R www-data:www-data /var/www/enter.project.name.here
chmod -R 755 /var/www/enter.project.name.here
chmod -R 775 /var/www/enter.project.name.here/storage
chmod -R 775 /var/www/enter.project.name.here/bootstrap/cache
```

### 4. Queue Worker Setup (REQUIRED for file processing)

Create systemd service file:
```bash
sudo nano /etc/systemd/system/wrioter-queue.service
```

Add the following content:
```ini
[Unit]
Description=Wrioter Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/enter.project.name.here/artisan queue:work --sleep=3 --tries=3 --max-time=3600
WorkingDirectory=/var/www/enter.project.name.here
StandardOutput=append:/var/log/wrioter-queue.log
StandardError=append:/var/log/wrioter-queue-error.log

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable wrioter-queue.service
sudo systemctl start wrioter-queue.service
sudo systemctl status wrioter-queue.service
```

### 5. Apache Configuration

Create virtual host configuration:
```bash
sudo nano /etc/apache2/sites-available/wrioter.conf
```

Add configuration:
```apache
<VirtualHost *:80>
    ServerName your-production-domain.com
    DocumentRoot /var/www/enter.project.name.here/public

    <Directory /var/www/enter.project.name.here/public>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/wrioter-error.log
    CustomLog ${APACHE_LOG_DIR}/wrioter-access.log combined
</VirtualHost>
```

Enable site and reload Apache:
```bash
sudo a2ensite wrioter.conf
sudo a2enmod rewrite
sudo systemctl reload apache2
```

## Subsequent Deployments

### Standard Update Process
```bash
# From local machine
yarn deploy:full

# On production server
ssh -i ~/.ssh/id_rsa root@138.197.142.132
cd /var/www/enter.project.name.here

# Run migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers
php artisan queue:restart
```

### Frontend-Only Update
```bash
# From local machine
yarn deploy:prod
```

## Monitoring and Maintenance

### Check Queue Status
```bash
# View failed jobs
php artisan queue:failed

# Monitor queue
php artisan queue:monitor

# Restart workers after code changes
php artisan queue:restart
```

### View Logs
```bash
# Laravel logs
tail -f /var/www/enter.project.name.here/storage/logs/laravel.log

# Queue worker logs
tail -f /var/log/wrioter-queue.log
tail -f /var/log/wrioter-queue-error.log

# Apache logs
tail -f /var/log/apache2/wrioter-error.log
tail -f /var/log/apache2/wrioter-access.log
```

### Clear Caches (if issues arise)
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Important Notes

1. **Always backup the database before running migrations**
   ```bash
   mysqldump -u wrioter_prod -p wrioter_production > backup_$(date +%Y%m%d).sql
   ```

2. **Environment Variables**: Never commit `.env` files. Update production `.env` manually on the server.

3. **Queue Workers**: Must be running for file imports (Scrivener) to work properly.

4. **SSL Certificate**: Set up Let's Encrypt for HTTPS:
   ```bash
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d your-production-domain.com
   ```

5. **Replace Placeholders**:
   - Change `enter.project.name.here` to your actual project directory name
   - Change `your-production-domain.com` to your actual domain
   - Change database passwords to secure values
   - Update mail configuration as needed

## Troubleshooting

### Permission Issues
```bash
sudo chown -R www-data:www-data /var/www/enter.project.name.here
sudo chmod -R 755 /var/www/enter.project.name.here
sudo chmod -R 775 /var/www/enter.project.name.here/storage
sudo chmod -R 775 /var/www/enter.project.name.here/bootstrap/cache
```

### Queue Not Processing
```bash
# Check if service is running
sudo systemctl status wrioter-queue.service

# Restart service
sudo systemctl restart wrioter-queue.service

# Check logs
journalctl -u wrioter-queue.service -f
```

### Database Connection Issues
- Verify `.env` database credentials
- Check MySQL is running: `sudo systemctl status mysql`
- Test connection: `mysql -u wrioter_prod -p wrioter_production`