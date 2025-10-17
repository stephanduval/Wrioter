# Scrivener Import Database Design

## Current Status
**Phase**: Initial Design Discussion - Unified Approach
**Last Updated**: 2024-03-21
**Status**: Planning

## Synopsis
This is a web application for many users to use. It uses MySQL, Laravel and Vue.js. Each user will be able to see files and folders that are accessible under their own user_id.

We are creating a database that will be used to house imported data from a .scrivx Scrivener file. This document serves as a comprehensive plan before moving forward with implementation.

## Revised Database Strategy: Unified Manuscript System

**Decision**: Integrate Scrivener features into existing `manuscripts` table rather than creating separate `scrivener_projects` table.

**Benefits**:
- Users get access to powerful organizational tools (labels, statuses, keywords) regardless of project origin
- Simpler architecture with one writing system
- Natural workflow progression (native → Scrivener export, or Scrivener import → native work)
- Feature parity between imported and native projects

## Database Structure

### 1. Extend Existing `manuscripts` Table

```sql
-- Extend manuscripts table to support Scrivener-compatible features
ALTER TABLE `manuscripts` 
ADD COLUMN `scrivener_uuid` varchar(191) NULL AFTER `description`,
ADD COLUMN `project_settings` json NOT NULL DEFAULT '{}' COMMENT 'Labels, statuses, keywords, targets, print settings',
ADD COLUMN `compile_settings` json NOT NULL DEFAULT '{}' COMMENT 'Compile formats, targets, and configurations',
ADD COLUMN `custom_metadata` json DEFAULT NULL COMMENT 'User-defined project metadata',
ADD COLUMN `imported_at` timestamp NULL COMMENT 'When imported from Scrivener (null for native projects)',
ADD COLUMN `last_compiled_at` timestamp NULL,
ADD COLUMN `last_exported_at` timestamp NULL,
ADD COLUMN `last_synced_at` timestamp NULL,
ADD UNIQUE KEY `manuscripts_user_scrivener_uuid_unique` (`user_id`, `scrivener_uuid`);
```

### 2. Create Manuscript Collections Table

```sql
-- Collections table linked to manuscripts (not scrivener_projects)
CREATE TABLE `manuscript_collections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `manuscript_id` bigint unsigned NOT NULL,
  `collection_id` varchar(191) NULL COMMENT 'Scrivener Collection UUID (null for native collections)',
  `title` varchar(191) NOT NULL,
  `type` enum('Binder', 'RecentSearch', 'Arbitrary', 'Custom') NOT NULL DEFAULT 'Custom',
  `color` varchar(50) DEFAULT NULL COMMENT 'RGB color values',
  `search_settings` json DEFAULT NULL COMMENT 'For search-based collections',
  `item_uuids` json DEFAULT NULL COMMENT 'List of item UUIDs in this collection',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `manuscript_collections_manuscript_foreign` (`manuscript_id`),
  UNIQUE KEY `unique_manuscript_collection_id` (`manuscript_id`, `collection_id`),
  CONSTRAINT `manuscript_collections_manuscript_foreign` FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3. Create Writing History Table

```sql
-- Writing history linked to manuscripts
CREATE TABLE `manuscript_writing_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `manuscript_id` bigint unsigned NOT NULL,
  `date` date NOT NULL,
  `draft_word_count` int unsigned NOT NULL DEFAULT 0,
  `draft_char_count` int unsigned NOT NULL DEFAULT 0,
  `other_word_count` int unsigned NOT NULL DEFAULT 0,
  `other_char_count` int unsigned NOT NULL DEFAULT 0,
  `session_word_count` int unsigned NOT NULL DEFAULT 0,
  `session_char_count` int unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `manuscript_writing_history_manuscript_foreign` (`manuscript_id`),
  UNIQUE KEY `unique_manuscript_date` (`manuscript_id`, `date`),
  CONSTRAINT `manuscript_writing_history_manuscript_foreign` FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Update Items Table to Reference Manuscripts

