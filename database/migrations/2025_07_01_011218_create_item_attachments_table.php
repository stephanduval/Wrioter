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
        Schema::create('item_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->onDelete('cascade');
            $table->string('file_type', 20); // pdf, jpg, wav, png, etc.
            $table->string('file_name');
            $table->longText('file_content'); // Raw file content (base64 encoded for binary)
            $table->longText('raw_content')->nullable(); // Original raw content for styles/comments
            $table->integer('file_size')->unsigned();
            $table->string('mime_type', 100);
            $table->string('scrivener_path'); // Original path in Scrivener project
            $table->json('metadata')->nullable(); // Extracted metadata (dimensions, duration, etc.)
            $table->timestamps();
            
            $table->index(['item_id', 'file_type']);
            $table->index('file_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_attachments');
    }
};
