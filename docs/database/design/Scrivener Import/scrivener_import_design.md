# Scrivener Import Database Design

**NOTE:** In the final version, the logged-in user will be assigned as `user_id` for all imported manuscripts and items. Currently, `user_id` is optional for import to facilitate testing, but it will be required in production for proper user ownership and access control.

## Current Status
**Phase**: Initial Design Discussion - Unified Approach
**Last Updated**: 2024-03-21
**Status**: Planning

## Synopsis
This is a web application for many users to use. It uses MySQL, Laravel and Vue.js. Each user will be able to see files and folders that are accessible under their own user_id.

We are creating a database that will be used to house imported data from a .scrivx Scrivener file. This document serves as a comprehensive plan before moving forward with implementation.

## CRITICAL: Scrivener Field Identification

**FOR MIGRATION GENERATION**: These fields are ONLY populated during Scrivener import and should remain NULL for standard manuscripts:

### Manuscripts Table - Scrivener-Only Fields:
- `scrivener_uuid` - Scrivener Project UUID (NULL for standard)
- `version` - Scrivener Project Version (NULL for standard)
- `imported_at` - Import timestamp (NULL for standard)
- `project_settings` - Scrivener project-level settings JSON (NULL for standard)
- `compile_settings` - Scrivener compile settings JSON (NULL for standard)
- `custom_metadata` - Scrivener custom metadata JSON (NULL for standard)
- `last_compiled_at` - Last compile timestamp (NULL for standard)
- `last_exported_at` - Last export timestamp (NULL for standard)
- `last_synced_at` - Last sync timestamp (NULL for standard)

### Items Table - Scrivener-Only Fields:
- `scrivener_uuid` - Scrivener Item UUID (NULL for standard)
- `folder_type` - Scrivener folder type (NULL for standard)
- `icon_name` - Scrivener icon name (NULL for standard)
- `format_metadata` - Format conversion metadata JSON (NULL for standard)
- `include_in_compile` - Scrivener compile inclusion (NULL for standard)
- `target_type` - Scrivener target type (NULL for standard)
- `target_count` - Scrivener target count (NULL for standard)
- `target_notify` - Scrivener target notification (NULL for standard)

### Items Table - Universal Fields (used by both):
- `content_markdown` - Markdown version (can be used by standard items)
- `raw_content` - Stripped text for search (can be used by standard items)
- `content_format` - Current content format (both types)
- `word_count` - Current word count (both types)
- `character_count` - Current character count (both types)

## Design Philosophy: Unified Approach

**Decision**: Extend existing `manuscripts` and `items` tables rather than creating parallel tables.

**Benefits**:
- Single source of truth for all content
- Reuse existing manuscript and item management code
- Simpler frontend with unified components
- Better search across all content types
- Easier analytics and reporting
- Reduced maintenance burden

## Database Structure

### 1. Extend Existing Tables