```sql
-- Update items table to reference manuscripts instead of scrivener_projects
ALTER TABLE `items`
ADD COLUMN `manuscript_id` bigint unsigned NULL AFTER `project_id`,
ADD CONSTRAINT `items_manuscript_id_foreign` FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts` (`id`) ON DELETE SET NULL;

-- Update indexes
ALTER TABLE `items` 
ADD INDEX `idx_manuscript_hierarchy` (`user_id`, `manuscript_id`, `parent_id`, `item_order`),
ADD INDEX `idx_scrivener_manuscript` (`manuscript_id`, `scrivener_uuid`);
```

## Manuscript Settings Structure

### Project Settings JSON (in manuscripts.project_settings)

```json
{
  "labels": {
    "title": "Label",
    "default_id": -1,
    "definitions": [
      {"id": -1, "name": "No Label", "color": null},
      {"id": 0, "name": "Red", "color": "0.993500 0.701213 0.732586"},
      {"id": 1, "name": "Orange", "color": "0.995422 0.790951 0.652384"},
      {"id": 2, "name": "Yellow", "color": "0.997726 0.892729 0.652567"},
      {"id": 3, "name": "Green", "color": "0.715862 0.948714 0.697688"},
      {"id": 4, "name": "Blue", "color": "0.702312 0.888273 0.974258"},
      {"id": 5, "name": "Purple", "color": "0.957565 0.766751 0.999619"}
    ]
  },
  "statuses": {
    "title": "Status", 
    "default_id": -1,
    "definitions": [
      {"id": -1, "name": "No Status"},
      {"id": 0, "name": "To Do"},
      {"id": 1, "name": "In Progress"},
      {"id": 2, "name": "First Draft"},
      {"id": 3, "name": "Revised Draft"},
      {"id": 4, "name": "Final Draft"},
      {"id": 5, "name": "Done"}
    ]
  },
  "keywords": [
    {
      "id": 1,
      "title": "Themes",
      "color": "1.000000 0.666667 0.000000",
      "children": [
        {"id": 6, "title": "Darkness", "color": "0.364706 0.364706 0.364706"},
        {"id": 7, "title": "Water", "color": "0.333333 0.666667 1.000000"}
      ]
    },
    {
      "id": 2,
      "title": "Characters",
      "color": "0.800000 0.729412 0.988235", 
      "children": [
        {"id": 8, "title": "Aeryn", "color": "1.000000 0.949020 0.658824"},
        {"id": 9, "title": "John", "color": "1.000000 0.839216 0.709804"}
      ]
    }
  ],
  "project_targets": {
    "draft_target": {
      "type": "Words",
      "count": 50000,
      "deadline": "2024-12-31T00:00:00Z",
      "notify": true
    },
    "session_target": {
      "type": "Words", 
      "count": 1000,
      "reset_time": "00:00"
    }
  }
}
```

## Migration Strategy

### Phase 1: Table Updates
1. Extend `manuscripts` table with new columns
2. Create `manuscript_collections` table
3. Create `manuscript_writing_history` table
4. Add `manuscript_id` to `items` table

### Phase 2: Data Migration (if needed)
1. Migrate any existing data to new structure
2. Set up default project settings for existing manuscripts

### Phase 3: Feature Implementation
1. Build manuscript settings management
2. Implement collections interface
3. Add writing history tracking
4. Create Scrivener import/export functionality

## Benefits of This Approach

### For Users
- **Consistent Experience**: All manuscripts have access to organizational tools
- **Progressive Enhancement**: Start simple, add complexity as needed
- **No Lock-in**: Can export to Scrivener or work entirely natively

### For Development
- **Simpler Codebase**: One manuscript system instead of parallel systems
- **Better Testing**: Single code path to test and maintain
- **Future-Proof**: Easy to add new organizational features for all projects

### For Scrivener Integration
- **True Compatibility**: Native projects can use Scrivener features
- **Seamless Import/Export**: Same data structure regardless of origin
- **Feature Parity**: No "second-class" native projects

## Implementation Considerations

1. **Default Settings**: New manuscripts get sensible default labels/statuses
2. **Progressive Disclosure**: Advanced features hidden until needed
3. **Performance**: JSON queries optimized for common operations
4. **User Experience**: Clear indication of available features per manuscript
5. **Export Capability**: Any manuscript can be exported to Scrivener format

This unified approach makes the application more powerful for all users while maintaining full Scrivener compatibility when needed.

## Content Format Strategy

### 1. Content Storage Structure

The system uses a Markdown-first approach for both content and styles:

- `content_markdown` - Primary format for editing and display
- `raw_content` - Stripped text for search and indexing
- `content_format` - Current format (markdown, html)
- `format_metadata` - Tracks conversion history and status
- `style_id` - Default style for the item

### 2. Format Lifecycle

1. **Import Process**:
   - RTF file parsed and converted to Markdown
   - Styles extracted and stored as Markdown-compatible definitions
   - Raw text stripped for search indexing
   - Format metadata tracks conversion history

2. **Content Updates**:
   - Primary editing in Markdown format
   - Styles applied using Markdown syntax
   - Raw content updated for search
   - Format metadata updated

3. **Export Process**:
   - Markdown converted to RTF on demand
   - Styles mapped to Scrivener styles
   - Original formatting preserved where possible

### 3. Style Application

Styles are applied using Markdown syntax:
- **Headings**: `# Heading 1`, `## Heading 2`, etc.
- **Emphasis**: `**bold**`, `*italic*`, `***bold italic***`
- **Lists**: `- bullet item`, `1. numbered item`
- **Blockquotes**: `> quoted text`
- **Code**: `` `inline code` ``, ````code blocks````
- **Links**: `[link text](url)`
- **Images**: `![alt text](image_url)`
- **Tables**: Markdown table syntax
- **Custom Styles**: HTML with custom classes/attributes

