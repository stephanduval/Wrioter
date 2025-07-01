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
        Schema::create('manuscript_raw_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manuscript_id')->constrained()->onDelete('cascade');
            $table->string('file_type', 50); // snapshots, compile, styles, writing_history, etc.
            $table->string('file_name');
            $table->longText('file_content'); // Raw file content
            $table->integer('file_size')->unsigned();
            $table->string('scrivener_path'); // Original path in Scrivener project
            $table->json('metadata')->nullable(); // Any additional metadata
            $table->timestamps();
            
            $table->index(['manuscript_id', 'file_type']);
            $table->index('file_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manuscript_raw_files');
    }
};
