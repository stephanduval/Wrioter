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
        // Drop the writing_items table if it exists
        Schema::dropIfExists('writing_items');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the writing_items table with its original structure
        Schema::create('writing_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('writing_items')->onDelete('cascade');
            $table->string('type')->comment('folder, scene, chapter, note, image, mindmap, etc.');
            $table->string('title');
            $table->longText('content')->nullable()->comment('HTML/Markdown content for text items');
            $table->text('synopsis')->nullable()->comment('For corkboard view');
            $table->integer('item_order')->default(0);
            $table->json('metadata')->nullable()->comment('Flexible field for status, labels, custom metadata');
            $table->boolean('is_archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['project_id', 'type']);
            $table->index(['parent_id', 'item_order']);
            $table->index('user_id');
        });
    }
}; 
