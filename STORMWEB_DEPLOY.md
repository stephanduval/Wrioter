# StormWeb CloudPanel Deployment Guide

## Server Information
- **Hostname**: sduval.stormweb.cloud
- **IP**: 23.180.104.108
- **Domain**: stephandouglasduval.com
- **OS**: Ubuntu 24.04
- **Panel**: CloudPanel
- **Resources**: 1 Core, 4GB RAM

## Directory Structure
```
/home/[site-user]/
├── htdocs/
│   └── stephandouglasduval.com/      # Laravel application root
│       ├── app/
│       ├── bootstrap/
│       ├── config/
│       ├── database/
│       ├── public/                   # Document root (CloudPanel points here)
│       │   ├── index.php
│       │   ├── build/                # Vite compiled assets
│       │   └── storage/              # Symlink to storage/app/public
│       ├── resources/
│       ├── routes/
│       ├── storage/
│       ├── vendor/
│       └── .env
└── backups/                          # Deployment backups
```

## Initial Setup

### 1. Create Site in CloudPanel
1. Log into CloudPanel
2. Create new site:
   - **Application**: Laravel 11
   - **PHP Version**: 8.3
   - **Domain**: stephandouglasduval.com
   - **Site User**: Create a username (e.g., `wrioter`)
   - **Password**: Generate strong password

### 2. Note Database Credentials
CloudPanel will create:
- Database name
- Database user
- Database password

### 3. Run Initial Setup
```bash
# Run the setup script
yarn stormweb:setup

# Or manually:
./stormweb-setup.sh
```

This will:
- Ask for CloudPanel credentials
- Build and deploy application
- Set up database
- Create admin user

### 4. Set Up SSH Key
```bash
# Copy your SSH key to server
ssh-copy-id [site-user]@23.180.104.108

# Test connection
ssh [site-user]@23.180.104.108
```

## Regular Deployment

### Deploy Updates
```bash
# Quick deploy
yarn stormweb:deploy

# Or manually
./deploy-stormweb.sh
```

### What it does:
1. Builds assets locally (yarn build)
2. Optimizes Composer dependencies
3. Creates backup on server
4. Uploads new code
5. Runs migrations
6. Clears/caches configs

## Available Commands

### Package.json Scripts
```bash
yarn stormweb:setup      # Initial setup wizard
yarn stormweb:deploy     # Deploy to production
yarn stormweb:rollback   # Restore from backup
yarn stormweb:build      # Build assets for deployment
yarn stormweb:ssh        # SSH to server
yarn stormweb:logs       # View Laravel logs
```

### Direct Scripts
```bash
./stormweb-setup.sh      # Interactive setup
./deploy-stormweb.sh     # Deploy updates
./stormweb-rollback.sh   # Rollback to backup
```

## Environment Configuration

### Local `.env.stormweb`
Contains production environment template. Copy and modify:
```bash
cp .env.stormweb .env.production
# Edit with your credentials
```

### Key Variables
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://stephandouglasduval.com

DB_HOST=localhost
DB_DATABASE=[from CloudPanel]
DB_USERNAME=[from CloudPanel]
DB_PASSWORD=[from CloudPanel]

MAIL_MAILER=[your mail service]
MAIL_HOST=[smtp server]
MAIL_USERNAME=[username]
MAIL_PASSWORD=[password]
```

## SSL Certificate

### Via CloudPanel
1. Go to CloudPanel → SSL/TLS
2. Select domain
3. Issue Let's Encrypt certificate
4. Auto-renew enabled by default

## Queue Workers

### Option 1: CloudPanel Cron
Add to CloudPanel cron jobs:
```bash
* * * * * cd /home/[site-user]/htdocs/stephandouglasduval.com && php artisan queue:work --stop-when-empty --max-time=60
```

### Option 2: Supervisor (if available)
```ini
[program:wrioter-queue]
command=php /home/[site-user]/htdocs/stephandouglasduval.com/artisan queue:work
autostart=true
autorestart=true
user=[site-user]
```

## Troubleshooting

### Permission Issues
```bash
# Fix storage permissions
ssh [site-user]@23.180.104.108
cd ~/htdocs/stephandouglasduval.com
chmod -R 775 storage bootstrap/cache
```

### Storage Link
```bash
# Recreate storage link
php artisan storage:link
```

### Clear Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Database Issues
```bash
# Check connection
php artisan tinker
>>> DB::connection()->getPdo();
```

### View Logs
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Or from local
yarn stormweb:logs
```

## Rollback Procedure

If deployment fails:
```bash
# Interactive rollback
yarn stormweb:rollback

# Lists available backups
# Select backup to restore
```

## Security Checklist

- [x] APP_DEBUG=false in production
- [x] Strong database passwords
- [x] SSL certificate configured
- [ ] Set up mail service
- [ ] Configure backup policy
- [ ] Monitor error logs
- [ ] Set up uptime monitoring

## Migration from DigitalOcean

1. Export database from DigitalOcean
2. Import to StormWeb database
3. Copy storage/app/public files
4. Update DNS records
5. Test thoroughly before switching

## Support

### StormWeb Support
- CloudPanel issues
- Server configuration
- Resource upgrades

### Application Issues
- Check logs: `yarn stormweb:logs`
- SSH access: `yarn stormweb:ssh`
- Rollback if needed: `yarn stormweb:rollback`

## Next Steps

1. **Complete CloudPanel site creation**
2. **Run initial setup**: `yarn stormweb:setup`
3. **Configure SSL certificate** in CloudPanel
4. **Set up mail service** credentials
5. **Test deployment**: Make small change and deploy
6. **Set up monitoring** (UptimeRobot, etc.)
7. **Plan DNS migration** from DigitalOcean