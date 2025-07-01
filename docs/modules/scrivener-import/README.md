# Scrivener Import Module

## Overview

The Scrivener Import module enables users to import their Scrivener projects (.scrivx files) into Wrioter while preserving structure, content, and metadata. The module uses a unified approach where Scrivener imports extend existing manuscript tables, allowing both standard and Scrivener manuscripts to coexist seamlessly.

## Architecture

### Design Philosophy
- **Unified Approach**: Extends existing `manuscripts` and `items` tables instead of creating separate Scrivener-specific tables
- **Backward Compatible**: All Scrivener-specific fields are nullable to maintain compatibility with standard manuscripts
- **Queue-Based Processing**: Large imports are handled asynchronously via Laravel queues
- **Comprehensive File Management**: Full support for research materials, images, and attachments

### Key Components

#### Backend Services (`app/Services/ScrivenerImport/`)
- **FileHandler**: Validates and extracts .scrivx files
- **XmlParser**: Parses Scrivener's XML structure
- **DataTransformer**: Converts Scrivener data to Wrioter format
- **DatabasePopulator**: Manages database operations and relationships
- **RtfConverter**: Converts RTF content to Markdown using pandoc (v3.2+)

#### CLI Command
```bash
php artisan scrivener:import path/to/project.scrivx [options]

Options:
  --user-id=ID           User to assign manuscript to
  --validate-only        Validate without importing
  --keep-extracted       Keep extracted files after import
  --title="Custom Title" Override project title
```

#### Web Interface
- **Component**: `resources/ts/pages/scrivener-import.vue`
- **Features**:
  - Drag-and-drop file upload
  - Real-time progress tracking
  - Import history management
  - Background processing status

## Database Schema

### Extended Tables

#### manuscripts
```sql
-- Scrivener-specific fields (all nullable)
scrivener_uuid VARCHAR(191)
scrivener_version VARCHAR(20)
scrivener_created_date TIMESTAMP
scrivener_modified_date TIMESTAMP
scrivener_project_settings JSON
manuscript_type ENUM('standard', 'scrivener')
```

#### items
```sql
-- Scrivener-specific fields (all nullable)
scrivener_uuid VARCHAR(191)
scrivener_type VARCHAR(50)
scrivener_created_date TIMESTAMP
scrivener_modified_date TIMESTAMP
scrivener_metadata JSON
label_id BIGINT UNSIGNED
status_id BIGINT UNSIGNED
include_in_compile BOOLEAN
```

### New Tables

#### manuscript_collections
Manages Scrivener's organizational collections (Research, Trash, etc.)
```sql
id, manuscript_id, parent_id, scrivener_uuid, title, 
type, color, is_expanded, order_index
```

#### collection_items
Links items to collections with ordering
```sql
id, collection_id, item_id, order_index
```

#### writing_history
Tracks writing statistics over time
```sql
id, manuscript_id, recorded_date, words_total, chars_total,
words_added, words_deleted, session_duration, location
```

#### File Management System
- `manuscript_files`: Main file records
- `file_attachments`: Links files to manuscripts/items
- `file_versions`: Version history
- `file_thumbnails`: Generated thumbnails
- `file_metadata`: Extended file information
- `file_conversions`: Converted file formats

## Data Mapping

### Scrivener → Wrioter

| Scrivener | Wrioter | Notes |
|-----------|---------|-------|
| Project | Manuscript | Main container |
| Binder Item | Item | Documents, folders |
| RTF Content | Markdown | Converted via pandoc |
| Collections | manuscript_collections | Research, Trash, etc. |
| Snapshots | item_versions | Version history |
| Labels | labels (reference) | Document labels |
| Status | statuses (reference) | Document status |
| Keywords | tags | Document tags |
| Comments | comments | Inline annotations |

## API Endpoints

### Import Management
- `POST /api/scrivener/import` - Upload and start import
- `GET /api/scrivener/import/{id}/status` - Check import status
- `GET /api/scrivener/imports` - List import history
- `DELETE /api/scrivener/import/{id}` - Cancel/delete import

### File Management
- `POST /api/scrivener/upload` - Upload .scrivx file
- `GET /api/scrivener/validate` - Validate file structure

## Usage

### CLI Import
```bash
# Basic import
php artisan scrivener:import ~/Documents/MyNovel.scrivx --user-id=1

# Validate only
php artisan scrivener:import ~/Documents/MyNovel.scrivx --validate-only

# Custom title
php artisan scrivener:import ~/Documents/MyNovel.scrivx --title="My Imported Novel"
```

### Web Import
1. Navigate to `/scrivener-import`
2. Drag and drop or select .scrivx file
3. Configure import options
4. Monitor progress in real-time
5. View imported manuscript

### Queue Processing
Ensure queue workers are running:
```bash
# Development
yarn serve:queue

# Production (systemd service recommended)
sudo systemctl start wrioter-queue
```

## Requirements

### System Requirements
- PHP 8.3+
- Laravel 11+
- MySQL 8.0+
- pandoc 3.2+ (for RTF conversion)
- Queue worker running

### File Limitations
- Maximum file size: 50MB (web upload)
- Supported formats: .scrivx, .scriv
- RTF conversion requires pandoc

## Testing

### Unit Tests
```bash
php artisan test --filter=ScrivenerImport
```

### Test Coverage
- File validation and extraction
- XML parsing
- Data transformation
- Database operations
- RTF conversion
- API endpoints

## Troubleshooting

### Common Issues

#### Import Fails
- Check queue worker is running
- Verify pandoc is installed (`pandoc --version`)
- Check file permissions
- Review logs in `storage/logs/`

#### RTF Conversion Issues
- Ensure pandoc 3.2+ is installed
- Some complex formatting may not convert perfectly
- Check `scrivener_metadata` JSON for original formatting

#### Missing Content
- Verify .scrivx file is complete
- Check `failed_jobs` table for errors
- Review import log in database

### Debug Mode
Enable detailed logging:
```php
// In .env
SCRIVENER_DEBUG=true
```

## Future Enhancements

### Planned Features
- Batch import multiple projects
- Export back to Scrivener format
- Real-time collaboration on imported projects
- Advanced formatting preservation
- Plugin system for custom importers

### Known Limitations
- Complex table formatting may simplify
- Some Scrivener 3 features not fully supported
- Custom metadata fields partially supported
- Compile settings not imported

## Development

### Adding New Features
1. Extend service classes in `app/Services/ScrivenerImport/`
2. Add migrations for new fields
3. Update `DataTransformer` for new mappings
4. Add tests in `tests/Feature/ScrivenerImport/`

### Service Provider
The module is registered via `ScrivenerImportServiceProvider` which:
- Registers all service classes as singletons
- Publishes configuration
- Registers console commands
- Sets up event listeners

## References

- [Scrivener File Format](https://www.literatureandlatte.com/scrivener)
- [pandoc Documentation](https://pandoc.org/)
- [Laravel Queues](https://laravel.com/docs/queues)
- [Database Schema Diagrams](../database/design/scrivener-import/)