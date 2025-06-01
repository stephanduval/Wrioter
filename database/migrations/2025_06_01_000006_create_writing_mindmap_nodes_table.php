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
        Schema::create('writing_mindmap_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_id')->constrained('writing_mindmaps')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('writing_mindmap_nodes')->onDelete('cascade');
            $table->string('title');
            $table->text('content')->nullable();
            $table->json('position')->nullable()->comment('Node position in the mind map');
            $table->json('style')->nullable()->comment('Node styling (color, shape, etc.)');
            $table->integer('order')->default(0);
            $table->boolean('is_collapsed')->default(false);
            $table->timestamps();

            // Indexes
            $table->index(['mindmap_id', 'parent_id']);
            $table->index(['mindmap_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_mindmap_nodes');
    }
};
