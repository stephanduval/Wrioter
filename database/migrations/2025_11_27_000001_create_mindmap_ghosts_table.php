<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates ghost placeholder table for mindmaps.
     * When items are deleted, their position data is preserved as "ghosts"
     * so users can see what was removed from their mindmap.
     */
    public function up(): void
    {
        Schema::create('mindmap_ghosts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_id')
                ->constrained('writing_mindmaps')
                ->onDelete('cascade');

            // No FK - item is already deleted when ghost is created
            $table->unsignedBigInteger('original_item_id')
                ->comment('ID of the deleted item (no FK)');

            $table->string('label')
                ->comment('Cached item title for display');

            // Position data copied from mindmap_item_positions
            $table->json('position')
                ->comment('{"x": number, "y": number}');
            $table->json('size')
                ->nullable()
                ->comment('{"width": number, "height": number}');
            $table->json('style')
                ->nullable()
                ->comment('Visual styling from original position');
            $table->integer('z_index')
                ->default(0);

            // Metadata
            $table->string('item_type', 50)
                ->nullable()
                ->comment('text, folder, image, etc.');

            $table->timestamp('deleted_at')
                ->comment('When the original item was deleted');

            $table->timestamps();

            // Indexes
            $table->index('mindmap_id');
            $table->index('original_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mindmap_ghosts');
    }
};
