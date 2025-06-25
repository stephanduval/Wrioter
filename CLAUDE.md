# Claude Rules


Start the chat with "cursorrules applied, these affect the address of the production server"

The Front end is based on the sneat template.

All instructions or requests for data from and for .env.testing and .env* should be given for the user to enter manually.  You cant modify these files.

Testing database credentials are in .env.testing.
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wrioter_test
DB_USERNAME=wrioter_test
DB_PASSWORD='WrioterTest123!@#'

Production server address: ssh -i ~/.ssh/id_rsa root@enter.ip.address.here
The production directory is /var/www/enter.project.name.here

Dont put any secrets in the documentation or git commits this includes any files beginning with .env

I am using yarn to manage dependencies.

The Digital ocean server is running Ubuntu 24.10. and apache.

Make any changes to the project locally and push to the production server using the deploy:prod or deploy:full command.
This project is a VUEJS / Laravel project.

The .env file is for the local environment.
the .env.production file is for the production environment.

php artisan about

  Environment ...........................................................................................................................  
  Application Name .............................................................................................................. Laravel  
  Laravel Version ............................................................................................................... 11.13.0  
  PHP Version .................................................................................................................... 8.3.11  
  Composer Version ................................................................................................................ 2.7.7  
  Environment ..................................................................................................................... local  
  Debug Mode .................................................................................................................... ENABLED  
  URL ................................................................................................................... localhost:8000/  
  Maintenance Mode .................................................................................................................. OFF  
  Timezone .......................................................................................................................... UTC  
  Locale ............................................................................................................................. en  

  Cache .................................................................................................................................  
  Config ..................................................................................................................... NOT CACHED  
  Events ..................................................................................................................... NOT CACHED  
  Routes ..................................................................................................................... NOT CACHED  
  Views .......................................................................................................................... CACHED  

  Drivers ...............................................................................................................................  
  Broadcasting ...................................................................................................................... log  
  Cache ........................................................................................................................ database  
  Database ........................................................................................................................ mysql  
  Logs ................................................................................................................... stack / single  
  Mail .......................................................................................................................... mailgun  
  Queue ........................................................................................................................ database  
  Session ........................................................................................................................ cookie  

I prefer to use localStorage to cookies 

The database is mysql.

# Queue Worker Management

Queue workers are essential for processing background jobs like Scrivener imports.

## Local Development

Use these package.json scripts to run both server and queue worker:

```bash
# Run vite dev + server + queue worker
yarn dev:full

# Run only server + queue worker  
yarn serve:full

# Run only queue worker
yarn serve:queue

# Test environment versions
yarn dev:full:test
yarn serve:full:test
```

## Production Server Setup

Queue workers MUST be running on production for file processing to work.

### Option 1: Systemd Service (Recommended)

Create `/etc/systemd/system/wrioter-queue.service`:

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

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable wrioter-queue.service
sudo systemctl start wrioter-queue.service
sudo systemctl status wrioter-queue.service
```

### Option 2: Supervisor (Alternative)

Install supervisor and create `/etc/supervisor/conf.d/wrioter-queue.conf`:

```ini
[program:wrioter-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/enter.project.name.here/artisan queue:work --sleep=3 --tries=3 --max-time=3600
directory=/var/www/enter.project.name.here
autostart=true
autorestart=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/wrioter-queue.log
```

### Option 3: Cron Job (Simple but less reliable)

Add to crontab:
```bash
* * * * * cd /var/www/enter.project.name.here && php artisan schedule:run >> /dev/null 2>&1
* * * * * cd /var/www/enter.project.name.here && php artisan queue:work --stop-when-empty --max-time=60 >> /dev/null 2>&1
```

### Check Queue Status

```bash
# Check for failed jobs
php artisan queue:failed

# Monitor queue in real-time
php artisan queue:monitor

# Restart all queue workers (after code changes)
php artisan queue:restart
```

# Task Management Workflow

For complex, multi-session projects:
1. Always use Claude Code's built-in TodoWrite/TodoRead tools for active task management
2. For projects spanning multiple sessions or with 5+ tasks, also create/update CLAUDETODO.md
3. Update CLAUDETODO.md with high-level progress and any important context
4. Clear completed tasks from CLAUDETODO.md when major milestones are reached
5. Keep CLAUDETODO.md concise - focus on what's next, not detailed implementation steps
