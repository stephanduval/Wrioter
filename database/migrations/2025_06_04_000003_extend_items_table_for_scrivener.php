<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            // Scrivener Item Identity (Scrivener-specific - NULL for standard)
            $table->string('scrivener_uuid', 191)
                  ->nullable()
                  ->after('type')
                  ->comment('Scrivener Item UUID - NULL for standard items');
            $table->string('folder_type', 50)
                  ->nullable()
                  ->after('scrivener_uuid')
                  ->comment('Scrivener folder type (chapter, scene, etc.) - NULL for standard items');
            $table->string('icon_name', 100)
                  ->nullable()
                  ->after('folder_type')
                  ->comment('Scrivener icon name - NULL for standard items');

            // Content Format (can be used by both standard and Scrivener)
            $table->mediumText('content_markdown')
                  ->nullable()
                  ->after('content')
                  ->comment('Markdown version of content - can be used by standard items');
            $table->string('raw_content', 1000)
                  ->nullable()
                  ->after('content_markdown')
                  ->comment('Stripped text for search - can be used by standard items');
            $table->enum('content_format', ['markdown', 'html'])
                  ->default('markdown')
                  ->after('raw_content')
                  ->comment('Current content format');
            $table->json('format_metadata')
                  ->nullable()
                  ->after('content_format')
                  ->comment('Format conversion metadata - NULL for standard items');

            // Compile Settings (Scrivener-specific - NULL for standard)
            $table->boolean('include_in_compile')
                  ->nullable()
                  ->after('icon_name')
                  ->comment('Whether to include in Scrivener compile - NULL for standard items');
            $table->enum('target_type', ['Words', 'Characters'])
                  ->nullable()
                  ->after('format_metadata')
                  ->comment('Scrivener target type - NULL for standard items');
            $table->unsignedInteger('target_count')
                  ->nullable()
                  ->after('target_type')
                  ->comment('Scrivener target count - NULL for standard items');
            $table->boolean('target_notify')
                  ->nullable()
                  ->after('target_count')
                  ->comment('Scrivener target notification - NULL for standard items');
            $table->unsignedInteger('word_count')
                  ->default(0)
                  ->after('target_notify')
                  ->comment('Current word count');
            $table->unsignedInteger('character_count')
                  ->default(0)
                  ->after('word_count')
                  ->comment('Current character count');

            // Add indexes
            $table->index('scrivener_uuid', 'idx_scrivener');
        });

        // Create FULLTEXT index after all columns are added
        DB::statement("ALTER TABLE items ADD FULLTEXT INDEX idx_content_fulltext (raw_content);");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex('idx_scrivener');
            DB::statement("ALTER TABLE items DROP INDEX idx_content_fulltext;");

            // Drop all Scrivener-specific columns
            $table->dropColumn([
                'scrivener_uuid',
                'folder_type',
                'icon_name',
                'content_markdown',
                'raw_content',
                'content_format',
                'format_metadata',
                'include_in_compile',
                'target_type',
                'target_count',
                'target_notify',
                'word_count',
                'character_count'
            ]);
        });
    }
}; 
