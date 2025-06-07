# Scrivener Import Module Documentation

## Current Implementation Status

### Core Components (Implemented)

1. **Command Structure**
   - Location: `app/Console/Commands/ScrivenerImportCommand.php`
   - Status: ✅ Implemented
   - Features:
     - File validation and extraction
   - Progress tracking
     - Error handling and logging
     - Command options: `--user-id`, `--validate-only`, `--keep-extracted`, `--title`

2. **Service Classes**
   - Location: `app/Services/ScrivenerImport/`
   - Status: ✅ Implemented
   - Components:
     - `FileHandler.php`: Handles .scrivx file extraction and validation
     - `XmlParser.php`: Parses Scrivener XML structure
     - `DataTransformer.php`: Transforms Scrivener data to Wrioter format
     - `DatabasePopulator.php`: Manages database operations
     - `RtfConverter.php`: Converts RTF content to Markdown using pandoc (v3.2+)

3. **Service Provider**
   - Location: `app/Providers/ScrivenerImportServiceProvider.php`
   - Status: ✅ Implemented
   - Features:
     - Registers all service classes as singletons
     - Manages service dependencies
     - Registered in `config/app.php`

4. **Database Schema**
   - Status: ✅ Implemented
   - Tables:
     - `manuscripts`: Extended with Scrivener-specific fields
     - `items`: Extended with Scrivener-specific fields
     - `manuscript_collections`: For managing project collections
     - `writing_history`: For tracking changes
     - `writing_goals`: For project goals
     - `writing_notes`: For annotations
     - `export_history`: For tracking exports

### Testing Infrastructure

1. **Unit Tests**
   - Location: `tests/Unit/Services/ScrivenerImport/`
   - Status: ✅ Implemented
   - Coverage:
     - `RtfConverterTest.php`: Tests RTF to Markdown conversion
     - Additional test files for other services (in progress)

2. **Integration Tests**
   - Location: `tests/Feature/ScrivenerImport/`
   - Status: 🚧 In Progress
   - Planned coverage:
     - End-to-end import process
     - Database operations
     - File handling
     - Error scenarios

### Dependencies

1. **External Requirements**
   - Pandoc v3.2+ (for RTF conversion)
   - PHP 8.3.11
   - Laravel 11.13.0
   - MySQL (database)

2. **Internal Dependencies**
   - Laravel's service container
   - Database migrations
   - Storage system for temporary files

### Current Limitations

1. **RTF Conversion**
   - Requires pandoc v3.2 or higher
   - Fallback conversion available for basic text
   - Some Scrivener-specific formatting may not convert perfectly

2. **File Handling**
   - Temporary files created during import
   - Cleanup handled automatically unless `--keep-extracted` is used
   - **Planned Update:** The import command will be updated to accept `.zip` files directly. It will extract the archive, locate the `.scrivx` file inside, and proceed with the import process automatically. This will streamline the workflow and match typical Scrivener export formats.

### Usage Example

```bash
# Basic import
php artisan scrivener:import path/to/project.scrivx

# Import with options
php artisan scrivener:import path/to/project.scrivx --user-id=1 --title="My Project" --validate-only
```

### Error Handling

1. **Validation Errors**
   - File format validation
   - XML structure validation
   - Database constraint validation

2. **Runtime Errors**
   - File system errors
   - XML parsing errors
   - Database operation errors
   - RTF conversion errors

### Next Steps

1. **Immediate Priorities**
   - Update import command to accept `.zip` files directly and handle extraction and `.scrivx` discovery automatically
   - Complete integration tests
   - Add web interface for file upload
   - Implement progress tracking UI
   - Add import history view

2. **Future Enhancements**
   - Batch import support
   - Custom template mapping
   - Advanced RTF conversion options
   - Export functionality

### Code Structure

```
app/
├── Console/
│   └── Commands/
│       └── ScrivenerImportCommand.php
├── Services/
│   └── ScrivenerImport/
│       ├── FileHandler.php
│       ├── XmlParser.php
│       ├── DataTransformer.php
│       ├── DatabasePopulator.php
│       └── RtfConverter.php
└── Providers/
    └── ScrivenerImportServiceProvider.php

tests/
├── Unit/
│   └── Services/
│       └── ScrivenerImport/
│           └── RtfConverterTest.php
└── Feature/
    └── ScrivenerImport/
        └── (integration tests in progress)
```

### Notes for LLMs

1. **Service Dependencies**
   - All services are registered as singletons
   - Dependencies are injected via constructor
   - Service provider manages dependency resolution

2. **Data Flow**
   - File → FileHandler → XmlParser → DataTransformer → DatabasePopulator
   - RTF conversion happens in DataTransformer using RtfConverter service

3. **Error Handling**
   - All services throw specific exceptions
   - Command class catches and logs exceptions
   - Validation happens at each step

4. **Testing**
   - Unit tests focus on individual service functionality
   - Integration tests cover the complete import process
   - Test data includes sample Scrivener files

5. **Database Operations**
   - Transactions used for data integrity
   - Batch operations for performance
   - Soft deletes where appropriate

This documentation is maintained to reflect the current state of the Scrivener import module. Last updated: [Current Date]