```sql
-- Extend manuscripts table for Scrivener projects
ALTER TABLE `manuscripts` 
-- Manuscript Type (REQUIRED FIRST)
ADD COLUMN `manuscript_type` enum('standard', 'scrivener') NOT NULL DEFAULT 'standard' AFTER `title` COMMENT 'Type of manuscript (standard or Scrivener import)',

-- Scrivener Project Identity (Scrivener-specific - NULL for standard)
ADD COLUMN `scrivener_uuid` varchar(191) NULL AFTER `manuscript_type` COMMENT 'Scrivener Project UUID - NULL for standard manuscripts',
ADD COLUMN `version` varchar(50) NULL AFTER `scrivener_uuid` COMMENT 'Scrivener Project Version - NULL for standard manuscripts',
ADD COLUMN `imported_at` timestamp NULL AFTER `version` COMMENT 'When the Scrivener project was imported - NULL for standard manuscripts',

-- Scrivener Project Settings (Scrivener-specific - NULL for standard)
ADD COLUMN `project_settings` json DEFAULT NULL COMMENT 'Stores Scrivener project-level settings including labels, statuses, keywords - NULL for standard manuscripts',
ADD COLUMN `compile_settings` json DEFAULT NULL COMMENT 'Stores project-wide compile settings and targets - NULL for standard manuscripts',
ADD COLUMN `custom_metadata` json DEFAULT NULL COMMENT 'Stores user-defined project metadata - NULL for standard manuscripts',

-- Scrivener Project State (Scrivener-specific - NULL for standard)
ADD COLUMN `last_compiled_at` timestamp NULL DEFAULT NULL COMMENT 'Last time the project was compiled - NULL for standard manuscripts',
ADD COLUMN `last_exported_at` timestamp NULL DEFAULT NULL COMMENT 'Last time the project was exported - NULL for standard manuscripts',
ADD COLUMN `last_synced_at` timestamp NULL DEFAULT NULL COMMENT 'Last time the project was synced with Scrivener - NULL for standard manuscripts',

-- Constraints
ADD UNIQUE KEY `unique_user_scrivener_uuid` (`user_id`, `scrivener_uuid`);

-- Create manuscript_collections table for Scrivener collections
CREATE TABLE `manuscript_collections` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `manuscript_id` bigint unsigned NOT NULL,
  `collection_id` varchar(191) NOT NULL COMMENT 'Scrivener Collection UUID',
  `title` varchar(191) NOT NULL,
  `type` enum('Binder', 'RecentSearch', 'Arbitrary') NOT NULL COMMENT 'Scrivener collection type',
  `color` varchar(50) DEFAULT NULL COMMENT 'RGB color values for collection',
  `search_settings` json DEFAULT NULL COMMENT 'For search-based collections (Scrivener-specific)',
  `item_uuids` json DEFAULT NULL COMMENT 'For arbitrary collections - list of item UUIDs (Scrivener-specific)',
  `order_index` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `manuscript_collections_manuscript_foreign` (`manuscript_id`),
  UNIQUE KEY `unique_manuscript_collection_id` (`manuscript_id`, `collection_id`),
  CONSTRAINT `manuscript_collections_manuscript_foreign` FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create collection_items table for linking items to collections
CREATE TABLE `collection_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `collection_id` bigint unsigned NOT NULL,
  `item_id` bigint unsigned NOT NULL,
  `order_index` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_collection_item` (`collection_id`, `item_id`),
  KEY `collection_items_item_id_foreign` (`item_id`),
  CONSTRAINT `collection_items_collection_id_foreign` FOREIGN KEY (`collection_id`) REFERENCES `manuscript_collections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collection_items_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Extend items table for Scrivener content
ALTER TABLE `items` 
-- Scrivener Item Identity (Scrivener-specific - NULL for standard)
ADD COLUMN `scrivener_uuid` varchar(191) NULL AFTER `type` COMMENT 'Scrivener Item UUID - NULL for standard items',
ADD COLUMN `folder_type` varchar(50) NULL AFTER `scrivener_uuid` COMMENT 'Scrivener folder type (chapter, scene, etc.) - NULL for standard items',
ADD COLUMN `icon_name` varchar(100) NULL AFTER `folder_type` COMMENT 'Scrivener icon name - NULL for standard items',

-- Content Format (can be used by both standard and Scrivener)
ADD COLUMN `content_markdown` MEDIUMTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `content` COMMENT 'Markdown version of content - can be used by standard items',
ADD COLUMN `raw_content` MEDIUMTEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `content_markdown` COMMENT 'Stripped text for search - can be used by standard items',
ADD COLUMN `content_format` enum('markdown', 'html') NOT NULL DEFAULT 'markdown' AFTER `raw_content` COMMENT 'Current content format',
ADD COLUMN `format_metadata` JSON DEFAULT NULL AFTER `content_format` COMMENT 'Format conversion metadata - NULL for standard items',

-- Compile Settings (Scrivener-specific - NULL for standard)
ADD COLUMN `include_in_compile` boolean DEFAULT NULL AFTER `icon_name` COMMENT 'Whether to include in Scrivener compile - NULL for standard items',
ADD COLUMN `target_type` enum('Words', 'Characters') DEFAULT NULL AFTER `format_metadata` COMMENT 'Scrivener target type - NULL for standard items',
ADD COLUMN `target_count` int unsigned DEFAULT NULL AFTER `target_type` COMMENT 'Scrivener target count - NULL for standard items',
ADD COLUMN `target_notify` boolean DEFAULT NULL AFTER `target_count` COMMENT 'Scrivener target notification - NULL for standard items',
ADD COLUMN `word_count` int unsigned DEFAULT 0 AFTER `target_notify` COMMENT 'Current word count',
ADD COLUMN `character_count` int unsigned DEFAULT 0 AFTER `word_count` COMMENT 'Current character count',

-- Indexes
ADD INDEX `idx_scrivener` (`scrivener_uuid`),
ADD INDEX `idx_content_search` (`raw_content`(1000)),
ADD FULLTEXT INDEX `idx_content_fulltext` (`raw_content`);

