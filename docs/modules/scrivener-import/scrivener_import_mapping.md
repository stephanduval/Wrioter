# Scrivener Import Mapping

## Current Implementation Status

### Implemented Mappings

#### Manuscripts Table
- Project → Manuscript
  - Title → title
  - UUID → scrivener_uuid
  - Version → version
  - Created/Modified → custom_metadata
  - Project Settings → project_settings
  - Compile Settings → compile_settings

#### Items Table
- Binder Items → Items
  - UUID → scrivener_uuid
  - Type → folder_type
  - Title → title
  - Content → content
  - Synopsis → synopsis
  - Icon → icon_name
  - IncludeInCompile → include_in_compile
  - Target Settings → target_type, target_count, target_notify
  - RTF Content → format_metadata.rtf
  - Created/Modified → created_at, updated_at

#### Collections
- Collections → manuscript_collections
  - UUID → collection_id
  - Title → title
  - Type → type
  - Color → color
  - Search Settings → search_settings
  - Binder UUIDs → item_uuids

#### Writing History
- Statistics → writing_history
  - Word Counts → draft_word_count, other_word_count
  - Character Counts → draft_char_count, other_char_count
  - Session Stats → session_word_count, session_char_count

### Pending Mappings

#### Research Items
- File paths and references
- Advanced metadata
- Binary file handling

#### Notes
- Footnotes/Endnotes
- Comments
- Annotations

#### Formatting
- RTF to Markdown conversion
- Style preservation
- Image handling

## Data Flow

1. File Extraction
   - ZIP extraction
   - File validation
   - Temporary storage

2. XML Parsing
   - Project structure
   - Binder hierarchy
   - Research items
   - Collections
   - Settings

3. Data Transformation
   - Manuscript creation
   - Item hierarchy
   - Collection mapping
   - Statistics calculation

4. Database Population
   - Transaction-based import
   - Relationship mapping
   - Validation
   - Rollback support

## Validation Rules

### Required Fields
- Manuscript: title, scrivener_uuid
- Items: title, scrivener_uuid, type
- Collections: title, collection_id, type

### Data Types
- UUIDs: Valid UUID format
- Dates: ISO 8601 format
- JSON: Valid JSON structure
- Enums: Valid enum values

### Relationships
- Parent-child item hierarchy
- Collection-item references
- Manuscript ownership
