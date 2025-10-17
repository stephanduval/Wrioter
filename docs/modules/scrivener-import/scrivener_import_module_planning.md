# Scrivener Import Module Planning (Unified Approach)

## Overview
This module will handle the import of Scrivener project files (.scrivx) into the Wrioter system using a unified approach. Scrivener projects will be stored in the existing `manuscripts` and `items` tables with additional nullable fields for Scrivener-specific data. The import process will be implemented as a backend-first approach, with a CLI interface initially, followed by a web interface.

## Implementation Phases

### Phase 1: Core Import Functionality (Unified Schema)
1. Create database migrations to extend existing tables
2. Create CLI command structure with unified approach
3. Implement basic file handling and extraction
4. Implement XML parsing for comprehensive Scrivener data
5. Create data transformation layer for unified schema
6. Implement database population with extended tables
7. Add validation and error handling

### Phase 2: Advanced Features
1. Implement collection management (manuscript_collections)
2. Add file import handling for research items (item_files system)
3. Create writing statistics tracking (writing_history, writing_goals)
4. Add content conversion (RTF to Markdown)
5. Implement progress tracking and rollback

### Phase 3: Testing Framework
1. Create test fixtures with unified data
2. Implement unit tests for each component
3. Create integration tests for full import process
4. Add validation tests for unified schema
5. Create error handling tests

### Phase 4: Web Interface
1. Create import form with progress tracking
2. Add file upload handling with validation
3. Implement import history view showing unified manuscripts
4. Add error reporting and recovery options
5. Create management interface for imported projects

## Technical Details

### File Structure (Updated)
```
app/
  Console/
    Commands/
      ScrivenerImportCommand.php
  Services/
    ScrivenerImport/
      FileHandler.php
      XmlParser.php
      DataTransformer.php          # Maps to unified schema
      DatabasePopulator.php        # Works with extended tables
      CollectionManager.php        # Handles manuscript_collections
      FileManager.php              # Handles item_files system
      ContentConverter.php         # RTF to Markdown conversion
      Validator.php
  Models/
    Manuscript.php               # Extended with Scrivener fields
    Item.php                     # Extended with Scrivener fields
    ManuscriptCollection.php     # New model for collections
    WritingHistory.php           # New model for statistics
    WritingGoal.php              # New model for goals
    ItemFile.php                 # Enhanced file management
tests/
  Feature/
    ScrivenerImport/
      ImportTest.php
      UnifiedSchemaTest.php      # Test unified approach
      CollectionTest.php         # Test collection import
  Unit/
    ScrivenerImport/
      FileHandlerTest.php
      XmlParserTest.php
      DataTransformerTest.php
      DatabasePopulatorTest.php
      CollectionManagerTest.php
      ContentConverterTest.php
      ValidatorTest.php
```

### Database Schema (Unified Approach)
Instead of separate Scrivener tables, we extend existing tables:

#### Extended Manuscripts Table
```sql
manuscripts (existing + new fields):
-- Existing fields remain unchanged
-- New unified fields (all nullable for standard manuscripts):
- manuscript_type ENUM('standard', 'scrivener') DEFAULT 'standard'
- scrivener_uuid VARCHAR(191) NULL
- version VARCHAR(50) NULL
- imported_at TIMESTAMP NULL
- project_settings JSON NULL        # Labels, statuses, keywords
- compile_settings JSON NULL        # Compile configurations
- custom_metadata JSON NULL         # User-defined metadata
- last_compiled_at TIMESTAMP NULL
- last_exported_at TIMESTAMP NULL
- last_synced_at TIMESTAMP NULL
```

#### Extended Items Table
```sql
items (existing + new fields):
-- Existing fields remain unchanged
-- New Scrivener-specific fields (nullable):
- scrivener_uuid VARCHAR(191) NULL
- folder_type VARCHAR(50) NULL
- icon_name VARCHAR(100) NULL
- include_in_compile BOOLEAN NULL
- target_type ENUM('Words', 'Characters') NULL
- target_count INT UNSIGNED NULL
- target_notify BOOLEAN NULL
- format_metadata JSON NULL

-- New universal fields (can be used by both types):
- content_markdown MEDIUMTEXT NULL
- raw_content MEDIUMTEXT NULL
- content_format ENUM('markdown', 'html') DEFAULT 'markdown'
- word_count INT UNSIGNED DEFAULT 0
- character_count INT UNSIGNED DEFAULT 0
```

