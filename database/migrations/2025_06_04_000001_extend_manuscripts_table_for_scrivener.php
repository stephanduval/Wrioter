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
        Schema::table('manuscripts', function (Blueprint $table) {
            // Manuscript Type (REQUIRED FIRST)
            $table->enum('manuscript_type', ['standard', 'scrivener'])
                  ->default('standard')
                  ->after('title')
                  ->comment('Type of manuscript (standard or Scrivener import)');

            // Scrivener Project Identity (Scrivener-specific - NULL for standard)
            $table->string('scrivener_uuid', 191)
                  ->nullable()
                  ->after('manuscript_type')
                  ->comment('Scrivener Project UUID - NULL for standard manuscripts');
            $table->string('version', 50)
                  ->nullable()
                  ->after('scrivener_uuid')
                  ->comment('Scrivener Project Version - NULL for standard manuscripts');
            $table->timestamp('imported_at')
                  ->nullable()
                  ->after('version')
                  ->comment('When the Scrivener project was imported - NULL for standard manuscripts');

            // Scrivener Project Settings (Scrivener-specific - NULL for standard)
            $table->json('project_settings')
                  ->nullable()
                  ->after('imported_at')
                  ->comment('Stores Scrivener project-level settings including labels, statuses, keywords - NULL for standard manuscripts');
            $table->json('compile_settings')
                  ->nullable()
                  ->after('project_settings')
                  ->comment('Stores project-wide compile settings and targets - NULL for standard manuscripts');
            $table->json('custom_metadata')
                  ->nullable()
                  ->after('compile_settings')
                  ->comment('Stores user-defined project metadata - NULL for standard manuscripts');

            // Scrivener Project State (Scrivener-specific - NULL for standard)
            $table->timestamp('last_compiled_at')
                  ->nullable()
                  ->after('custom_metadata')
                  ->comment('Last time the project was compiled - NULL for standard manuscripts');
            $table->timestamp('last_exported_at')
                  ->nullable()
                  ->after('last_compiled_at')
                  ->comment('Last time the project was exported - NULL for standard manuscripts');
            $table->timestamp('last_synced_at')
                  ->nullable()
                  ->after('last_exported_at')
                  ->comment('Last time the project was synced with Scrivener - NULL for standard manuscripts');

            // Add unique constraint for user_id and scrivener_uuid
            $table->unique(['user_id', 'scrivener_uuid'], 'unique_user_scrivener_uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('manuscripts', function (Blueprint $table) {
            // Drop unique constraint first
            $table->dropUnique('unique_user_scrivener_uuid');

            // Drop all Scrivener-specific columns
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