## Folder Hierarchy Management

The `items` table supports a flexible folder hierarchy:

1. **Folder Types**:
   - Folders are items with `type = 'folder'`
   - `folder_type` can be: 'chapter', 'scene', 'binder', 'manuscript', 'media'
   - Function remains consistent regardless of type

2. **Hierarchy Structure**:
   - `parent_id` creates tree structure
   - `item_order` maintains sequence within folders
   - `path_in_project` stores full paths for quick lookups

3. **Example Hierarchy**:
```
Manuscript (folder_type='manuscript')
├── Chapter 1 (folder_type='chapter')
│   ├── Scene 1 (type='text')
│   └── Scene 2 (type='text')
└── Research (folder_type='binder')
    ├── Notes (type='text')
    └── Images (folder_type='media')
```

## Metadata Strategy

### 1. Item-Level Metadata

Store Scrivener-specific metadata in existing `metadata` JSON column:

```json
{
  "status": "draft",
  "word_count": 1500,
  "character_count": 8500,
  "scrivener": {
    "labels": [
      {
        "id": 4,
        "name": "Blue",
        "color": "0.702312 0.888273 0.974258",
        "is_custom": false,
        "applied_at": "2024-03-21T14:30:00Z"
      }
    ],
    "status": {
      "id": 0,
      "name": "To Do",
      "color": "0.993500 0.701213 0.732586",
      "is_custom": false,
      "applied_at": "2024-03-21T14:30:00Z"
    },
    "keywords": [
      {
        "id": 1,
        "name": "Research",
        "color": "0.995422 0.790951 0.652384",
        "is_custom": false,
        "applied_at": "2024-03-21T14:30:00Z"
      }
    ],
    "bookmarks": [
      {
        "id": "ABC-123",
        "title": "Reference",
        "target_uuid": "DEF-456",
        "target_title": "Chapter 1",
        "created_at": "2024-03-21T14:30:00Z"
      }
    ],
    "compile_settings": {
      "include_in_compile": true,
      "compile_as": "Section",
      "compile_with": "Chapter Heading",
      "page_break_before": false,
      "page_break_after": true,
      "start_on_new_page": false,
      "level": 1
    },
    "icon": {
      "name": "Lectern",
      "color": "0.702312 0.888273 0.974258",
      "is_custom": false,
      "applied_at": "2024-03-21T14:30:00Z"
    },
    "custom_metadata": {
      "target_word_count": 2000,
      "deadline": "2024-04-01",
      "research_notes": "Check historical accuracy"
    }
  }
}
```

