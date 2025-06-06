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
            // Only add FULLTEXT indexes (do not drop anything)
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
            try {
                $table->dropIndex('items_content_fulltext');
            } catch (\Exception $e) {}
            try {
                $table->dropIndex('items_content_markdown_fulltext');
            } catch (\Exception $e) {}
            try {
                $table->dropIndex('items_synopsis_fulltext');
            } catch (\Exception $e) {}
            try {
                $table->dropIndex('items_title_fulltext');
            } catch (\Exception $e) {}
        });
    }
}; 
