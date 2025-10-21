<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Modify messages table to match new schema
        Schema::table('messages', function (Blueprint $table) {
            // Only drop columns if they exist
            if (Schema::hasColumn('messages', 'task_status')) {
                $table->dropColumn('task_status');
            }
            if (Schema::hasColumn('messages', 'is_archived')) {
                $table->dropColumn('is_archived');
            }
            
            // Modify status enum if it exists
            if (Schema::hasColumn('messages', 'status')) {
                $table->enum('status', ['draft', 'archived', 'deleted', 'sent', 'read'])->default('draft')->change();
            }
            
            // Add due_date only if it doesn't exist
            if (!Schema::hasColumn('messages', 'due_date')) {
                $table->date('due_date')->nullable();
            }
        });

        // Remove renaming of writing_items to items
        // Only modify items table structure
        Schema::table('items', function (Blueprint $table) {
            // Drop foreign key constraint for parent_id if it exists
            if (Schema::hasColumn('items', 'parent_id')) {
                $fkExists = DB::select(
                    "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'items' AND COLUMN_NAME = 'parent_id' AND CONSTRAINT_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL"
                );
                if (!empty($fkExists)) {
                    DB::statement('ALTER TABLE items DROP FOREIGN KEY ' . $fkExists[0]->CONSTRAINT_NAME);
                }
            }
            if (Schema::hasColumn('items', 'parent_id')) {
                $table->dropColumn('parent_id');
            }
            // Only drop columns if they exist
            if (Schema::hasColumn('items', 'version')) {
                $table->dropColumn('version');
            }
            if (Schema::hasColumn('items', 'order')) {
                $table->dropColumn('order');
            }
            
            // Add new columns only if they don't exist
            if (!Schema::hasColumn('items', 'file_path_or_url')) {
                $table->string('file_path_or_url')->nullable();
            }
            if (!Schema::hasColumn('items', 'metadata')) {
                $table->json('metadata')->nullable();
            }
            
            // Modify type enum if it exists
            if (Schema::hasColumn('items', 'type')) {
                $table->enum('type', ['text', 'image', 'link', 'file', 'mindmap', 'compiled_output'])->change();
            }
        });

        // Rename other writing_* tables to match new schema
        if (Schema::hasTable('writing_item_links')) {
            Schema::rename('writing_item_links', 'item_links');
        }
        if (Schema::hasTable('writing_comments')) {
            Schema::rename('writing_comments', 'comments');
        }
        
        // Modify item_links table structure
        Schema::table('item_links', function (Blueprint $table) {
            if (Schema::hasColumn('item_links', 'version')) {
                $table->dropColumn('version');
            }
            if (!Schema::hasColumn('item_links', 'link_type')) {
                $table->string('link_type')->nullable();
            }
            if (!Schema::hasColumn('item_links', 'description')) {
                $table->text('description')->nullable();
            }
        });

        // Modify comments table structure
        Schema::table('comments', function (Blueprint $table) {
            if (Schema::hasColumn('comments', 'version')) {
                $table->dropColumn('version');
            }
            if (!Schema::hasColumn('comments', 'status')) {
                $table->enum('status', ['active', 'archived', 'deleted'])->default('active');
            }
        });
    }

    public function down()
    {
        // Revert messages table changes
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'task_status')) {
                $table->string('task_status')->default('new');
            }
            if (!Schema::hasColumn('messages', 'is_archived')) {
                $table->boolean('is_archived')->default(false);
            }
            if (Schema::hasColumn('messages', 'status')) {
                $table->enum('status', ['draft', 'sent', 'read', 'archived', 'deleted'])->default('draft')->change();
            }
            if (Schema::hasColumn('messages', 'due_date')) {
                $table->dropColumn('due_date');
            }
        });

        // Revert items table changes (do not rename back)
        Schema::table('items', function (Blueprint $table) {
            if (!Schema::hasColumn('items', 'version')) {
                $table->integer('version')->default(1);
            }
            if (!Schema::hasColumn('items', 'parent_id')) {
                $table->unsignedBigInteger('parent_id')->nullable();
            }
            if (!Schema::hasColumn('items', 'order')) {
                $table->integer('order')->default(0);
            }
            if (Schema::hasColumn('items', 'file_path_or_url')) {
                $table->dropColumn('file_path_or_url');
            }
            if (Schema::hasColumn('items', 'metadata')) {
                $table->dropColumn('metadata');
            }
            if (Schema::hasColumn('items', 'type')) {
                $table->enum('type', ['text', 'image', 'link', 'file', 'mindmap'])->change();
            }
        });

        // Revert item_links table changes
        Schema::table('item_links', function (Blueprint $table) {
            if (!Schema::hasColumn('item_links', 'version')) {
                $table->integer('version')->default(1);
            }
            if (Schema::hasColumn('item_links', 'link_type')) {
                $table->dropColumn('link_type');
            }
            if (Schema::hasColumn('item_links', 'description')) {
                $table->dropColumn('description');
            }
        });
        
        if (Schema::hasTable('item_links')) {
            Schema::rename('item_links', 'writing_item_links');
        }

        // Revert comments table changes
        Schema::table('comments', function (Blueprint $table) {
            if (!Schema::hasColumn('comments', 'version')) {
                $table->integer('version')->default(1);
            }
            if (Schema::hasColumn('comments', 'status')) {
                $table->dropColumn('status');
            }
        });
        
        if (Schema::hasTable('comments')) {
            Schema::rename('comments', 'writing_comments');
        }
    }
}; 
