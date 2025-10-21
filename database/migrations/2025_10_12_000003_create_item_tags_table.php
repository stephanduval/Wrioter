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
        Schema::create('item_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->foreignId('tag_id')->constrained()->onDelete('cascade');
            $table->text('context')->nullable()->comment('Surrounding text where tag was found');
            $table->integer('position')->nullable()->comment('Character position in content');
            $table->float('confidence')->default(1.0)->comment('For auto-extracted tags');
            $table->enum('added_by', ['user', 'system', 'ai'])->default('user');
            $table->timestamp('created_at')->useCurrent();

            // Unique constraint to prevent duplicate tags per item
            $table->unique(['item_id', 'tag_id'], 'unique_item_tag');

            // Indexes for performance
            $table->index(['tag_id', 'item_id'], 'idx_tag_items');
            $table->index('item_id', 'idx_item_tags');
            $table->index('added_by', 'idx_added_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_tags');
    }
};