<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('manuscripts', function (Blueprint $table) {
            // Add Scrivener-specific fields
            $table->enum('manuscript_type', ['standard', 'scrivener'])
                ->default('standard')
                ->after('title')
                ->comment('Type of manuscript (standard or Scrivener)');
            
            $table->string('scrivener_uuid', 191)
                ->nullable()
                ->after('manuscript_type')
                ->comment('Scrivener project UUID');
            
            $table->string('version', 50)
                ->nullable()
                ->after('scrivener_uuid')
                ->comment('Scrivener project version');
            
            $table->timestamp('imported_at')
                ->nullable()
                ->after('version')
                ->comment('When the Scrivener project was imported');
            
            $table->json('project_settings')
                ->nullable()
                ->after('imported_at')
                ->comment('Scrivener project settings (labels, statuses, etc.)');
            
            $table->json('compile_settings')
                ->nullable()
                ->after('project_settings')
                ->comment('Scrivener compilation settings');
            
            $table->json('custom_metadata')
                ->nullable()
                ->after('compile_settings')
                ->comment('Additional Scrivener-specific metadata');
            
            $table->timestamp('last_compiled_at')
                ->nullable()
                ->after('custom_metadata')
                ->comment('Last compilation timestamp');
            
            $table->timestamp('last_exported_at')
                ->nullable()
                ->after('last_compiled_at')
                ->comment('Last export timestamp');
            
            $table->timestamp('last_synced_at')
                ->nullable()
                ->after('last_exported_at')
                ->comment('Last sync with Scrivener timestamp');
            
            // Add indexes
            $table->index('manuscript_type');
            $table->index('scrivener_uuid');
            $table->index('imported_at');
            
            // Add unique constraint for Scrivener UUID per user
            $table->unique(['user_id', 'scrivener_uuid'], 'unique_user_scrivener_uuid');
        });
    }

    public function down()
    {
        Schema::table('manuscripts', function (Blueprint $table) {
            // Drop indexes first
            $table->dropIndex(['manuscript_type']);
            $table->dropIndex(['scrivener_uuid']);
            $table->dropIndex(['imported_at']);
            $table->dropUnique('unique_user_scrivener_uuid');
            
            // Drop columns
            $table->dropColumn([
                'manuscript_type',
                'scrivener_uuid',
                'version',
                'imported_at',
                'project_settings',
                'compile_settings',
                'custom_metadata',
                'last_compiled_at',
                'last_exported_at',
                'last_synced_at'
            ]);
        });
    }
}; 
