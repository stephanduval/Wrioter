<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Extend items.type enum to include 'snippet_collection'
        DB::statement("ALTER TABLE items MODIFY COLUMN type ENUM('text','image','link','file','mindmap','compiled_output','folder','snippet_collection') NOT NULL DEFAULT 'text'");

        // Create snippet_references table for tracking individual snippets
        Schema::create('snippet_references', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_item_id')
                ->constrained('items')
                ->onDelete('cascade')
                ->comment('The snippet collection Item');
            $table->foreignId('source_item_id')
                ->nullable()
                ->constrained('items')
                ->onDelete('set null')
                ->comment('Source document (null if deleted)');

            // Position tracking using TipTap-compatible data
            $table->json('position_data')
                ->comment('TipTap position: {from, to}');
            $table->string('anchor_text_before', 100)
                ->nullable()
                ->comment('Text before selection for fuzzy matching');
            $table->string('anchor_text_after', 100)
                ->nullable()
                ->comment('Text after selection for fuzzy matching');

            // Content tracking
            $table->text('reference_text')
                ->comment('The original selected text');
            $table->text('current_text')
                ->nullable()
                ->comment('Last known text from source (for ghost state)');
            $table->string('content_hash', 64)
                ->comment('SHA256 hash of reference_text for change detection');

            // State management
            $table->enum('status', ['active', 'ghost'])
                ->default('active');
            $table->timestamp('last_verified_at')
                ->nullable();
            $table->timestamp('became_ghost_at')
                ->nullable();

            // Display ordering
            $table->integer('order_index')
                ->default(0);

            // Flexible metadata
            $table->json('metadata')
                ->nullable()
                ->comment('Custom styling, notes, tags');

            $table->timestamps();
            $table->softDeletes();

            // Indexes for performance
            $table->index(['collection_item_id', 'order_index'], 'sr_collection_order_idx');
            $table->index(['source_item_id', 'status'], 'sr_source_status_idx');
            $table->index('content_hash', 'sr_content_hash_idx');
        });

        // Create snippet_markers table for tracking position markers embedded in source documents
        Schema::create('snippet_markers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('snippet_reference_id')
                ->constrained('snippet_references')
                ->onDelete('cascade');
            $table->string('marker_id', 36)
                ->unique()
                ->comment('UUID marker embedded in TipTap document');
            $table->json('position_snapshot')
                ->comment('Position at time of creation');
            $table->timestamps();

            $table->index('marker_id', 'sm_marker_id_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('snippet_markers');
        Schema::dropIfExists('snippet_references');

        // Revert items.type enum
        DB::statement("ALTER TABLE items MODIFY COLUMN type ENUM('text','image','link','file','mindmap','compiled_output','folder') NOT NULL DEFAULT 'text'");
    }
};
