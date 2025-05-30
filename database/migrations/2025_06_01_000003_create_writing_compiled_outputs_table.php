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
        Schema::create('writing_compiled_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('type')->comment('manuscript, chapter, scene, etc.');
            $table->json('format_settings')->comment('Export format settings (PDF, EPUB, DOCX, etc.)');
            $table->json('metadata')->nullable()->comment('Additional export settings');
            $table->string('status')->default('draft')->comment('draft, published, archived');
            $table->timestamp('last_compiled_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['project_id', 'type']);
            $table->index('user_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_compiled_outputs');
    }
};
