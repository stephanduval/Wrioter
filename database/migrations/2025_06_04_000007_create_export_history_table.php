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
        Schema::create('export_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('manuscript_id')->constrained()->cascadeOnDelete();
            $table->string('export_type', 50)->notNull()
                  ->comment('e.g., pdf, epub, docx, etc.');
            $table->string('format', 50)->notNull()
                  ->comment('e.g., print, ebook, etc.');
            $table->json('export_settings')->nullable()
                  ->comment('Stores export configuration');
            $table->string('file_path', 255)->nullable()
                  ->comment('Path to the exported file');
            $table->string('file_name', 255)->nullable()
                  ->comment('Original name of the exported file');
            $table->unsignedBigInteger('file_size')->nullable()
                  ->comment('Size of the exported file in bytes');
            $table->string('status', 50)->default('completed')
                  ->comment('e.g., pending, completed, failed');
            $table->text('error_message')->nullable()
                  ->comment('Error message if export failed');
            $table->timestamps();

            // Add indexes
            $table->index('user_id');
            $table->index('manuscript_id');
            $table->index(['export_type', 'format']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('export_history');
    }
}; 
