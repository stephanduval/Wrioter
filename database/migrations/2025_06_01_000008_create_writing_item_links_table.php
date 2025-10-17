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
        Schema::create('writing_item_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('source_item_id')->constrained('writing_items')->onDelete('cascade');
            $table->foreignId('target_item_id')->constrained('writing_items')->onDelete('cascade');
            $table->string('relationship_type')->comment('reference, related, parent, child, etc.');
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Indexes
            $table->unique(['source_item_id', 'target_item_id', 'relationship_type'], 'wil_source_target_type_unique');
            $table->index(['source_item_id', 'relationship_type']);
            $table->index(['target_item_id', 'relationship_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_item_links');
    }
};
