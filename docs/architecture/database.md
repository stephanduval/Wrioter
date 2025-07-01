# Database Architecture

## Overview
Wrioter uses MySQL as its primary database, with a unified schema design that supports both standard manuscripts and imported Scrivener projects seamlessly.

## Database Design Principles

### 1. Unified Schema Approach
- Single set of tables for all manuscript types
- Scrivener-specific fields are nullable
- Discriminator column (`manuscript_type`) for type identification
- Maintains backward compatibility

### 2. Normalization
- 3rd Normal Form (3NF) for most tables
- Strategic denormalization for performance
- JSON columns for flexible metadata

### 3. Data Integrity
- Foreign key constraints
- Check constraints where appropriate
- Soft deletes for audit trails
- Timestamps on all tables

## Core Tables

### manuscripts
Central table for all writing projects.

```sql
CREATE TABLE manuscripts (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(191) NOT NULL,
    description TEXT,
    manuscript_type ENUM('standard', 'scrivener') DEFAULT 'standard',
    
    -- Scrivener-specific fields (nullable)
    scrivener_uuid VARCHAR(191),
    scrivener_version VARCHAR(20),
    scrivener_created_date TIMESTAMP NULL,
    scrivener_modified_date TIMESTAMP NULL,
    scrivener_project_settings JSON,
    
    -- Common fields
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_manuscript_type (manuscript_type),
    INDEX idx_scrivener_uuid (scrivener_uuid),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### items
Hierarchical content structure (chapters, sections, scenes).

```sql
CREATE TABLE items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    manuscript_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    title VARCHAR(191) NOT NULL,
    content LONGTEXT,
    type ENUM('folder', 'text', 'research') DEFAULT 'text',
    order_index INT DEFAULT 0,
    
    -- Scrivener-specific fields
    scrivener_uuid VARCHAR(191),
    scrivener_type VARCHAR(50),
    scrivener_metadata JSON,
    label_id BIGINT UNSIGNED,
    status_id BIGINT UNSIGNED,
    include_in_compile BOOLEAN DEFAULT true,
    
    -- Common fields
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_manuscript_parent (manuscript_id, parent_id),
    INDEX idx_order (manuscript_id, parent_id, order_index),
    FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES items(id) ON DELETE CASCADE
);
```

### users
User accounts with role-based access.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(191) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(191) NOT NULL,
    remember_token VARCHAR(100),
    
    -- Profile fields
    avatar VARCHAR(191),
    bio TEXT,
    preferences JSON,
    
    -- Timestamps
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX idx_email (email)
);
```

## Supporting Tables

### manuscript_collections
Organizational collections (Research, Trash, Custom).

```sql
CREATE TABLE manuscript_collections (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    manuscript_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    scrivener_uuid VARCHAR(191),
    title VARCHAR(191) NOT NULL,
    type VARCHAR(50),
    color VARCHAR(7),
    is_expanded BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,
    
    FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id)
);
```

### collection_items
Many-to-many relationship for collection contents.

```sql
CREATE TABLE collection_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    collection_id BIGINT UNSIGNED NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    order_index INT DEFAULT 0,
    
    UNIQUE KEY unique_collection_item (collection_id, item_id),
    FOREIGN KEY (collection_id) REFERENCES manuscript_collections(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);
```

### writing_history
Track writing progress and statistics.

```sql
CREATE TABLE writing_history (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    manuscript_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    recorded_date DATE NOT NULL,
    words_total INT DEFAULT 0,
    chars_total INT DEFAULT 0,
    words_added INT DEFAULT 0,
    words_deleted INT DEFAULT 0,
    session_duration INT, -- seconds
    location VARCHAR(191),
    
    INDEX idx_manuscript_date (manuscript_id, recorded_date),
    FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id)
);
```

### comments
Inline comments and annotations.

```sql
CREATE TABLE comments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    writing_item_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    content TEXT NOT NULL,
    position JSON, -- {start: 100, end: 150}
    type ENUM('comment', 'annotation') DEFAULT 'comment',
    status ENUM('active', 'resolved') DEFAULT 'active',
    
    FOREIGN KEY (writing_item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## File Management Tables

### manuscript_files
Central file storage reference.

```sql
CREATE TABLE manuscript_files (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    manuscript_id BIGINT UNSIGNED NOT NULL,
    original_name VARCHAR(191) NOT NULL,
    stored_name VARCHAR(191) NOT NULL,
    mime_type VARCHAR(100),
    size BIGINT,
    checksum VARCHAR(64),
    storage_disk VARCHAR(50) DEFAULT 'local',
    path VARCHAR(500),
    
    FOREIGN KEY (manuscript_id) REFERENCES manuscripts(id)
);
```

### file_attachments
Link files to manuscripts or items.

```sql
CREATE TABLE file_attachments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    file_id BIGINT UNSIGNED NOT NULL,
    attachable_type VARCHAR(191) NOT NULL,
    attachable_id BIGINT UNSIGNED NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    
    INDEX idx_attachable (attachable_type, attachable_id),
    FOREIGN KEY (file_id) REFERENCES manuscript_files(id)
);
```

## Indexing Strategy

### Primary Indexes
- All primary keys are indexed automatically
- Foreign keys have indexes for join performance

### Composite Indexes
```sql
-- Manuscript queries
INDEX idx_user_type (user_id, manuscript_type)

