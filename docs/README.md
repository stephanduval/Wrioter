# Wrioter Documentation

This directory contains comprehensive documentation for the Wrioter manuscript management system, optimized for both human developers and LLM assistance.

## Quick Start for LLMs

**Start here:** [`LLM_GUIDE.md`](./LLM_GUIDE.md) - Main entry point with navigation and quick access links.

## Documentation Structure

### Core Documentation
- **[`LLM_GUIDE.md`](./LLM_GUIDE.md)** - LLM-optimized documentation entry point
- **[`api/`](./api/)** - API endpoints and authentication
  - [`endpoints.md`](./api/endpoints.md) - Complete API reference
  - [`authentication.md`](./api/authentication.md) - Auth flows and security
- **[`architecture/`](./architecture/)** - System design and patterns
  - [`overview.md`](./architecture/overview.md) - High-level architecture
  - [`frontend.md`](./architecture/frontend.md) - Vue.js/TypeScript details
  - [`backend.md`](./architecture/backend.md) - Laravel implementation
  - [`database.md`](./architecture/database.md) - Schema and optimization

### Feature Modules
- **[`modules/`](./modules/)** - Feature-specific documentation
  - [`scrivener-import/`](./modules/scrivener-import/) - Scrivener import system

### Database Documentation
- **[`database/`](./database/)** - Database schemas and design
  - [`schemas/`](./database/schemas/) - Auto-generated schema files
    - `current_tables.txt` - Human-readable schema
    - `current_schema.sql` - Full SQL dump
    - `current_tables_csv/` - Data exports
  - [`design/`](./database/design/) - Design documents

### Frontend Documentation
- **[`frontend/`](./frontend/)** - Frontend-specific guides
  - [`authorization.md`](./frontend/authorization.md) - CASL permissions
  - [`translations.md`](./frontend/translations.md) - i18n implementation

### Development Resources
- **[`development/`](./development/)** - Development guides
  - [`environment-setup.md`](./development/environment-setup.md) - Setup instructions
- **[`testing/`](./testing/)** - Testing documentation
- **[`deployment/`](./deployment/)** - Deployment guides

## Database Schema Management

The database schema is automatically documented using yarn scripts:

```bash
# Update schema documentation
yarn schema:text    # Human-readable format
yarn schema        # SQL dump
yarn schema:csv    # CSV exports

# Test database versions
yarn schema:text:test
yarn schema:test
yarn schema:csv:test
```

Always run `yarn schema:text` after database changes to keep documentation current.

## For LLM Usage

1. **Always start with** [`LLM_GUIDE.md`](./LLM_GUIDE.md) for navigation
2. **Check current schema** in [`database/schemas/current_tables.txt`](./database/schemas/current_tables.txt)
3. **Reference CLAUDE.md** for project-specific rules and conventions
4. **Use test environment** with credentials from `.env.testing`

## Documentation Standards

- **Markdown format** for all documentation
- **Concise and structured** for efficient LLM parsing
- **Code examples** included where relevant
- **Cross-references** between related documents
- **Regular updates** with schema changes

## Contributing

When adding new documentation:
1. Follow existing structure and naming conventions
2. Update [`LLM_GUIDE.md`](./LLM_GUIDE.md) if adding major sections
3. Keep content concise and LLM-friendly
4. Include practical examples
5. Cross-reference related documentation 
