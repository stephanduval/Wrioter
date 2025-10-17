# Scrivener Import Database Design

## Current Status
**Phase**: Initial Design Discussion - Unified Approach
**Last Updated**: 2024-03-21
**Status**: Planning

## Synopsis
This is a web application for many users to use. It uses mysql, laravel and vueJS. Each user will be able to see files and folders that are accessible under their own user_id

We are creating a database that will be used to house imported data from a .scrivx scrivener file. 
In the planning folder I have our current database schema, and a copy of the main scrivener file a .scrivx file. I also have scrivener_import_design.md, (this document) where I'm keeping the planning in one file. It will be used as instructions for an LLM to commit the changes. I dont want to commit to updating the DB and creating files etc yet, I just want to make sure I have a comprehensive plan before moving forward.

## Design Philosophy: Unified Approach

**Decision**: Extend existing `items` table rather than creating parallel `scrivener_items` table.

**Benefits**:
- Single source of truth for all content
- Reuse existing item management code
- Simpler frontend with unified components
- Better search across all content types
- Easier analytics and reporting
- Reduced maintenance burden

## Database Structure

### 1. Create New Tables (in order)

```sql
-- Create scrivener_projects table first (referenced by items)
CREATE TABLE `scrivener_projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(191) NOT NULL,
  `scrivener_uuid` varchar(191) NOT NULL,
  `version` varchar(50),
  `imported_at` timestamp NULL,
  `project_settings` json,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `scrivener_projects_user_id_foreign` (`user_id`),
  UNIQUE KEY `unique_user_scrivener_uuid` (`user_id`, `scrivener_uuid`),
  CONSTRAINT `scrivener_projects_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Create styles table (referenced by items)
CREATE TABLE `styles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('paragraph', 'character', 'list') NOT NULL,
  `format` JSON NOT NULL COMMENT 'Stores RTF formatting properties',
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `styles_user_id_foreign` (`user_id`),
  UNIQUE KEY `styles_user_name_unique` (`user_id`, `name`),
  CONSTRAINT `styles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Modify Existing `items` Table

```sql
-- Step 1: Modify type enum to include folder
ALTER TABLE `items` 
MODIFY COLUMN `type` enum('text', 'mindmap', 'folder', 'media') NOT NULL DEFAULT 'text';

-- Step 2: Add all new columns
ALTER TABLE `items` 
ADD COLUMN `parent_id` bigint unsigned NULL AFTER `project_id`,
ADD COLUMN `path_in_project` varchar(500) NULL AFTER `parent_id`,
ADD COLUMN `folder_type` varchar(50) NULL AFTER `type` COMMENT 'For folders: chapter, scene, binder, etc.',
ADD COLUMN `scrivener_uuid` varchar(191) NULL AFTER `folder_type`,
ADD COLUMN `scrivener_project_id` bigint unsigned NULL AFTER `scrivener_uuid`,
ADD COLUMN `icon_name` varchar(100) NULL AFTER `scrivener_project_id`,
ADD COLUMN `include_in_compile` boolean DEFAULT true AFTER `icon_name`,
ADD COLUMN `notes` text NULL AFTER `synopsis`,
ADD COLUMN `content_markdown` MEDIUMTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `content`,
ADD COLUMN `raw_content` MEDIUMTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `content_markdown`,
ADD COLUMN `content_format` enum('markdown', 'rtf', 'html') NOT NULL DEFAULT 'markdown' AFTER `raw_content`,
ADD COLUMN `format_metadata` JSON DEFAULT NULL AFTER `content_format`,
ADD COLUMN `style_id` bigint unsigned DEFAULT NULL AFTER `format_metadata`;

-- Step 3: Add foreign key constraints
ALTER TABLE `items` 
ADD CONSTRAINT `items_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `items_scrivener_project_id_foreign` FOREIGN KEY (`scrivener_project_id`) REFERENCES `scrivener_projects` (`id`) ON DELETE SET NULL,
ADD CONSTRAINT `items_style_id_foreign` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE SET NULL;

-- Step 4: Add indexes for performance
ALTER TABLE `items` 
ADD INDEX `idx_hierarchy` (`user_id`, `parent_id`, `item_order`),
ADD INDEX `idx_scrivener` (`scrivener_project_id`, `scrivener_uuid`),
ADD INDEX `idx_content_search` (`raw_content`(1000)),
ADD FULLTEXT INDEX `idx_content_fulltext` (`raw_content`);
```

### 3. Create Dependent Tables

```sql
-- Style applications table (depends on both items and styles)
CREATE TABLE `style_applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint unsigned NOT NULL,
  `style_id` bigint unsigned NOT NULL,
  `start_position` int NOT NULL,
  `end_position` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `style_applications_item_id_foreign` (`item_id`),
  KEY `style_applications_style_id_foreign` (`style_id`),
  CONSTRAINT `style_applications_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `style_applications_style_id_foreign` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media files associated with items
CREATE TABLE `item_media_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint unsigned NOT NULL,
  `filename` varchar(191) NOT NULL,
  `original_path` varchar(500),
  `stored_path` varchar(500),
  `mime_type` varchar(100),
  `file_size` bigint,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_media_files_item_id_foreign` (`item_id`),
  CONSTRAINT `item_media_files_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4. Update `item_versions` Table

