<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            // Drop existing indexes if they exist to avoid conflicts
            $table->dropIndexIfExists('items_content_fulltext');
            $table->dropIndexIfExists('items_content_markdown_fulltext');
            $table->dropIndexIfExists('items_synopsis_fulltext');
            $table->dropIndexIfExists('items_title_fulltext');

            // Add FULLTEXT indexes
            $table->fullText('content', 'items_content_fulltext');
            $table->fullText('content_markdown', 'items_content_markdown_fulltext');
            $table->fullText('synopsis', 'items_synopsis_fulltext');
            $table->fullText('title', 'items_title_fulltext');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            // Drop FULLTEXT indexes
            $table->dropFullText('items_content_fulltext');
            $table->dropFullText('items_content_markdown_fulltext');
            $table->dropFullText('items_synopsis_fulltext');
            $table->dropFullText('items_title_fulltext');
        });
    }
}; 
