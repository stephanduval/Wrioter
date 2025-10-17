<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. First, add missing features to items table
        Schema::table('items', function (Blueprint $table) {
            // Add parent_id for hierarchy
            if (!Schema::hasColumn('items', 'parent_id')) {
                $table->foreignId('parent_id')->nullable()->constrained('items')->onDelete('cascade');
            }
            
            // Add archiving support
            if (!Schema::hasColumn('items', 'is_archived')) {
                $table->boolean('is_archived')->default(false);
            }
            if (!Schema::hasColumn('items', 'archived_at')) {
                $table->timestamp('archived_at')->nullable();
            }
            
            // Add soft deletes
            if (!Schema::hasColumn('items', 'deleted_at')) {
                $table->softDeletes();
            }
            
            // Add indexes
            $table->index(['parent_id', 'item_order']);
            $table->index('is_archived');
        });

        // 2. Update foreign key references in writing-specific tables (including renamed tables)
        $tablesToUpdate = [
            'writing_compiled_output_items' => ['writing_item_id'],
            'writing_item_versions' => ['writing_item_id'],
            'writing_media' => ['writing_item_id'],
            'writing_mindmap_node_links' => ['writing_item_id'],
            'writing_mindmap_node_versions' => ['writing_item_id'],
            'writing_mindmap_nodes' => ['writing_item_id'],
            'writing_mindmaps' => ['writing_item_id'],
            'writing_note_references' => ['writing_item_id'],
            'writing_notes' => ['writing_item_id'],
            'writing_comments' => ['writing_item_id'],
            'writing_item_links' => ['source_item_id', 'target_item_id'],
            // Renamed tables
            'comments' => ['writing_item_id'],
            'item_links' => ['source_item_id', 'target_item_id'],
        ];

        foreach ($tablesToUpdate as $table => $columns) {
            if (Schema::hasTable($table)) {
                foreach ($columns as $column) {
                    if (Schema::hasColumn($table, $column)) {
                        try {
                            // Create temporary column
                            Schema::table($table, function (Blueprint $table) use ($column) {
                                $table->unsignedBigInteger('new_item_id_' . $column)->nullable()->after($column);
                            });

                            // Copy data with mapping
                            DB::statement("
                                UPDATE {$table} t
                                JOIN writing_items wi ON t.{$column} = wi.id
                                JOIN items i ON i.title = wi.title 
                                    AND i.user_id = wi.user_id 
                                    AND i.project_id = wi.project_id
                                SET t.new_item_id_{$column} = i.id
                            ");

                            // Drop old foreign key if exists
                            $fkExists = DB::select("
                                SELECT CONSTRAINT_NAME 
                                FROM information_schema.KEY_COLUMN_USAGE 
                                WHERE TABLE_NAME = '{$table}' 
                                AND COLUMN_NAME = '{$column}' 
                                AND CONSTRAINT_SCHEMA = DATABASE() 
                                AND REFERENCED_TABLE_NAME IS NOT NULL
                            ");
                            
                            if (!empty($fkExists)) {
                                DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY " . $fkExists[0]->CONSTRAINT_NAME);
                            }

                            // Drop old column and rename new one
                            Schema::table($table, function (Blueprint $table) use ($column) {
                                $table->dropColumn($column);
                                $table->renameColumn('new_item_id_' . $column, $column);
                                $table->foreign($column)->references('id')->on('items')->onDelete('cascade');
                            });
                        } catch (\Exception $e) {
                            // Log the error but continue with migration
                            \Log::error("Error updating table {$table} column {$column}: " . $e->getMessage());
                        }
                    }
                }
            }
        }

        // 3. Move any remaining data from writing_items to items
        if (Schema::hasTable('writing_items')) {
            DB::statement("
                INSERT INTO items (
                    user_id, project_id, parent_id, type, title, 
                    content, synopsis, item_order, metadata, 
                    is_archived, archived_at, created_at, updated_at, deleted_at
                )
                SELECT 
                    user_id, project_id, parent_id, type, title,
                    content, synopsis, item_order, metadata,
                    is_archived, archived_at, created_at, updated_at, deleted_at
                FROM writing_items wi
                WHERE NOT EXISTS (
                    SELECT 1 FROM items i 
                    WHERE i.title = wi.title 
                    AND i.user_id = wi.user_id 
                    AND i.project_id = wi.project_id
                )
            ");
        }

        // 4. Drop writing_items table if it exists
        Schema::dropIfExists('writing_items');
    }

    public function down()
    {
        // 1. Recreate writing_items table
        Schema::create('writing_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('writing_items')->onDelete('cascade');
            $table->string('type')->comment('folder, scene, chapter, note, image, mindmap, etc.');
            $table->string('title');
            $table->longText('content')->nullable()->comment('HTML/Markdown content for text items');
            $table->text('synopsis')->nullable()->comment('For corkboard view');
            $table->integer('item_order')->default(0);
            $table->json('metadata')->nullable()->comment('Flexible field for status, labels, custom metadata');
            $table->boolean('is_archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['project_id', 'type']);
            $table->index(['parent_id', 'item_order']);
            $table->index('user_id');
        });

        // 2. Move data back from items to writing_items
        DB::statement("
            INSERT INTO writing_items (
                user_id, project_id, parent_id, type, title, 
                content, synopsis, item_order, metadata, 
                is_archived, archived_at, created_at, updated_at, deleted_at
            )
            SELECT 
                user_id, project_id, parent_id, type, title,
                content, synopsis, item_order, metadata,
                is_archived, archived_at, created_at, updated_at, deleted_at
            FROM items
        ");

        // 3. Revert foreign key references in writing-specific tables
        $tablesToRevert = [
            'writing_compiled_output_items' => 'writing_item_id',
            'writing_item_versions' => 'writing_item_id',
            'writing_media' => 'writing_item_id',
            'writing_mindmap_node_links' => 'writing_item_id',
            'writing_mindmap_node_versions' => 'writing_item_id',
            'writing_mindmap_nodes' => 'writing_item_id',
            'writing_mindmaps' => 'writing_item_id',
            'writing_note_references' => 'writing_item_id',
            'writing_notes' => 'writing_item_id',
            'writing_comments' => 'writing_item_id',
            'writing_item_links' => ['source_item_id', 'target_item_id'],
        ];

        foreach ($tablesToRevert as $table => $column) {
            if (Schema::hasTable($table)) {
                // Create temporary column
                Schema::table($table, function (Blueprint $table) use ($column) {
                    $table->unsignedBigInteger('old_writing_item_id')->nullable()->after($column);
                });

                // Copy data back with mapping
                DB::statement("
                    UPDATE {$table} t
                    JOIN items i ON t.{$column} = i.id
                    JOIN writing_items wi ON wi.title = i.title 
                        AND wi.user_id = i.user_id 
                        AND wi.project_id = i.project_id
                    SET t.old_writing_item_id = wi.id
                ");

                // Drop foreign key if exists
                $fkExists = DB::select("
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_NAME = '{$table}' 
                    AND COLUMN_NAME = '{$column}' 
                    AND CONSTRAINT_SCHEMA = DATABASE() 
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                ");
                
                if (!empty($fkExists)) {
                    DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY " . $fkExists[0]->CONSTRAINT_NAME);
                }

                // Drop column and rename back
                Schema::table($table, function (Blueprint $table) use ($column) {
                    $table->dropColumn($column);
                    $table->renameColumn('old_writing_item_id', $column);
                    $table->foreign($column)->references('id')->on('writing_items')->onDelete('cascade');
                });
            }
        }

        // 4. Remove added columns from items table
        Schema::table('items', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['parent_id', 'is_archived', 'archived_at']);
            $table->dropIndex(['parent_id', 'item_order']);
            $table->dropIndex('is_archived');
        });
    }
}; 