```sql
-- Add content format support to versions
ALTER TABLE `item_versions` 
ADD COLUMN `content_markdown` MEDIUMTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `content`,
ADD COLUMN `raw_content` MEDIUMTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `content_markdown`,
ADD COLUMN `content_format` enum('markdown', 'rtf', 'html') NOT NULL DEFAULT 'markdown' AFTER `raw_content`,
ADD COLUMN `format_metadata` JSON DEFAULT NULL AFTER `content_format`,
ADD COLUMN `style_id` bigint unsigned DEFAULT NULL AFTER `format_metadata`,
ADD CONSTRAINT `item_versions_style_id_foreign` FOREIGN KEY (`style_id`) REFERENCES `styles` (`id`) ON DELETE SET NULL;
```

## Content Format Strategy

### 1. Content Storage Structure

The system uses a multi-format approach:

- `content_markdown` - Primary format for editing and display
- `raw_content` - Stripped text for search and indexing
- `content_format` - Current format (markdown, rtf, html)
- `format_metadata` - Tracks conversion history and status
- `style_id` - Default style for the item

### 2. Format Lifecycle

1. **Import Process**:
   - RTF file parsed and converted to markdown
   - Styles extracted and stored in `styles` table
   - Raw text stripped for search indexing
   - Format metadata tracks conversion history

2. **Content Updates**:
   - Primary editing in markdown format
   - Raw content updated for search
   - Style applications tracked separately
   - Format metadata updated

3. **Export Process**:
   - Markdown converted to RTF on demand
   - Styles applied from style definitions
   - Original formatting preserved where possible

### 3. Style Management

1. **Style Storage**:
   - User-specific styles with rename/delete capability
   - System styles available to all users
   - RTF formatting properties preserved

2. **Style Definition Structure**:
```json
{
  "format": {
    "font": {
      "family": "Times New Roman",
      "size": 12,
      "bold": false,
      "italic": false
    },
    "paragraph": {
      "alignment": "left",
      "indent": 0,
      "spacing": {"before": 0, "after": 0}
    }
  },
  "metadata": {
    "original_rtf": "...",
    "is_system": false,
    "is_default": false
  }
}
```

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

## Enhanced Metadata Strategy

Store Scrivener-specific metadata in existing `metadata` JSON column:

```json
{
  "status": "draft",
  "word_count": 1500,
  "scrivener": {
    "label_id": 4,
    "label_name": "Blue",
    "label_color": "0.702312 0.888273 0.974258",
    "status_id": 0,
    "status_name": "To Do",
    "keywords": [{"id": 1, "name": "Research"}],
    "bookmarks": [
      {"target_uuid": "ABC-123", "title": "Reference"},
      {"external_url": "https://example.com", "title": "Website"}
    ],
    "original_file_extension": "rtf",
    "include_in_compile": true,
    "icon_name": "Lectern"
  }
}
```

## Project Settings JSON Structure

Store project-level Scrivener settings in `scrivener_projects.project_settings`:

```json
{
  "labels": [
    {"id": -1, "name": "No Label"},
    {"id": 0, "name": "Red", "color": "0.993500 0.701213 0.732586"}
  ],
  "statuses": [
    {"id": -1, "name": "No Status"},
    {"id": 0, "name": "To Do"}
  ],
  "keywords": [
    {"id": 1, "name": "Research"}
  ],
  "targets": {
    "draft_target": {"type": "Words", "count": 0}
  },
  "compile_settings": {
    "default_include": true
  }
}
```

## Import Process

### 1. Parse .scrivx File
- Extract project metadata and settings
- Parse binder structure and hierarchy
- Identify all content items with UUIDs

### 2. Process Data Folder
- Extract RTF content files and convert to markdown
- Extract styles and create user-specific style definitions
- Strip raw text for search indexing
- Read synopsis.txt and notes.rtf files
- Copy media files to storage
- Parse comments and annotations

### 3. Create Database Records
- One `scrivener_projects` record with full project settings
- Multiple `items` records with `parent_id` relationships for hierarchy
- User-specific `styles` records from RTF style definitions
- Store Scrivener metadata in `metadata` JSON field
- Create `item_media_files` records for attachments
- Create `style_applications` records for text formatting ranges

### 4. Bridge to Manuscripts
- Users can create manuscripts from imported items
- Use existing `manuscript_items` table
- Select which Scrivener items to include in compilation

## Migration Benefits

1. **Immediate Compatibility**: Existing item management code works with imported content
2. **Unified Search**: Single table search across all content types  
3. **Flexible Rendering**: Frontend can handle hierarchy through `parent_id`
4. **Gradual Enhancement**: Can improve Scrivener-specific features incrementally
5. **Future-Proof**: Easy to add new content types without architectural changes

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

1. **Phase 1**: Create new tables (`scrivener_projects`, `styles`)
2. **Phase 2**: Extend `items` table with new columns and relationships
3. **Phase 3**: Create dependent tables (`style_applications`, `item_media_files`)
4. **Phase 4**: Update `item_versions` table for format support
5. **Phase 5**: Build Scrivener import parser and processor
6. **Phase 6**: Enhance frontend to display hierarchical items
7. **Phase 7**: Add Scrivener-specific views (corkboard, outline)
8. **Phase 8**: Integrate with existing manuscript compilation system
