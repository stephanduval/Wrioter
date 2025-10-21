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
        Schema::table('writing_mindmaps', function (Blueprint $table) {
            // Add is_default field to identify default mindmaps
            $table->boolean('is_default')->default(false)->after('is_template');

            // Add manuscript_id if it doesn't exist (it should from previous migrations)
            if (!Schema::hasColumn('writing_mindmaps', 'manuscript_id')) {
                $table->foreignId('manuscript_id')->nullable()
                    ->after('user_id')
                    ->constrained('manuscripts')
                    ->onDelete('cascade');
            }

            // Add unique constraint: only one default mindmap per manuscript
            $table->unique(['manuscript_id', 'is_default'], 'unique_default_mindmap_per_manuscript');

            // Add index for faster lookups
            $table->index(['manuscript_id', 'is_default'], 'idx_manuscript_default');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('writing_mindmaps', function (Blueprint $table) {
            // Drop indexes and constraints first
            $table->dropIndex('idx_manuscript_default');
            $table->dropUnique('unique_default_mindmap_per_manuscript');

            // Drop the column
            $table->dropColumn('is_default');
        });
    }
};