-- Create writing_history table for tracking statistics
CREATE TABLE `writing_history` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT 'User who wrote the content',
  `manuscript_id` bigint unsigned NULL COMMENT 'NULL for user-level statistics',
  -- Manuscript-level statistics
  `draft_word_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'Scrivener draft word count',
  `draft_char_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'Scrivener draft character count',
  `other_word_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'Scrivener other word count',
  `other_char_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'Scrivener other character count',
  `session_word_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'Scrivener session word count',
  `session_char_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'Scrivener session character count',
  -- User-level statistics (when manuscript_id is NULL)
  `total_word_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'Total words across all manuscripts',
  `total_char_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'Total characters across all manuscripts',
  `active_manuscripts` int unsigned NOT NULL DEFAULT 0 COMMENT 'Number of manuscripts worked on',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `writing_history_user_id_foreign` (`user_id`),
  KEY `writing_history_manuscript_foreign` (`manuscript_id`),
  UNIQUE KEY `unique_user_date_manuscript` (`user_id`, `date`, `manuscript_id`),
  CONSTRAINT `writing_history_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `writing_history_manuscript_foreign` FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create writing_goals table for tracking targets
CREATE TABLE `writing_goals` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `manuscript_id` bigint unsigned NULL COMMENT 'NULL for user-level goals',
  `goal_type` enum('daily', 'weekly', 'monthly', 'project') NOT NULL,
  `target_type` enum('words', 'characters', 'time') NOT NULL,
  `target_count` int unsigned NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NULL COMMENT 'NULL for ongoing goals',
  `status` enum('active', 'completed', 'abandoned') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `writing_goals_user_id_foreign` (`user_id`),
  KEY `writing_goals_manuscript_foreign` (`manuscript_id`),
  CONSTRAINT `writing_goals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `writing_goals_manuscript_foreign` FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create manuscript organization tables
CREATE TABLE `manuscript_groups` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text,
  `type` enum('personal', 'shared', 'client') NOT NULL DEFAULT 'personal',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `manuscript_groups_user_id_foreign` (`user_id`),
  CONSTRAINT `manuscript_groups_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Pivot table for manuscripts in groups
CREATE TABLE `manuscript_group_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `manuscript_group_id` bigint unsigned NOT NULL,
  `manuscript_id` bigint unsigned NOT NULL,
  `order_index` int NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_group_manuscript` (`manuscript_group_id`, `manuscript_id`),
  KEY `manuscript_group_items_manuscript_id_foreign` (`manuscript_id`),
  CONSTRAINT `manuscript_group_items_group_id_foreign` FOREIGN KEY (`manuscript_group_id`) REFERENCES `manuscript_groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `manuscript_group_items_manuscript_id_foreign` FOREIGN KEY (`manuscript_id`) REFERENCES `manuscripts` (`id`) ON DELETE CASCADE
);