-- Item hierarchy
INDEX idx_manuscript_parent_order (manuscript_id, parent_id, order_index)

-- Writing history
INDEX idx_user_date (user_id, recorded_date)

-- Search optimization
INDEX idx_title_fulltext (title) -- Full-text search
```

### Performance Indexes
```sql
-- Common WHERE clauses
INDEX idx_created_at (created_at)
INDEX idx_updated_at (updated_at)

-- Soft delete queries
INDEX idx_deleted_at (deleted_at)
```

## Query Patterns

### Common Queries

#### Get user's manuscripts
```sql
SELECT m.*, COUNT(i.id) as item_count
FROM manuscripts m
LEFT JOIN items i ON m.id = i.manuscript_id
WHERE m.user_id = ? AND m.deleted_at IS NULL
GROUP BY m.id
ORDER BY m.updated_at DESC;
```

#### Get manuscript hierarchy
```sql
WITH RECURSIVE item_tree AS (
    SELECT * FROM items 
    WHERE manuscript_id = ? AND parent_id IS NULL
    
    UNION ALL
    
    SELECT i.* FROM items i
    INNER JOIN item_tree it ON i.parent_id = it.id
)
SELECT * FROM item_tree ORDER BY order_index;
```

#### Writing statistics
```sql
SELECT 
    DATE(recorded_date) as date,
    SUM(words_added) as words_written,
    SUM(session_duration) as time_spent
FROM writing_history
WHERE user_id = ? AND recorded_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(recorded_date);
```

## Data Integrity

### Constraints
- Foreign key constraints with appropriate CASCADE options
- NOT NULL constraints on required fields
- UNIQUE constraints on business keys
- CHECK constraints for enums (MySQL 8.0.16+)

### Triggers
```sql
-- Update manuscript updated_at when items change
CREATE TRIGGER update_manuscript_timestamp
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    UPDATE manuscripts 
    SET updated_at = NOW() 
    WHERE id = NEW.manuscript_id;
END;
```

## Migration Strategy

### Version Control
- All schema changes via Laravel migrations
- Migrations are atomic and reversible
- Clear naming convention: `YYYY_MM_DD_HHMMSS_description`

### Migration Order
1. Create core tables (users, manuscripts)
2. Create dependent tables (items, collections)
3. Add indexes
4. Add foreign key constraints
5. Insert seed data

### Example Migration
```php
Schema::create('manuscripts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->text('description')->nullable();
    $table->enum('manuscript_type', ['standard', 'scrivener'])
          ->default('standard');
    
    // Scrivener fields
    $table->string('scrivener_uuid')->nullable()->index();
    $table->json('scrivener_metadata')->nullable();
    
    $table->timestamps();
    $table->softDeletes();
    
    $table->index(['user_id', 'manuscript_type']);
});
```

## Performance Considerations

### Query Optimization
- Use EXPLAIN to analyze query plans
- Avoid SELECT * in production code
- Limit result sets with pagination
- Use prepared statements

### Database Tuning
```sql
-- MySQL configuration recommendations
innodb_buffer_pool_size = 70% of RAM
innodb_log_file_size = 256M
query_cache_size = 0  -- Disabled in MySQL 8.0
max_connections = 200
```

### Monitoring
- Slow query log enabled
- Query performance schema
- Regular ANALYZE TABLE runs
- Index usage statistics

## Backup Strategy

### Automated Backups
- Daily full backups
- Hourly incremental backups
- Binary log for point-in-time recovery

### Backup Commands
```bash
# Full backup
mysqldump --single-transaction --routines --triggers \
  --events wrioter > backup.sql

# Incremental via binary logs
mysqlbinlog --start-datetime="2024-01-01 00:00:00" \
  binlog.000001 > incremental.sql
```

## Future Considerations

### Scaling Options
1. **Read Replicas**: Separate read/write traffic
2. **Partitioning**: Archive old manuscripts
3. **Sharding**: Distribute by user_id
4. **Caching Layer**: Redis for frequent queries

### Schema Evolution
- JSON columns for flexible metadata
- Separate analytics database
- Time-series data optimization
- Full-text search engine integration