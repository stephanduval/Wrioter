<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('items', function (Blueprint $table) {
            // Add Scrivener-specific fields
            $table->string('scrivener_uuid', 191)
                ->nullable()
                ->after('type')
                ->comment('Scrivener item UUID');
            
            $table->string('folder_type', 50)
                ->nullable()
                ->after('scrivener_uuid')
                ->comment('Type of folder in Scrivener (Draft, Research, etc.)');
            
            $table->string('icon_name', 100)
                ->nullable()
                ->after('folder_type')
                ->comment('Icon name in Scrivener');
            
            $table->boolean('include_in_compile')
                ->nullable()
                ->after('icon_name')
                ->comment('Whether this item should be included in compilation');
            
            $table->enum('target_type', ['Words', 'Characters'])
                ->nullable()
                ->after('include_in_compile')
                ->comment('Type of target (Words or Characters)');
            
            $table->unsignedInteger('target_count')
                ->nullable()
                ->after('target_type')
                ->comment('Target count for this item');
            
            $table->boolean('target_notify')
                ->nullable()
                ->after('target_count')
                ->comment('Whether to notify when target is reached');
            
            $table->json('format_metadata')
                ->nullable()
                ->after('target_notify')
                ->comment('Formatting metadata for this item');
            
            $table->mediumText('content_markdown')
                ->nullable()
                ->after('content')
                ->comment('Content in Markdown format');
            
            $table->mediumText('raw_content')
                ->nullable()
                ->after('content_markdown')
                ->comment('Raw content as stored in Scrivener');
            
            $table->enum('content_format', ['markdown', 'html'])
                ->default('markdown')
                ->after('raw_content')
                ->comment('Format of the content');
            
            $table->unsignedInteger('word_count')
                ->default(0)
                ->after('content_format')
                ->comment('Word count of the content');
            
            $table->unsignedInteger('character_count')
                ->default(0)
                ->after('word_count')
                ->comment('Character count of the content');
            
            // Add indexes
            $table->index('scrivener_uuid');
            $table->index('folder_type');
            $table->index(['type', 'folder_type']);
            $table->index('include_in_compile');
            
            // Add unique constraint for Scrivener UUID
            $table->unique('scrivener_uuid', 'unique_scrivener_uuid');
        });
    }

    public function down()
    {
        Schema::table('items', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['scrivener_uuid']);
            $table->dropIndex(['folder_type']);
            $table->dropIndex(['type', 'folder_type']);
            $table->dropIndex(['include_in_compile']);
            $table->dropUnique('unique_scrivener_uuid');
            
            // Drop columns
            $table->dropColumn([
                'scrivener_uuid',
                'folder_type',
                'icon_name',
                'include_in_compile',
                'target_type',
                'target_count',
                'target_notify',
                'format_metadata',
                'content_markdown',
                'raw_content',
                'content_format',
                'word_count',
                'character_count'
            ]);
        });
    }
}; 
