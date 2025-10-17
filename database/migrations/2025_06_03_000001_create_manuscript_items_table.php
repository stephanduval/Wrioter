<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manuscript_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manuscript_id')->constrained()->onDelete('cascade');
            $table->foreignId('item_id')->constrained()->onDelete('cascade');
            $table->foreignId('item_version_id')->nullable()->constrained('item_versions')->onDelete('set null');
            $table->integer('order_index')->default(0);
            $table->boolean('is_independent')->default(false)->comment('If true, this item is a fork and can be modified independently');
            $table->foreignId('forked_from_id')->nullable()->constrained('manuscript_items')->onDelete('set null')->comment('Reference to the original manuscript_item if this is a fork');
            $table->json('metadata')->nullable()->comment('Additional metadata specific to this manuscript-item relationship');
            $table->timestamps();
            $table->softDeletes();

            // Ensure unique combination of manuscript and item, unless it's a fork
            $table->unique(['manuscript_id', 'item_id', 'is_independent'], 'unique_manuscript_item');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manuscript_items');
    }
}; 
