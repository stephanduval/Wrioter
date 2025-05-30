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
        Schema::create('writing_mindmap_node_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_node_id')->constrained('writing_mindmap_nodes')->onDelete('cascade');
            $table->foreignId('writing_item_id')->constrained('writing_items')->onDelete('cascade');
            $table->string('relationship_type')->comment('reference, related, represents, etc.');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->unique(['mindmap_node_id', 'writing_item_id', 'relationship_type'], 'wmnl_node_item_type_unique');
            $table->index(['mindmap_node_id', 'relationship_type'], 'wmnl_node_type_idx');
            $table->index(['writing_item_id', 'relationship_type'], 'wmnl_item_type_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_mindmap_node_links');
    }
};
