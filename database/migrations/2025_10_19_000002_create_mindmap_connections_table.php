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
        Schema::create('mindmap_connections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_id')->constrained('writing_mindmaps')->onDelete('cascade');
            $table->foreignId('from_item_id')->constrained('items')->onDelete('cascade');
            $table->foreignId('to_item_id')->constrained('items')->onDelete('cascade');
            $table->enum('connection_type', ['one-way', 'two-way'])->default('one-way');
            $table->string('relationship_type', 50)->nullable()->comment('leads-to, contains, references, etc.');
            $table->string('label')->nullable();
            $table->json('style')->nullable()->comment('Connection styling');
            $table->json('path_data')->nullable()->comment('For curved connections');
            $table->timestamps();

            // Indexes for performance
            $table->index('mindmap_id');
            $table->index(['from_item_id', 'to_item_id'], 'idx_connections');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mindmap_connections');
    }
};
