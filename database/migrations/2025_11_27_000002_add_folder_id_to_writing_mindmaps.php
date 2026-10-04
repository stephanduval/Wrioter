<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds folder_id to enable folder-specific mindmaps.
     * Each folder can have exactly one mindmap per user.
     */
    public function up(): void
    {
        Schema::table('writing_mindmaps', function (Blueprint $table) {
            $table->foreignId('folder_id')
                ->nullable()
                ->after('manuscript_id')
                ->constrained('items')
                ->onDelete('cascade');

            // Index for fast folder lookups
            $table->index('folder_id');

            // Only one mindmap per folder per user
            $table->unique(['folder_id', 'user_id'], 'unique_folder_mindmap');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('writing_mindmaps', function (Blueprint $table) {
            $table->dropUnique('unique_folder_mindmap');
            $table->dropIndex(['folder_id']);
            $table->dropForeign(['folder_id']);
            $table->dropColumn('folder_id');
        });
    }
};
