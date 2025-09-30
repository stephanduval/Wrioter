# Docker Setup for Wrioter

This project now includes Docker support using Laravel Sail with customizations for your specific needs.

## Quick Start

### 1. Initial Setup
```bash
# Run the setup script
./docker-setup.sh
```

Or manually:

```bash
# Copy environment file
cp .env.docker .env

# Start containers
yarn docker:up

# Install dependencies and setup
yarn docker:artisan key:generate
yarn docker:migrate
```

### 2. Daily Development
```bash
# Start all services
yarn docker:up

# View logs
yarn docker:logs

# Stop services
yarn docker:down
```

## Available Services

- **Laravel App**: http://localhost:8000
- **MySQL (main)**: localhost:3307
- **MySQL (test)**: localhost:3308
- **Redis**: localhost:6380
- **Vite Dev Server**: http://localhost:5173 (when using dev profile)

## Useful Commands

### Container Management
```bash
yarn docker:up        # Start containers in background
yarn docker:dev       # Start containers with logs
yarn docker:down      # Stop containers
yarn docker:restart   # Restart containers
yarn docker:build     # Rebuild containers
yarn docker:logs      # View logs
yarn docker:shell     # Open bash shell in app container
```

### Laravel Commands
```bash
yarn docker:artisan migrate      # Run migrations
yarn docker:artisan migrate:test # Run test migrations
yarn docker:migrate:fresh        # Fresh migration with seeds
yarn docker:tinker               # Laravel Tinker
yarn docker:queue                # Start queue worker
```

### Database Access
```bash
yarn docker:mysql      # Connect to main database
yarn docker:mysql-test # Connect to test database
```

### Node/Yarn Commands
```bash
yarn docker:yarn install  # Install node packages
yarn docker:yarn:build    # Build assets
yarn docker:yarn:dev      # Start Vite dev server
```

## Environment Variables

The Docker setup uses these key environment variables in `.env`:

```env
DB_HOST=mysql
DB_PORT=3306
REDIS_HOST=redis
REDIS_PORT=6379
```

## Development Workflow

### Local Development (Recommended)
1. Keep using your current local PHP/Node setup for development
2. Use Docker for testing and consistency verification
3. Deploy Docker containers to production

### Full Docker Development
1. Start containers: `yarn docker:up`
2. Open shell: `yarn docker:shell`
3. Run commands inside container
4. Edit files normally (they're mounted as volumes)

## Testing

```bash
# Run migrations on test database
yarn docker:artisan migrate --env=testing

# Access test database
yarn docker:mysql-test
```

## Production Deployment

The Docker setup can be deployed to any server with Docker support:

```bash
# On server
git pull
docker compose build
docker compose up -d
docker compose exec laravel.test php artisan migrate --force
```

## Troubleshooting

### Containers won't start
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Database connection issues
```bash
# Check if MySQL is ready
docker compose logs mysql

# Wait for MySQL to fully initialize (30+ seconds on first run)
```

### Permission issues
```bash
# Fix storage permissions
yarn docker:shell
chown -R www-data:www-data storage bootstrap/cache
```

### Port conflicts
If ports are already in use, modify the ports in `docker-compose.override.yml`:

```yaml
services:
  laravel.test:
    ports:
      - '8001:80'  # Change 8000 to 8001
```

## File Structure

```
docker/
├── apache-vhost.conf    # Apache virtual host config
├── php.ini             # PHP configuration
├── supervisord.conf    # Supervisor config for queue workers
└── mysql-init.sql      # MySQL initialization

Dockerfile                # Custom Dockerfile (alternative to Sail)
docker-compose.yml        # Main Sail configuration
docker-compose.override.yml # Local customizations
.env.docker              # Docker environment template
.dockerignore           # Docker build ignore rules
docker-setup.sh         # Automated setup script
```

## Benefits

✅ **Consistent Environment**: Same PHP/MySQL versions everywhere
✅ **Easy Onboarding**: New developers just run `./docker-setup.sh`
✅ **Production Parity**: Identical setup in development and production
✅ **Dependency Isolation**: No conflicts with system packages
✅ **Queue Workers**: Automatically managed via Supervisor
✅ **Multiple Databases**: Separate test database container
✅ **Zero Installation**: No need to install PHP, MySQL, Redis locally