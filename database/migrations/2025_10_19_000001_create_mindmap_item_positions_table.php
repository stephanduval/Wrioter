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
        Schema::create('mindmap_item_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_id')->constrained('writing_mindmaps')->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->json('position')->comment('{"x": number, "y": number}');
            $table->json('size')->nullable()->comment('{"width": number, "height": number}');
            $table->json('style')->nullable()->comment('Visual styling properties');
            $table->boolean('is_visible')->default(true);
            $table->boolean('is_collapsed')->default(false);
            $table->integer('z_index')->default(0);
            $table->timestamps();

            // Unique constraint - each item can only appear once per mindmap
            $table->unique(['mindmap_id', 'item_id'], 'unique_mindmap_item');

            // Indexes for performance
            $table->index('mindmap_id');
            $table->index('item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mindmap_item_positions');
    }
};