-- Main shares table
CREATE TABLE `manuscript_shares` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `shared_by` bigint unsigned NOT NULL,
  `share_type` enum('group', 'manuscript') NOT NULL,
  `share_target_id` bigint unsigned NOT NULL COMMENT 'Either manuscript_group_id or manuscript_id',
  `access_level` enum('read', 'write', 'admin') NOT NULL DEFAULT 'read',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `manuscript_shares_shared_by_foreign` (`shared_by`),
  CONSTRAINT `manuscript_shares_shared_by_foreign` FOREIGN KEY (`shared_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Pivot table for users with access to shares
CREATE TABLE `manuscript_share_users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `manuscript_share_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_share_user` (`manuscript_share_id`, `user_id`),
  KEY `manuscript_share_users_user_id_foreign` (`user_id`),
  CONSTRAINT `manuscript_share_users_share_id_foreign` FOREIGN KEY (`manuscript_share_id`) REFERENCES `manuscript_shares` (`id`) ON DELETE CASCADE,
  CONSTRAINT `manuscript_share_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

-- Create comprehensive file management tables
CREATE TABLE `item_files` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `filename` varchar(191) NOT NULL,
  `original_filename` varchar(191) NOT NULL,
  `path` varchar(500) NOT NULL COMMENT 'Storage path',
  `disk` varchar(50) NOT NULL DEFAULT 'local' COMMENT 'Laravel storage disk',
  `mime_type` varchar(191) NOT NULL,
  `file_type` enum('image', 'pdf', 'audio', 'video', 'document', 'other') NOT NULL,
  `size` bigint unsigned NOT NULL COMMENT 'File size in bytes',
  `order_index` int NOT NULL DEFAULT 0 COMMENT 'File ordering within item',
  `is_primary` boolean NOT NULL DEFAULT false COMMENT 'Primary file for item',
  `status` enum('uploading', 'processing', 'ready', 'failed', 'quarantined') NOT NULL DEFAULT 'uploading',
  `virus_scan_status` enum('pending', 'clean', 'infected', 'failed') DEFAULT 'pending',
  `virus_scan_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_files_item_id_foreign` (`item_id`),
  KEY `item_files_user_id_foreign` (`user_id`),
  KEY `item_files_status_index` (`status`),
  KEY `item_files_file_type_index` (`file_type`),
  CONSTRAINT `item_files_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `item_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create file versions table for file replacement/versioning
CREATE TABLE `file_versions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_file_id` bigint unsigned NOT NULL,
  `version_number` int NOT NULL,
  `filename` varchar(191) NOT NULL,
  `path` varchar(500) NOT NULL,
  `disk` varchar(50) NOT NULL,
  `mime_type` varchar(191) NOT NULL,
  `size` bigint unsigned NOT NULL,
  `status` enum('active', 'archived', 'deleted') NOT NULL DEFAULT 'active',
  `replaced_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `file_versions_item_file_id_foreign` (`item_file_id`),
  UNIQUE KEY `unique_file_version` (`item_file_id`, `version_number`),
  CONSTRAINT `file_versions_item_file_id_foreign` FOREIGN KEY (`item_file_id`) REFERENCES `item_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create file processing table for tracking conversions/optimizations
CREATE TABLE `file_processing` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_file_id` bigint unsigned NOT NULL,
  `process_type` enum('thumbnail', 'optimization', 'conversion', 'extraction', 'transcoding') NOT NULL,
  `status` enum('queued', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'queued',
  `input_path` varchar(500) NOT NULL,
  `output_path` varchar(500) NULL,
  `output_disk` varchar(50) NULL,
  `settings` json DEFAULT NULL COMMENT 'Processing settings and parameters',
  `error_message` text NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `file_processing_item_file_id_foreign` (`item_file_id`),
  KEY `file_processing_status_index` (`status`),
  KEY `file_processing_type_index` (`process_type`),
  CONSTRAINT `file_processing_item_file_id_foreign` FOREIGN KEY (`item_file_id`) REFERENCES `item_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create file metadata table for extracted metadata
CREATE TABLE `file_metadata` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_file_id` bigint unsigned NOT NULL,
  `metadata_type` enum('exif', 'pdf', 'audio', 'video', 'document') NOT NULL,
  `extracted_data` json NOT NULL COMMENT 'Extracted metadata',
  `extraction_tool` varchar(100) DEFAULT NULL COMMENT 'Tool used for extraction',
  `extracted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_file_metadata_type` (`item_file_id`, `metadata_type`),
  KEY `file_metadata_type_index` (`metadata_type`),
  CONSTRAINT `file_metadata_item_file_id_foreign` FOREIGN KEY (`item_file_id`) REFERENCES `item_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create file access table for secure URLs and download tracking
CREATE TABLE `file_access` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_file_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `access_token` varchar(191) NOT NULL COMMENT 'Secure access token',
  `access_type` enum('view', 'download', 'thumbnail') NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) NULL,
  `user_agent` text NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file_access_token_unique` (`access_token`),
  KEY `file_access_item_file_id_foreign` (`item_file_id`),
  KEY `file_access_user_id_foreign` (`user_id`),
  KEY `file_access_expires_at_index` (`expires_at`),
  CONSTRAINT `file_access_item_file_id_foreign` FOREIGN KEY (`item_file_id`) REFERENCES `item_files` (`id`) ON DELETE CASCADE,
  CONSTRAINT `file_access_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create file thumbnails table for generated thumbnails
CREATE TABLE `file_thumbnails` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `item_file_id` bigint unsigned NOT NULL,
  `size` varchar(20) NOT NULL COMMENT 'Thumbnail size (e.g., 150x150, 300x300)',
  `filename` varchar(191) NOT NULL,
  `path` varchar(500) NOT NULL,
  `disk` varchar(50) NOT NULL,
  `mime_type` varchar(191) NOT NULL,
  `file_size` int unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_file_thumbnail_size` (`item_file_id`, `size`),
  KEY `file_thumbnails_size_index` (`size`),
  CONSTRAINT `file_thumbnails_item_file_id_foreign` FOREIGN KEY (`item_file_id`) REFERENCES `item_files` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. Data Structure Examples

#### Manuscript (Scrivener Project)
```json
{
  "id": 1,
  "title": "My Novel",
  "manuscript_type": "scrivener",
  "scrivener_uuid": "ABC-123",
  "version": "3.0",
  "imported_at": "2024-03-21T14:30:00Z",
  "project_settings": {
    "labels": [...],
    "statuses": [...],
    "keywords": [...]
  },
  "compile_settings": {
    "formats": {
      "PDF": {...},
      "DOCX": {...}
    }
  },
  "custom_metadata": {
    "target_word_count": 50000,
    "deadline": "2024-12-31"
  }
}
```

#### Collection
```json
{
  "id": 1,
  "manuscript_id": 1,
  "collection_id": "DEF-456",
  "title": "Manuscript",
  "type": "Binder",
  "color": "0.702312 0.888273 0.974258",
  "order_index": 0,
  "items": [
    {
      "id": 1,
      "title": "Chapter 1",
      "scrivener_uuid": "GHI-789",
      "folder_type": "chapter",
      "content_markdown": "# Chapter 1\n\n...",
      "include_in_compile": true
    }
  ]
}
```

#### Item
```json
{
  "id": 1,
  "title": "Chapter 1",
  "type": "text",
  "scrivener_uuid": "GHI-789",
  "folder_type": "chapter",
  "icon_name": "Chapter",
  "content_markdown": "# Chapter 1\n\n...",
  "raw_content": "Chapter 1 ...",
  "content_format": "markdown",
  "include_in_compile": true,
  "target_type": "Words",
  "target_count": 2000,
  "word_count": 1500,
  "character_count": 8500
}
```

#### Manuscript Group
```json
{
  "id": 1,
  "user_id": 1,
  "title": "My Novel Series",
  "description": "A collection of related novels",
  "type": "personal",
  "manuscripts": [
    {
      "id": 1,
      "title": "Novel 1",
      "order_index": 0,
      "manuscript_type": "scrivener",
      "scrivener_uuid": "ABC-123"
    },
    {
      "id": 2,
      "title": "Novel 2",
      "order_index": 1,
      "manuscript_type": "scrivener",
      "scrivener_uuid": "DEF-456"
    }
  ]
}
```

#### Manuscript Share
```json
{
  "id": 1,
  "shared_by": 1,
  "share_type": "group",
  "share_target_id": 1,
  "access_level": "read",
  "shared_users": [
    {
      "user_id": 2,
      "last_accessed_at": "2024-03-21T15:30:00Z"
    },
    {
      "user_id": 3,
      "last_accessed_at": "2024-03-21T16:45:00Z"
    }
  ]
}
```

## Integration Strategy

### 1. Manuscript Types
- `standard`: Regular manuscripts created in the system
- `scrivener`: Imported Scrivener projects with additional metadata

### 2. Collection Types
- `Binder`: Main manuscript structure (chapters, scenes, etc.)
- `RecentSearch`: Search results collections
- `Arbitrary`: Custom collections of items

### 3. Item Organization
- Items can belong to multiple collections
- Each collection maintains its own order
- Scrivener-specific metadata is stored in dedicated fields
- Content is stored in both Markdown and raw formats

### 4. Writing Statistics
- Track daily writing statistics at both manuscript and user level
- Separate counts for draft and other content
- Session-based tracking for writing goals
- Support for multiple goal types (daily, weekly, monthly, project)
- Aggregate statistics across all user manuscripts
- Track active manuscripts per day
- Monitor progress against writing goals

### 5. Manuscript Organization
- Manuscripts can be organized into groups
- Groups can be personal, shared, or client-specific
- Manuscripts can belong to multiple groups
- Groups maintain manuscript order
- Sharing can be at group or manuscript level
- Multiple users can have access to shared content
- Access levels control user permissions

### 6. File Management System
- Support for multiple files per item with ordering
- Comprehensive file processing pipeline (thumbnails, optimization, conversion)
- Virus scanning and security validation
- Metadata extraction for various file types (EXIF, PDF, audio/video)
- File versioning and replacement tracking
- Secure access control with expiring URLs
- Multiple storage disks support (local, cloud, CDN)
- Automatic cleanup of unused files

## Implementation Phases

1. **Phase 1**: Extend `manuscripts` table with Scrivener fields
2. **Phase 2**: Create `manuscript_collections` and `collection_items` tables
3. **Phase 3**: Extend `items` table with Scrivener-specific fields
4. **Phase 4**: Create enhanced writing statistics tables (`writing_history`, `writing_goals`)
5. **Phase 5**: Create manuscript organization tables (`manuscript_groups`, `manuscript_group_items`)
6. **Phase 6**: Create sharing system tables (`manuscript_shares`, `manuscript_share_users`)
7. **Phase 7**: Create comprehensive file management tables (`item_files`, `file_versions`, `file_processing`, `file_metadata`, `file_access`, `file_thumbnails`)
8. **Phase 8**: Build Scrivener import parser
9. **Phase 9**: Implement collection management
10. **Phase 10**: Add writing statistics tracking
11. **Phase 11**: Implement manuscript organization and sharing
12. **Phase 12**: Enhance frontend for Scrivener features
13. **Phase 13**: Implement export back to Scrivener format

## MIGRATION SUMMARY FOR LLM GENERATION

**CRITICAL**: The following migrations should be created IN ORDER:

### Migration 1: Extend Manuscripts Table
```php
// Add Scrivener fields to existing manuscripts table
// Order: manuscript_type FIRST, then Scrivener-specific fields
// All Scrivener fields are nullable except manuscript_type
```

### Migration 2: Create Manuscript Collections Tables
```php
// Create manuscript_collections table
// Create collection_items pivot table
// Both link to manuscripts table
```

### Migration 3: Extend Items Table  
```php
// Add Scrivener fields to existing items table
// Scrivener-specific fields are nullable
// Universal fields (content_markdown, raw_content, etc.) can be used by both types
```

### Migration 4: Create Writing Statistics Tables
```php
// Create writing_history table (includes date column!)
// Create writing_goals table
// Both link to users and manuscripts
```

### Migration 5: Create Manuscript Organization Tables
```php
// Create manuscript_groups table
// Create manuscript_group_items pivot table
```

### Migration 6: Create Sharing System Tables
```php
// Create manuscript_shares table
// Create manuscript_share_users pivot table
```

### Migration 7: Create File Management Tables
```php
// Create item_files table
// Create file_versions table
// Create file_processing table
// Create file_metadata table
// Create file_access table
// Create file_thumbnails table
```

**NOTES FOR MIGRATIONS**:
- All tables use `bigint unsigned` for IDs
- All tables include `created_at` and `updated_at` timestamps
- All foreign keys use CASCADE on delete unless specified
- All new tables use `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
- Scrivener-specific fields in existing tables are nullable and clearly commented

## Frontend Considerations

Vue.js components can determine rendering based on:
- `manuscript.manuscript_type` (standard or scrivener)
- `collection.type` (Binder, RecentSearch, Arbitrary)
- `item.scrivener_uuid` presence (Scrivener import indicator)
- `manuscript_group.type` (personal, shared, client)
- `manuscript_share.access_level` (read, write, admin)
- **File Upload**: Drag-and-drop file uploads with progress tracking
- **File Management**: File organization, ordering, and replacement
- **File Viewer**: Secure file viewing with thumbnails and previews
- **File Security**: Access control and download permissions
- **File Processing**: Status tracking for file processing operations

Views to implement:
- **Hierarchical Tree View**: Using collection items
- **Corkboard View**: Grid layout with synopsis cards
- **Outline View**: Structured list with metadata columns
- **Manuscript Compilation**: Select items for manuscripts
- **Group Management**: Organize manuscripts into groups
- **Share Management**: Control access to manuscripts and groups
- **Shared Manuscripts**: View manuscripts shared with the user
- **Writing Dashboard**: Show user-level and manuscript-level statistics
- **Goal Tracking**: Display progress against writing goals
- **Statistics Views**: Daily, weekly, and monthly writing summaries

## Conclusion

This design integrates Scrivener functionality into our existing manuscript system while:
1. Maintaining Scrivener's organizational features
2. Preserving all Scrivener metadata
3. Supporting both standard and Scrivener manuscripts
4. Enabling flexible item organization
5. Tracking writing statistics
6. Providing manuscript grouping and sharing capabilities

The main implementation work will be:
1. **Parser Development**: Building the .scrivx XML parser
2. **Content Conversion**: RTF to Markdown conversion
3. **Frontend Components**: Scrivener-style views
4. **Export Functionality**: Converting back to Scrivener format
5. **Organization System**: Implementing manuscript groups and sharing
6. **File Management System**: Implementing comprehensive file management
