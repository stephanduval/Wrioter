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
        Schema::table('item_versions', function (Blueprint $table) {
            // Add new columns
            $table->string('name', 191)->nullable()->after('version_number')
                ->comment('Version name/label');
            $table->text('change_description')->nullable()->after('metadata')
                ->comment('Description of changes in this version');

            // Add index on created_at for better chronological queries
            $table->index('created_at', 'item_versions_created_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_versions', function (Blueprint $table) {
            // Drop the index
            $table->dropIndex('item_versions_created_at_index');

            // Drop the columns
            $table->dropColumn(['name', 'change_description']);
        });
    }
}; 