#### New Supporting Tables
```sql
-- Collections system for Scrivener organization
manuscript_collections:
- id, manuscript_id, collection_id, title, type, color, search_settings, item_uuids, order_index

collection_items:
- id, collection_id, item_id, order_index

-- Writing statistics and goals
writing_history:
- id, user_id, manuscript_id, date, various count fields

writing_goals:
- id, user_id, manuscript_id, goal_type, target_type, target_count, dates, status

-- Enhanced file management (already planned in design)
item_files, file_versions, file_processing, file_metadata, file_access, file_thumbnails
```

### Data Flow (Unified Approach)
```
Scrivener .scrivx file
    ↓ FileHandler extracts
Temporary directory with XML + files
    ↓ XmlParser processes
Structured PHP array with all data
    ↓ DataTransformer maps to unified schema
Database records for extended manuscripts/items tables
    ↓ CollectionManager handles
manuscript_collections and relationships
    ↓ FileManager handles
item_files for research items
```

### Testing Strategy (Updated)
1. **Unit Tests**
   - Test each component with unified schema in mind
   - Mock dependencies for extended table structure
   - Test edge cases with both standard and Scrivener data

2. **Integration Tests**
   - Test full import process with unified approach
   - Use real sample Scrivener project
   - Verify unified database state (both table types)
   - Test interaction between standard and Scrivener manuscripts

3. **Validation Tests**
   - Test unified schema constraints
   - Test nullable field handling
   - Test manuscript_type enum validation
   - Test duplicate scrivener_uuid handling

4. **Performance Tests**
   - Test large project imports
   - Test query performance with extended tables
   - Test unified search across all manuscript types

## Implementation Steps (Updated)

### Phase 1: Database Foundation
1. Create migrations for extended manuscripts table
2. Create migrations for extended items table
3. Create migrations for new supporting tables
4. Update existing models with new relationships
5. Create new models for collections and statistics

### Phase 2: Core Import Logic
1. Create basic CLI command with unified approach
2. Implement file extraction and validation
3. Add comprehensive XML parsing
4. Create data transformation for unified schema
5. Implement database population with extended tables
6. Add validation for unified constraints

### Phase 3: Advanced Features
1. Implement collection import and management
2. Add file import for research items
3. Create content conversion (RTF to Markdown)
4. Add writing statistics import
5. Implement goal tracking

### Phase 4: Testing and Validation
1. Create comprehensive test suite
2. Test unified approach thoroughly
3. Performance testing with large projects
4. Error handling and recovery testing

### Phase 5: Web Interface
1. Create import form with progress tracking
2. Add manuscript management for both types
3. Implement collection viewing and management
4. Add statistics and goal tracking views
5. Create export functionality

## Benefits of Unified Approach

1. **Code Reuse**: Existing manuscript/item code works with Scrivener imports
2. **Single Source of Truth**: All manuscripts in one table
3. **Unified Search**: Search across all content types
4. **Simplified UI**: One set of components handles both types
5. **Easy Analytics**: Compare standard vs Scrivener manuscripts
6. **Backward Compatibility**: Existing data remains unchanged

## Migration Strategy

1. **Backward Compatibility**: All new fields are nullable
2. **Default Values**: manuscript_type defaults to 'standard'
3. **Data Preservation**: No existing data is modified
4. **Gradual Enhancement**: Universal fields can be populated for standard manuscripts over time

## Notes
- Use Laravel's queue system for large imports
- Implement comprehensive progress tracking
- Add detailed error reporting with context
- Plan for incremental imports and updates
- Consider implementing export back to Scrivener format
- All Scrivener-specific features gracefully degrade for standard manuscripts
- The system supports mixed usage (standard and Scrivener manuscripts together)
