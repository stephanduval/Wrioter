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
        Schema::create('mindmap_node_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_id')->constrained('writing_mindmaps')->onDelete('cascade');
            $table->foreignId('from_node_id')->constrained('writing_mindmap_nodes')->onDelete('cascade');
            $table->foreignId('to_node_id')->constrained('writing_mindmap_nodes')->onDelete('cascade');
            $table->enum('connection_type', ['one-way', 'two-way'])->default('one-way');
            $table->string('relationship_type', 100);
            $table->enum('strength', ['weak', 'medium', 'strong'])->default('medium');
            $table->json('style')->nullable()->comment('Visual style properties');
            $table->string('label')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index(['mindmap_id', 'from_node_id', 'to_node_id'], 'idx_mindmap_connections');
            $table->index('from_node_id', 'idx_from_node');
            $table->index('to_node_id', 'idx_to_node');
            $table->index('relationship_type', 'idx_relationship');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mindmap_node_connections');
    }
};