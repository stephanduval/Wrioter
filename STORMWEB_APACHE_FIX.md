# StormWeb Apache Configuration Fix

## Current Issue
The site is not accessible at http://23.180.104.108 or http://stephandouglasduval.com

## Root Cause
The document root in Apache/CloudPanel is configured incorrectly. Laravel applications require the `public` directory to be the document root, not the project root.

## Document Root Structure

### Current CloudPanel Settings (INCORRECT)
- Document Root: `/home/sduval/htdocs/stephandouglasduval.com`
- This exposes Laravel files and won't load the application properly

### Required CloudPanel Settings (CORRECT)
- Document Root: `/home/sduval/htdocs/stephandouglasduval.com/public`
- This properly routes requests through Laravel's public/index.php

## Fix Instructions

### Option 1: CloudPanel Interface (Recommended)
1. Log into CloudPanel: https://sduval.stormweb.cloud
   - Password: ShGb5NAqtq
2. Navigate to Sites → stephandouglasduval.com
3. Click on Settings or Vhost
4. Change Document Root from:
   - `/home/sduval/htdocs/stephandouglasduval.com`
   - To: `/home/sduval/htdocs/stephandouglasduval.com/public`
5. Save and restart Apache

### Option 2: SSH Manual Fix
```bash
# SSH into server
ssh sduval@23.180.104.108
# Password: fFX7UehrvJMbiX9b2ox2

# Check current Apache configuration
sudo nano /etc/apache2/sites-available/stephandouglasduval.com.conf

# Update DocumentRoot to:
DocumentRoot /home/sduval/htdocs/stephandouglasduval.com/public

# Also update Directory directive:
<Directory /home/sduval/htdocs/stephandouglasduval.com/public>
    AllowOverride All
    Require all granted
</Directory>

# Reload Apache
sudo systemctl reload apache2
```

### Option 3: Create .htaccess Redirect (Temporary Workaround)
If you can't change the document root, create a redirect:

```bash
ssh sduval@23.180.104.108
cd /home/sduval/htdocs/stephandouglasduval.com

# Create .htaccess in the root
echo 'RewriteEngine On
RewriteRule ^(.*)$ public/$1 [L]' > .htaccess
```

## DNS Configuration
The domain stephandouglasduval.com needs to point to 23.180.104.108:

1. Log into your domain registrar (where you bought the domain)
2. Update DNS A record:
   - Type: A
   - Host: @ (or leave blank for root domain)
   - Points to: 23.180.104.108
   - TTL: 3600 (or default)
3. Add www subdomain:
   - Type: A
   - Host: www
   - Points to: 23.180.104.108
   - TTL: 3600

## Verification Steps

After fixing:

1. **Test Apache configuration:**
   ```bash
   curl -I http://23.180.104.108
   ```

2. **Check DNS propagation:**
   ```bash
   nslookup stephandouglasduval.com
   dig stephandouglasduval.com
   ```

3. **Test the site:**
   - http://23.180.104.108 (should work after Apache fix)
   - http://stephandouglasduval.com (should work after DNS propagation)

## Laravel Requirements

Ensure these are set up on the server:

```bash
ssh sduval@23.180.104.108
cd /home/sduval/htdocs/stephandouglasduval.com

# Check .env file exists
ls -la .env

# Set proper permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache

# Create storage link
php artisan storage:link

# Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Contact Support

If you don't have access to CloudPanel or need assistance:
- StormWeb Support: Contact through their portal
- CloudPanel Documentation: https://www.cloudpanel.io/docs/