### 2. Project-Level Metadata

Store project-wide metadata in `scrivener_projects.project_settings`:

```json
{
  "labels": {
    "title": "Label",
    "default_id": -1,
    "definitions": [
      {"id": -1, "name": "No Label", "color": null},
      {"id": 0, "name": "Red", "color": "0.993500 0.701213 0.732586"},
      {"id": 1, "name": "Orange", "color": "0.995422 0.790951 0.652384"},
      {"id": 2, "name": "Yellow", "color": "0.997726 0.892729 0.652567"},
      {"id": 3, "name": "Green", "color": "0.715862 0.948714 0.697688"},
      {"id": 4, "name": "Blue", "color": "0.702312 0.888273 0.974258"},
      {"id": 5, "name": "Purple", "color": "0.957565 0.766751 0.999619"}
    ],
    "last_modified": "2024-03-21T14:30:00Z",
    "modified_by": 1
  },
  "statuses": {
    "title": "Status",
    "default_id": -1,
    "definitions": [
      {"id": -1, "name": "No Status"},
      {"id": 0, "name": "To Do"},
      {"id": 1, "name": "In Progress"},
      {"id": 2, "name": "First Draft"},
      {"id": 3, "name": "Revised Draft"},
      {"id": 4, "name": "Final Draft"},
      {"id": 5, "name": "Done"}
    ],
    "last_modified": "2024-03-21T14:30:00Z",
    "modified_by": 1
  },
  "keywords": [
    {
      "id": 1,
      "title": "Themes",
      "color": "1.000000 0.666667 0.000000",
      "children": [
        {"id": 6, "title": "Darkness", "color": "0.364706 0.364706 0.364706"},
        {"id": 7, "title": "Water", "color": "0.333333 0.666667 1.000000"}
      ]
    },
    {
      "id": 2,
      "title": "Characters",
      "color": "0.800000 0.729412 0.988235",
      "children": [
        {"id": 8, "title": "Aeryn", "color": "1.000000 0.949020 0.658824"},
        {"id": 9, "title": "John", "color": "1.000000 0.839216 0.709804"}
      ]
    },
    {
      "id": 4,
      "title": "Locations",
      "color": "0.639216 0.890196 0.949020",
      "children": [
        {"id": 5, "title": "Wessex", "color": "0.639216 0.949020 0.839216"}
      ]
    }
  ],
  "section_types": {
    "type_definitions": [
      {"id": "DCA8571B-485A-4963-82E1-104A1428644B", "name": "Heading"},
      {"id": "70D25CAF-4DBA-4E6E-98D2-C0482A3E1C77", "name": "Text"}
    ],
    "level_types": {
      "folders": ["DCA8571B-485A-4963-82E1-104A1428644B"],
      "containers": ["70D25CAF-4DBA-4E6E-98D2-C0482A3E1C77"],
      "files": ["70D25CAF-4DBA-4E6E-98D2-C0482A3E1C77"]
    }
  },
  "project_targets": {
    "draft_target": {
      "type": "Words",
      "count": 0,
      "count_included_only": true,
      "current_compile_group_only": false,
      "deadline": "2021-08-08T00:00:00+10:00",
      "ignore_deadline": true,
      "notify": false
    },
    "session_target": {
      "type": "Words",
      "count": 0,
      "count_draft_only": false,
      "allow_negatives": false,
      "reset_type": "Time",
      "reset_time": "00:00",
      "determined_from_deadline": false,
      "can_write_on_deadline_date": true,
      "writing_days": ""
    }
  },
  "project_bookmarks": [
    {
      "binder_uuid": "BA997809-7647-44A6-96DD-EC2FB25FED19",
      "title": "START HERE"
    }
  ],
  "print_settings": {
    "paper_size": "612.0,792.0",
    "left_margin": 72.0,
    "right_margin": 72.0,
    "top_margin": 72.0,
    "bottom_margin": 72.0,
    "paper_type": "na-letter",
    "orientation": "Portrait",
    "scale_factor": 1.0,
    "horizontally_centered": true,
    "vertically_centered": true,
    "collates": false,
    "pages_across": 1,
    "pages_down": 1
  },
  "last_modified": "2024-03-21T14:30:00Z",
  "modified_by": 1
}
```

