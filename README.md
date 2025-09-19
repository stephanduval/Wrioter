# Wrioter

A comprehensive manuscript management system built with Vue.js 3 and Laravel 11, designed for writers to organize, edit, and manage their creative projects.

## 🚀 Features

- **Manuscript Management**: Create, organize, and edit manuscripts with hierarchical structure
- **Scrivener Import**: Import existing Scrivener projects seamlessly
- **Dynamic Navigation**: Context-aware navigation system for manuscript organization
- **Real-time Collaboration**: Multi-user editing and messaging
- **Rich Text Editor**: Advanced editing capabilities for creative writing
- **Project Organization**: Folders, collections, and tagging system
- **User Management**: Role-based access control with CASL authorization

## 🛠 Technology Stack

### Frontend
- **Vue.js 3** with Composition API
- **TypeScript 5** for type safety
- **Vite 5** for build tooling
- **Pinia** for state management
- **Vue Router 4** for navigation
- **Sneat Admin Template** for UI components

### Backend
- **Laravel 11** framework
- **MySQL** database
- **Queue Workers** for background processing
- **CASL** authorization system

## 📋 Prerequisites

- **Node.js** 18+ and Yarn
- **PHP** 8.3+ with Composer
- **MySQL** 8.0+
- **Apache/Nginx** web server

## 🔧 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd Wrioter
```

### 2. Install Dependencies
```bash
# Frontend dependencies
yarn install

# Backend dependencies
composer install
```

### 3. Environment Setup
```bash
# Copy environment files
cp .env.example .env
cp .env.example .env.testing

# Generate application key
php artisan key:generate
```

### 4. Database Setup
```bash
# Run migrations and seeders
yarn db:fresh
yarn db:fresh:test  # For testing environment
```

## 🚀 Development

### Local Development
```bash
# Start development servers
yarn dev        # Frontend (Vite)
yarn serve      # Backend (Laravel)

# Or run both together
yarn dev:full   # Includes queue worker
```

### Testing Environment
```bash
# Start test environment
yarn dev:test:all

# Test credentials
# Email: info@freynet-gagne.com
# Password: ChangeMe2024!
```

### Available Scripts
```bash
# Development
yarn dev                # Frontend development server
yarn serve             # Backend development server
yarn dev:full          # Both servers + queue worker

# Testing
yarn dev:test:all      # Full test environment
yarn db:fresh:test     # Reset test database

# Building
yarn build             # Production build
yarn build:test        # Test build

# Database
yarn schema:text       # Update database documentation
yarn schema           # Full SQL schema dump

# Deployment
yarn deploy:prod       # Deploy to production
yarn deploy:full       # Deploy with migrations
```

## 📚 Documentation

### Quick Start
- **LLM Guide**: [docs/LLM_GUIDE.md](docs/LLM_GUIDE.md) - Main entry point for AI assistants
- **Database Schema**: [docs/database/schemas/current_tables.txt](docs/database/schemas/current_tables.txt)

### Key Features
- **Dynamic Navigation System**: [docs/features/dynamic-manuscript-navigation.md](docs/features/dynamic-manuscript-navigation.md)
- **Scrivener Import**: [docs/modules/scrivener-import/README.md](docs/modules/scrivener-import/README.md)

### Architecture
- **Frontend**: [docs/architecture/frontend.md](docs/architecture/frontend.md)
- **Backend**: [docs/architecture/backend.md](docs/architecture/backend.md)
- **Navigation System**: [docs/architecture/manuscript-navigation-system.md](docs/architecture/manuscript-navigation-system.md)

### Development Guides
- **API Reference**: [docs/api/endpoints.md](docs/api/endpoints.md)
- **Components**: [docs/frontend/components.md](docs/frontend/components.md)
- **Authorization**: [docs/frontend/authorization.md](docs/frontend/authorization.md)

## 🔑 Key Features In Detail

### Dynamic Manuscript Navigation
A sophisticated navigation system that adapts to the selected manuscript, providing:
- Hierarchical organization of all manuscript content
- Real-time updates and state persistence
- Multiple view modes (tree, flat, collections)
- Search and filtering capabilities
- Drag-and-drop reordering

### Queue Workers
Background processing system for:
- Scrivener project imports
- File processing and validation
- Email notifications
- Database maintenance tasks

### Permission System
CASL-based authorization with:
- Role-based access control
- Granular permissions
- Component-level security
- API endpoint protection

## 🐛 Troubleshooting

### Common Issues

1. **Login Issues After Environment Changes**
   ```bash
   yarn db:fresh:test  # Reset test database
   ```

2. **Queue Jobs Not Processing**
   ```bash
   yarn serve:queue    # Start queue worker
   ```

3. **Frontend Build Errors**
   ```bash
   yarn build:test     # Build for testing
   ```

### Development Environment
- Use `.env.testing` for testing
- Default test user: `info@freynet-gagne.com` / `ChangeMe2024!`
- Queue workers must be running for file imports

## 📝 Contributing

1. Read [CLAUDE.md](CLAUDE.md) for project-specific guidelines
2. Use the testing environment for development
3. Update documentation after database changes: `yarn schema:text`
4. Follow the established component patterns in `docs/frontend/`

## 📄 License

[Add license information]

## 🆘 Support

For detailed documentation and troubleshooting, see [docs/LLM_GUIDE.md](docs/LLM_GUIDE.md)
