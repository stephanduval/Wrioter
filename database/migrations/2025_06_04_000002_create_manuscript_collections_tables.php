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
        // Create manuscript_collections table
        Schema::create('manuscript_collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manuscript_id')->constrained()->cascadeOnDelete();
            $table->string('collection_id', 191)->comment('Scrivener Collection UUID');
            $table->string('title', 191);
            $table->enum('type', ['Binder', 'RecentSearch', 'Arbitrary'])
                  ->comment('Scrivener collection type');
            $table->string('color', 50)->nullable()
                  ->comment('RGB color values for collection');
            $table->json('search_settings')->nullable()
                  ->comment('For search-based collections (Scrivener-specific)');
            $table->json('item_uuids')->nullable()
                  ->comment('For arbitrary collections - list of item UUIDs (Scrivener-specific)');
            $table->integer('order_index')->default(0);
            $table->timestamps();

            // Add unique constraint for manuscript_id and collection_id
            $table->unique(['manuscript_id', 'collection_id'], 'unique_manuscript_collection_id');
        });

        // Create collection_items pivot table
        Schema::create('collection_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained('manuscript_collections')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->integer('order_index')->default(0);
            $table->timestamps();

            // Add unique constraint for collection_id and item_id
            $table->unique(['collection_id', 'item_id'], 'unique_collection_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order due to foreign key constraints
        Schema::dropIfExists('collection_items');
        Schema::dropIfExists('manuscript_collections');
    }
}; 
