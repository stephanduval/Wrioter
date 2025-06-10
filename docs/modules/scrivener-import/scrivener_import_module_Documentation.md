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

5. **Web Interface**
   - Status: ✅ Implemented
   - Location: `resources/ts/pages/scrivener-import.vue`
   - Features:
     - File upload with progress tracking
     - Background processing status
     - Import history table
     - Error handling and notifications
   - Components:
     - File input with validation
     - Progress bar for upload
     - Processing status indicator
     - Recent imports table
     - Status chips with color coding
   - API Endpoints:
     - `GET /api/scrivener/imports`: List recent imports
     - `POST /api/scrivener/import`: Upload and process file
     - `GET /api/scrivener/imports/{id}`: Get import status

6. **Backend Controllers**
   - Status: ✅ Implemented
   - Location: `app/Http/Controllers/ScrivenerImportController.php`
   - Features:
     - File upload handling
     - Import status management
     - User-specific import tracking
     - Error handling and logging
   - Model: `app/Models/ScrivenerImport.php`
     - Tracks import status and metadata
     - Relationships with User and Manuscript models
     - Status states: pending, processing, completed, failed

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
# Basic import via command line
php artisan scrivener:import path/to/project.scrivx

# Import with options
php artisan scrivener:import path/to/project.scrivx --user-id=1 --title="My Project" --validate-only

# Web Interface Usage
1. Navigate to /scrivener-import in the web interface
2. Select a .zip file containing Scrivener project
3. Upload and monitor progress
4. View import status in the recent imports table
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
   - ✅ Add web interface for file upload
   - ✅ Implement progress tracking UI
   - ✅ Add import history view
   - Complete integration tests
   - Add batch import support
   - Implement custom template mapping

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
├── Http/
│   └── Controllers/
│       └── ScrivenerImportController.php
├── Models/
│   └── ScrivenerImport.php
├── Services/
│   └── ScrivenerImport/
│       ├── FileHandler.php
│       ├── XmlParser.php
│       ├── DataTransformer.php
│       ├── DatabasePopulator.php
│       └── RtfConverter.php
└── Providers/
    └── ScrivenerImportServiceProvider.php

resources/
└── ts/
    └── pages/
        └── scrivener-import.vue

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

### Web Interface Implementation Details

1. **Frontend Components**
   - File Upload:
     - Accepts .zip files only
     - 50MB size limit
     - Real-time validation
     - Upload progress tracking
   - Status Display:
     - Color-coded status chips
     - Processing indicator
     - Error messages
     - Success notifications
   - Recent Imports Table:
     - Lists last 10 imports
     - Shows filename, status, date
     - Links to completed manuscripts
     - Auto-refreshes for pending imports

2. **State Management**
   - Upload state tracking
   - Processing status
   - Error handling
   - Import history
   - Polling for status updates

3. **API Integration**
   - RESTful endpoints
   - Authentication required
   - File upload handling
   - Status tracking
   - Error reporting

4. **User Experience**
   - Responsive design
   - Clear status indicators
   - Error feedback
   - Progress tracking
   - Easy navigation to imported manuscripts

This documentation is maintained to reflect the current state of the Scrivener import module. Last updated: March 21, 2024
