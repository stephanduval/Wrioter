<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('writing_media', function (Blueprint $table) {
            // Add Scrivener-specific fields
            $table->string('scrivener_uuid', 191)->nullable()->after('writing_item_id');
            $table->string('scrivener_type', 50)->nullable()->after('scrivener_uuid')
                ->comment('Type of Scrivener file (e.g., rtf, txt, pdf, etc.)');
            $table->string('scrivener_category', 50)->nullable()->after('scrivener_type')
                ->comment('Category in Scrivener (e.g., Draft, Research, Notes)');
            $table->boolean('include_in_compile')->nullable()->after('scrivener_category')
                ->comment('Whether this file should be included in compilation');
            $table->json('scrivener_metadata')->nullable()->after('include_in_compile')
                ->comment('Additional Scrivener-specific metadata');
            $table->string('version', 50)->nullable()->after('scrivener_metadata')
                ->comment('Version of the file in Scrivener');
            $table->timestamp('last_synced_at')->nullable()->after('version')
                ->comment('Last time this file was synced with Scrivener');
            
            // Add indexes for Scrivener fields
            $table->index('scrivener_uuid');
            $table->index(['writing_item_id', 'scrivener_type']);
            $table->index(['writing_item_id', 'scrivener_category']);
            
            // Add unique constraint for Scrivener UUID per item
            $table->unique(['writing_item_id', 'scrivener_uuid'], 'unique_item_scrivener_uuid');
        });
    }

    public function down()
    {
        Schema::table('writing_media', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex('writing_media_scrivener_uuid_index');
            $table->dropIndex('writing_media_writing_item_id_scrivener_type_index');
            $table->dropIndex('writing_media_writing_item_id_scrivener_category_index');
            $table->dropUnique('unique_item_scrivener_uuid');
            
            // Drop columns
            $table->dropColumn([
                'scrivener_uuid',
                'scrivener_type',
                'scrivener_category',
                'include_in_compile',
                'scrivener_metadata',
                'version',
                'last_synced_at'
            ]);
        });
    }
}; 
