# Wrioter Documentation

This directory contains all documentation, planning materials, and database schemas for the Wrioter project. The structure is organized to facilitate easy access for both human developers and LLM prompts.

## Directory Structure

### `/database`
- `/schemas/` - Database schema dumps and table structures
  - Contains dated SQL dumps and table structure files
  - Current schema is always available in `current_schema.sql` and `current_tables.txt`
  - CSV exports of table data for analysis
- `/design/` - Database design documentation
  - Contains planning documents for database structure
  - Includes specific designs for features like Scrivener import

### `/modules`
- `/scrivener-import/` - Scrivener import module documentation
  - Module planning documents
  - Import mapping specifications
  - Implementation documentation

## Usage with LLMs

When working with LLMs, you can reference these documents using paths like:
- `docs/database/schemas/current_schema.sql` for current database structure
- `docs/modules/scrivener-import/scrivener_import_module_Documentation.md` for module documentation

## Maintenance

Database schemas are automatically updated using npm scripts:
- `npm run schema` - Creates new SQL dump
- `npm run schema:csv` - Creates CSV exports of tables
- `npm run schema:text` - Creates text representation of table structures

Always ensure documentation is updated when making significant changes to the codebase. 
