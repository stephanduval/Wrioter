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
            // Drop existing foreign key if it exists
            $table->dropForeign(['parent_id']);
        });

        Schema::table('items', function (Blueprint $table) {
            // Add foreign key constraint
            $table->foreign('parent_id')
                  ->references('id')
                  ->on('items')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
        });
    }
};
