# LLM Documentation Guide for Wrioter

## Quick Access
- **Database Schema**: `docs/database/schemas/current_tables.txt`
- **Frontend Auth**: `docs/frontend/authorization.md`
- **Dynamic Navigation**: `docs/features/dynamic-manuscript-navigation.md`
- **Drag-and-Drop**: `docs/features/drag-drop-quick-reference.md`
- **Scrivener Import**: `docs/modules/scrivener-import/README.md`
- **API Reference**: `docs/api/endpoints.md`
- **Architecture**: `docs/architecture/overview.md`
- **Remote Dev Server**: `docs/development/remote-development-server.md`

## System Overview
Wrioter is a Vue.js/Laravel manuscript management system designed for writers. It features manuscript imports from Scrivener, real-time messaging, project organization, and a rich text editor. The system uses CASL for authorization, queue workers for background processing, and supports multiple user roles.

## Common Tasks

### 1. Database Changes
- Check current schema: `docs/database/schemas/current_tables.txt`
- After changes: Run `yarn schema:text` to update documentation
- Migration location: `database/migrations/`

### 2. Frontend Development
- Component patterns: `docs/frontend/components.md`
- Authorization: `docs/frontend/authorization.md`
- Base template: Sneat (Vue 3 + TypeScript)
- State management: Pinia

### 3. Backend Development
- API endpoints: `docs/api/endpoints.md`
- Queue jobs: `app/Jobs/`
- Services: `app/Services/`
- Models: `app/Models/`

### 4. Module Development
- Scrivener import example: `docs/modules/scrivener-import/`
- Service providers: `app/Providers/`
- Console commands: `app/Console/Commands/`

## Key Conventions

### Frontend
- Vue 3 Composition API with TypeScript
- CASL for permissions
- Axios for API calls via `composables/useApi.ts`
- Vite for building
- localStorage preferred over cookies

### Backend
- Laravel 11
- MySQL database
- Queue workers for background jobs
- Service pattern for complex logic
- Repository pattern for data access

### Testing
- Test environment uses `.env.testing`
- Default test user: `info@freynet-gagne.com` / `ChangeMe2024!`
- Run tests with: `yarn dev:test:all`

## Navigation Map

```
Need to work on...
├── Database? → docs/database/schemas/current_tables.txt
├── Frontend?
│   ├── Components? → docs/frontend/components.md
│   ├── Auth/Permissions? → docs/frontend/authorization.md
│   ├── Navigation System? → docs/features/dynamic-manuscript-navigation.md
│   └── Translations? → docs/frontend/translations.md
├── API?
│   ├── Endpoints? → docs/api/endpoints.md
│   └── Authentication? → docs/api/authentication.md
├── Development?
│   ├── Environment Setup? → docs/development/environment-setup.md
│   ├── Remote Dev Server? → docs/development/remote-development-server.md
│   └── Debug Guide? → docs/development/debug-guide.md
├── Modules?
│   └── Scrivener Import? → docs/modules/scrivener-import/README.md
└── Architecture?
    ├── Overview? → docs/architecture/overview.md
    ├── Frontend? → docs/architecture/frontend.md
    ├── Backend? → docs/architecture/backend.md
    ├── Database? → docs/architecture/database.md
    └── Navigation System? → docs/architecture/manuscript-navigation-system.md
```

## Important Files

### Configuration
- `CLAUDE.md` - Project-specific AI instructions
- `.env.testing` - Test environment config
- `package.json` - Build scripts and dependencies
- `composer.json` - PHP dependencies

### Key Directories
- `resources/ts/` - Frontend TypeScript/Vue code
- `app/` - Backend Laravel code
- `database/` - Migrations and seeders
- `routes/` - API and web routes
- `docs/` - All documentation

## Development Workflow

1. **Start Development**
   ```bash
   yarn dev          # Frontend
   yarn serve        # Backend
   yarn serve:queue  # Queue workers (REQUIRED for file imports/processing)
   ```

2. **Testing Environment**
   ```bash
   yarn dev:test:all    # Full test environment
   yarn db:fresh:test   # Reset test database
   ```

3. **Remote Development Server**
   ```bash
   sync-wrioter-start   # Start auto-sync to remote dev server (192.168.1.252)
   sync-wrioter-watch   # Watch sync progress
   sync-wrioter-stop    # Stop sync
   ```
   See `docs/development/remote-development-server.md` for full setup

4. **Update Documentation**
   ```bash
   yarn schema:text     # Update database docs
   ```

5. **Deploy to Production (StormWeb)**
   ```bash
   yarn stormweb:deploy  # Deploy to production server
   # Or manually: ./deploy-stormweb-fixed.sh
   ```

## Tips for LLMs

1. Always check `current_tables.txt` for database structure
2. Use the test environment for experimentation
3. **Queue workers must be running for file imports** - Use `yarn serve:queue` locally or systemd service in production
4. Frontend changes need `yarn build:test` to see results
5. Check CLAUDE.md for project-specific rules

## Need More Detail?

- **Navigation System**: Complete documentation in `docs/features/dynamic-manuscript-navigation.md`
  - Implementation guide: `docs/development/manuscript-navigation-implementation-guide.md`
  - Technical architecture: `docs/architecture/manuscript-navigation-system.md`
  - Database design: `docs/database/design/manuscript-navigation-schema.md`
  - UI/UX design system: `docs/ui-ux/manuscript-navigation-design-system.md`
- Specific module documentation in `docs/modules/`
- Database design in `docs/database/design/`
- Deployment guides in `docs/deployment/`
- Testing setup in `docs/testing/`