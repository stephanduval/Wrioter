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
        Schema::create('writing_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('writing_item_id')->nullable()->constrained('writing_items')->onDelete('set null');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('filename');
            $table->string('original_filename');
            $table->string('mime_type');
            $table->string('disk')->default('local');
            $table->string('path');
            $table->integer('size')->comment('File size in bytes');
            $table->string('type')->comment('image, document, audio, video, etc.');
            $table->json('metadata')->nullable()->comment('Additional file metadata (dimensions, duration, etc.)');
            $table->json('alt_text')->nullable()->comment('Alternative text for accessibility');
            $table->string('caption')->nullable();
            $table->boolean('is_archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['writing_item_id', 'type']);
            $table->index('user_id');
            $table->index('mime_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_media');
    }
};
