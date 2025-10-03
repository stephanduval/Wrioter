# Next Steps for StormWeb Deployment

## 🔐 1. Set Up SSH Authentication

Run this command in your terminal:
```bash
ssh-copy-id sduval@23.180.104.108
```

When prompted for password, enter:
```
iGot9MS49NhVzGJQ0c4G
```

Test if it worked:
```bash
ssh sduval@23.180.104.108 "echo 'SSH works!'"
```

## 🚀 2. Deploy the Application

Once SSH is working without password:
```bash
yarn stormweb:deploy
```

## 🗄️ 3. Configure Database on Server

1. Log into CloudPanel: https://sduval.stormweb.cloud
   - Username: `sduval`
   - Password: `ShGb5NAqtq`

2. Find database credentials in CloudPanel:
   - Go to Sites → stephandouglasduval.com → Database
   - Note the database name, username, and password

3. SSH to server and configure `.env`:
   ```bash
   ssh sduval@23.180.104.108
   cd htdocs/stephandouglasduval.com
   cp .env.production .env
   nano .env
   ```

4. Update these values in `.env`:
   ```env
   APP_URL=https://stephandouglasduval.com
   DB_DATABASE=[from CloudPanel]
   DB_USERNAME=[from CloudPanel]
   DB_PASSWORD=[from CloudPanel]
   ```

## 📦 4. Run Initial Setup on Server

```bash
# On the server (after SSH)
cd htdocs/stephandouglasduval.com

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (optional - for initial data)
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 775 storage bootstrap/cache
```

## ⚙️ 5. Set Up Queue Workers

For file processing (Scrivener imports) to work:

### Option A: CloudPanel Cron Job
1. In CloudPanel, go to Cron Jobs
2. Add new cron job:
   ```
   * * * * * cd /home/sduval/htdocs/stephandouglasduval.com && php artisan queue:work --stop-when-empty --max-time=60
   ```

### Option B: Systemd Service (if you have root access)
Create `/etc/systemd/system/wrioter-queue.service`:
```ini
[Unit]
Description=Wrioter Queue Worker
After=network.target

[Service]
Type=simple
User=sduval
Group=sduval
Restart=always
ExecStart=/usr/bin/php /home/sduval/htdocs/stephandouglasduval.com/artisan queue:work --sleep=3 --tries=3
WorkingDirectory=/home/sduval/htdocs/stephandouglasduval.com

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable wrioter-queue.service
sudo systemctl start wrioter-queue.service
```

## 🔒 6. Set Up SSL Certificate

In CloudPanel:
1. Go to SSL/TLS section
2. Select stephandouglasduval.com
3. Click "Issue Let's Encrypt Certificate"
4. Auto-renewal should be enabled by default

## ✅ 7. Verify Deployment

1. Visit https://stephandouglasduval.com
2. Check that the site loads
3. Try logging in with test credentials
4. Test file upload features
5. Check Laravel logs if issues:
   ```bash
   ssh sduval@23.180.104.108
   tail -f htdocs/stephandouglasduval.com/storage/logs/laravel.log
   ```

## 📧 8. Configure Mail Settings (Optional)

Update `.env` on server with your mail service:
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-server.com
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@stephandouglasduval.com
```

## 🔄 9. Future Deployments

For future updates, simply run:
```bash
# From your local machine
yarn stormweb:deploy
```

This will:
- Build assets locally
- Upload to server
- Run migrations
- Clear caches
- Restart queue workers

## 📝 Important Files & Locations

### Local:
- Deployment script: `deploy-stormweb.sh`
- Credentials: `docs/server/STORMWEB_CREDENTIALS.md`
- SSH setup: `ssh-manual-setup.md`

### Server:
- Application: `/home/sduval/htdocs/stephandouglasduval.com/`
- Public files: `/home/sduval/htdocs/stephandouglasduval.com/public/`
- Logs: `/home/sduval/htdocs/stephandouglasduval.com/storage/logs/`

## 🆘 Troubleshooting

If deployment fails:
1. Check SSH connection: `ssh sduval@23.180.104.108`
2. Check CloudPanel for errors
3. Review Laravel logs on server
4. Verify file permissions
5. Check database connection
6. Ensure queue workers are running

## 📞 Support Contacts

- **CloudPanel Issues**: Check StormWeb support
- **Application Issues**: Check Laravel logs
- **Deployment Issues**: Review `deploy-stormweb.sh` output

## 🎯 Additional Important Tasks

### Files Already Prepared
- ✅ Production assets built (`yarn build` completed)
- ✅ Deployment scripts updated with correct username (`sduval`)
- ✅ Credentials saved in `docs/server/STORMWEB_CREDENTIALS.md`
- ✅ Security verified - `/docs/` in both `.gitignore` and `.deployignore`

### CloudPanel Configuration Notes
- **Document Root**: Must be set to `stephandouglasduval.com/public` in CloudPanel
- **PHP Version**: Should be 8.3 or higher
- **Database**: MySQL/MariaDB (get credentials from CloudPanel)

### Testing Credentials (After Seeding)
Default test users (if you run seeders):
- **Admin**: `info@freynet-gagne.com` / `ChangeMe2024!`
- **Client**: `sophie@freynet-gagne.com` / `ChangeMe2024!`
- **Admin**: `admin@admin.com` / `ChangeMe2024!`
- **Client**: `client@client.com` / `ChangeMe2024!`

### Environment Files Status
- `.env.production` - Template ready (needs database credentials)
- `.env.stormweb` - Backup template available
- `deploy-stormweb.sh` - Deployment script configured
- `stormweb-setup.sh` - Initial setup script ready

### Quick Commands Reference
```bash
# SSH to server
ssh sduval@23.180.104.108

# Deploy from local
yarn stormweb:deploy

# View logs on server
ssh sduval@23.180.104.108 'tail -f htdocs/stephandouglasduval.com/storage/logs/laravel.log'

# Clear caches on server
ssh sduval@23.180.104.108 'cd htdocs/stephandouglasduval.com && php artisan cache:clear && php artisan config:clear'

# Check queue status
ssh sduval@23.180.104.108 'cd htdocs/stephandouglasduval.com && php artisan queue:failed'
```

### DNS Configuration (When Ready)
Point your domain to: `23.180.104.108`
- A Record: `@` → `23.180.104.108`
- A Record: `www` → `23.180.104.108`

### Monitoring Checklist
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure error tracking (Sentry, Bugsnag, etc.)
- [ ] Set up backup schedule in CloudPanel
- [ ] Configure log rotation
- [ ] Set up email alerts for failures

---
Last Updated: September 30, 2025
Session Summary: Configured StormWeb deployment, updated scripts with correct credentials, secured sensitive files from git/deployment