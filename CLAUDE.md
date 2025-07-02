# Claude Rules

**IMPORTANT**: At the start of each new chat session, read CLAUDETODO.md first to understand any pending work or context from previous sessions. After reading it, clear CLAUDETODO.md by overwriting it with a fresh template for the new session.

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

# Development Environment Setup

## Testing Environment

When working with testing, ALWAYS use the test environment to avoid database conflicts:

### Start Test Environment
```bash
# Kill any existing servers first
yarn dev:test:all
```

This runs:
- Laravel server in test mode: `php artisan serve --env=testing`
- Vite in test mode: `vite --mode testing`

### Test Database Setup
```bash
# Fresh test database with seeds
yarn db:fresh:test
```

### Default Test Credentials
- **Email**: `info@freynet-gagne.com`
- **Password**: `ChangeMe2024!` (from SEEDER_DEFAULT_PASSWORD in .env.testing)

### Available Test Users
All test users use the same password (`ChangeMe2024!`):
- `info@freynet-gagne.com` (Admin)
- `sophie@freynet-gagne.com` (Client)
- `admin@admin.com` (Admin)
- `client@client.com` (Client)

## Production vs Development vs Testing

- **Development**: `yarn serve` + `yarn dev` (uses .env)
- **Testing**: `yarn dev:test:all` (uses .env.testing)
- **Production**: Deploy commands (uses .env.production on server)

**Important**: Always verify which environment you're running by checking the browser URL and database being used.

## Development Workflow Notes

- **Build Commands**: Use `yarn build:test` when in testing mode, `yarn build:dev` for development
- **Server Management**: The user typically runs the server while developing, so Claude doesn't need to start/stop servers
- **Frontend Testing**: After making Vue.js changes, run `yarn build:test` to test component fixes

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

# Documentation Reference

For detailed system documentation, ALWAYS start with:
- **`docs/LLM_GUIDE.md`** - Main documentation entry point for LLMs
- **`docs/database/schemas/current_tables.txt`** - Current database structure
- **`docs/database/schemas/current_schema.sql`** - Full SQL schema

When working on specific areas:
- Frontend: `docs/frontend/`
- Modules: `docs/modules/`
- API: `docs/api/`
- Architecture: `docs/architecture/`

## Database Schema Documentation

The database schema is automatically documented in `docs/database/schemas/`:
- `current_schema.sql` - Full SQL dump
- `current_tables.txt` - Human-readable table structure
- `current_tables_csv/` - CSV exports with data

### Refreshing Schema Documentation
```bash
# Production database
yarn schema:text    # Quick text overview
yarn schema        # Full SQL dump
yarn schema:csv    # CSV exports with data

# Test database
yarn schema:text:test
yarn schema:test
yarn schema:csv:test
```

When making database changes, always run `yarn schema:text` to update documentation.

# Task Management Workflow

For complex, multi-session projects:
1. Always use Claude Code's built-in TodoWrite/TodoRead tools for active task management
2. For projects spanning multiple sessions or with 5+ tasks, also create/update CLAUDETODO.md
3. Update CLAUDETODO.md with high-level progress and any important context
4. Clear completed tasks from CLAUDETODO.md when major milestones are reached
5. Keep CLAUDETODO.md concise - focus on what's next, not detailed implementation steps
