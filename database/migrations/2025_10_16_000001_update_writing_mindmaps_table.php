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
            // Make writing_item_id nullable
            $table->foreignId('writing_item_id')->nullable()->change();

            // Add new columns if they don't exist
            if (!Schema::hasColumn('writing_mindmaps', 'description')) {
                $table->text('description')->nullable()->after('title');
            }

            if (!Schema::hasColumn('writing_mindmaps', 'is_template')) {
                $table->boolean('is_template')->default(false)->after('format');
            }

            if (!Schema::hasColumn('writing_mindmaps', 'is_public')) {
                $table->boolean('is_public')->default(false)->after('is_template');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('writing_mindmaps', function (Blueprint $table) {
            // Revert changes
            $table->foreignId('writing_item_id')->nullable(false)->change();

            if (Schema::hasColumn('writing_mindmaps', 'description')) {
                $table->dropColumn('description');
            }

            if (Schema::hasColumn('writing_mindmaps', 'is_template')) {
                $table->dropColumn('is_template');
            }

            if (Schema::hasColumn('writing_mindmaps', 'is_public')) {
                $table->dropColumn('is_public');
            }
        });
    }
};
