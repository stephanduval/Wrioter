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
        // Fix items table columns for large Scrivener content
        Schema::table('items', function (Blueprint $table) {
            $table->longText('raw_content')->nullable()->change();
            $table->longText('content_markdown')->nullable()->change();
            $table->longText('synopsis')->nullable()->change();
        });

        // Fix item_versions table for large content
        Schema::table('item_versions', function (Blueprint $table) {
            $table->longText('content')->change();
            $table->longText('synopsis')->nullable()->change();
        });

        // Fix scrivener_imports table for better error handling
        Schema::table('scrivener_imports', function (Blueprint $table) {
            $table->longText('current_step')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->mediumText('raw_content')->nullable()->change();
            $table->mediumText('content_markdown')->nullable()->change();
            $table->text('synopsis')->nullable()->change();
        });

        Schema::table('item_versions', function (Blueprint $table) {
            $table->mediumText('content')->change();
            $table->text('synopsis')->nullable()->change();
        });

        Schema::table('scrivener_imports', function (Blueprint $table) {
            $table->text('current_step')->nullable()->change();
        });
    }
};