### 3. Compile Settings

Store project-wide compile settings in `scrivener_projects.compile_settings`:

```json
{
  "defaults": {
    "include_in_compile": true,
    "compile_as": "Section",
    "compile_with": "Normal",
    "page_break_before": false,
    "page_break_after": false,
    "start_on_new_page": false,
    "level": 1
  },
  "formats": {
    "PDF": {
      "enabled": true,
      "paper_size": "Letter",
      "margins": {"top": "1in", "bottom": "1in", "left": "1in", "right": "1in"},
      "header": {"enabled": true, "template": "%title% - %page%"},
      "footer": {"enabled": true, "template": "%page%"}
    },
    "DOCX": {"enabled": true, "template": "default.docx"},
    "RTF": {"enabled": true},
    "HTML": {"enabled": true, "css_template": "default.css"},
    "EPUB": {
      "enabled": true,
      "metadata": {"title": "%project_title%", "author": "%user_name%", "language": "en"}
    },
    "MOBI": {"enabled": true}
  },
  "targets": {
    "draft_target": {"type": "Words", "count": 50000},
    "session_target": {"type": "Words", "count": 1000},
    "custom_targets": [
      {"name": "Chapter 1", "type": "Words", "count": 5000},
      {"name": "Research", "type": "Words", "count": 2000}
    ]
  },
  "last_modified": "2024-03-21T14:30:00Z",
  "modified_by": 1
}
```

## Version Control Strategy

### 1. Version Types and Metadata

The `item_versions` table supports comprehensive version control:

- **Snapshot Types**: `snapshot` (manual), `auto` (automatic), `manual` (user-created)
- **Version Hierarchy**: `parent_version_id` creates version trees
- **Snapshot Metadata**: JSON field stores Scrivener-specific version information

### 2. Snapshot Metadata Structure

```json
{
  "scrivener": {
    "snapshot_id": "ABC123",
    "snapshot_date": "2024-03-21T14:30:00Z",
    "snapshot_type": "manual",
    "snapshot_label": "First Draft",
    "snapshot_notes": "Initial version after major revision",
    "original_filename": "Document.rtf.snapshot",
    "original_path": "Snapshots/Document.rtf.snapshot",
    "word_count": 1500,
    "character_count": 8500,
    "style_changes": [
      {
        "style_id": "98BD0011-2D28-4E73-AA41-64564459867C",
        "style_name": "Chapter Heading",
        "change_type": "modified"
      }
    ],
    "content_changes": {
      "added_words": 150,
      "deleted_words": 50,
      "modified_paragraphs": 5
    }
  }
}
```

## Import Process

### 1. Parse .scrivx File
- Extract project metadata and settings
- Parse binder structure and hierarchy
- Identify all content items with UUIDs
- Process version history and snapshots
- Extract project-wide metadata (labels, statuses, keywords, etc.)

### 2. Process Data Folder
- Extract RTF content files and convert to Markdown
- Process Snapshots directory for version history
- Extract styles and create Markdown-compatible style definitions
- Strip raw text for search indexing
- Read synopsis.txt and notes.rtf files
- Copy media files to storage
- Parse comments and annotations
- Extract item-specific metadata

### 3. Create Database Records
- One `scrivener_projects` record with comprehensive project settings and metadata
- Multiple `items` records with `parent_id` relationships for hierarchy
- User-specific `styles` records with Markdown-compatible definitions
- `item_versions` records for each snapshot and version
- Store comprehensive Scrivener metadata in `metadata` JSON field
- Create `item_media_files` records for attachments
- Create `style_applications` records for text formatting ranges
- Apply project-wide metadata to items

## Frontend Considerations

Vue.js components can determine rendering based on:
- `item.type` (text, folder, media)
- `item.scrivener_project_id` presence (Scrivener import indicator)
- `item.metadata.scrivener` content (Scrivener-specific metadata)
- `item.parent_id` for hierarchy

Views to implement:
- **Hierarchical Tree View**: Using parent_id relationships
- **Corkboard View**: Grid layout with synopsis cards
- **Outline View**: Structured list with metadata columns
- **Manuscript Compilation**: Select items for manuscripts

## Implementation Phases

1. **Phase 1**: Create new tables (`scrivener_projects`, `scrivener_collections`, `project_metadata_history`, `project_compile_history`, `writing_history`, `styles`)
2. **Phase 2**: Extend `items` table with new columns and relationships (including Scrivener-specific fields)
3. **Phase 3**: Create dependent tables (`style_applications`, `item_media_files`)
4. **Phase 4**: Update `item_versions` table for format and version control support
5. **Phase 5**: Build Scrivener import parser and processor
6. **Phase 6**: Implement project settings management and Collections handling
7. **Phase 7**: Add writing history tracking and project targets management
8. **Phase 8**: Enhance frontend to display hierarchical items and Scrivener metadata
9. **Phase 9**: Add Scrivener-specific views (corkboard, outline, collections)
10. **Phase 10**: Integrate with existing manuscript compilation system
11. **Phase 11**: Implement settings synchronization and export back to Scrivener format

## Scrivener Import Capability Assessment

### ✅ **Fully Supported Elements**

1. **Hierarchical Structure**: Complete support via `parent_id` and folder types
2. **Basic Item Types**: Text, Folder, DraftFolder, ResearchFolder, TrashFolder, Image, PDF, Media
3. **Metadata**: Labels, Status, Keywords, Bookmarks, Include in Compile settings
4. **Project Settings**: Labels, Statuses, Keywords (with hierarchy), Section Types, Print Settings
5. **Collections**: Dedicated table for Binder, RecentSearch, and Arbitrary collections
6. **Writing History**: Daily tracking with word/character counts
7. **Project Targets**: Draft and session targets with deadlines
8. **Media Files**: Images, PDFs, audio files with proper media handling
9. **UUIDs**: Full preservation of Scrivener's UUID system
10. **Bookmarks**: Both internal (to other items) and external (URLs)
11. **Word Counts & Targets**: Item-level and project-level tracking

### ⚠️ **Partially Supported Elements**

1. **Corkboard Settings**: Basic support in metadata JSON (arrangement, expanded states)
2. **Text Selection States**: Can be stored in metadata but not actively used
3. **Editor View States**: Stored but would need frontend implementation
4. **Compile Group Selection**: Basic support, needs compilation system integration

### 🔄 **Elements Requiring Custom Implementation**

1. **RTF to Markdown Conversion**: Need robust parser for RTF content files
2. **Snapshots Processing**: Extract from Snapshots directory and create version records
3. **Style Mapping**: Convert Scrivener styles to Markdown-compatible format
4. **Search Collections**: Implement search logic for RecentSearch collections
5. **Export Back to Scrivener**: Reverse conversion from our format to .scrivx

## Missing Database Elements (Now Addressed)

The updated design now includes:

1. ✅ **Collections Table**: `scrivener_collections` for all collection types
2. ✅ **Writing History Table**: `writing_history` for daily writing statistics  
3. ✅ **Enhanced Items Fields**: Target counts, word counts, character counts
4. ✅ **Comprehensive Project Settings**: Section types, project targets, print settings
5. ✅ **Hierarchical Keywords**: Proper parent-child keyword relationships
6. ✅ **All Scrivener Item Types**: Including image, pdf, draftfolder, researchfolder, trashfolder

## Conclusion

**Yes, the database design is now fully capable of handling Scrivener .scrivx imports.** 

The updated schema can store:
- ✅ All structural elements (hierarchy, types, metadata)
- ✅ All project-level settings and configurations  
- ✅ All content types including media files
- ✅ Version history and snapshots
- ✅ Collections and search results
- ✅ Writing statistics and targets
- ✅ Complete preservation of Scrivener's organizational system

The main implementation work will be:
1. **Parser Development**: Building the .scrivx XML parser
2. **Content Conversion**: RTF to Markdown conversion
3. **Frontend Components**: Scrivener-style views (corkboard, outliner, etc.)
4. **Export Functionality**: Converting back to Scrivener format when needed
