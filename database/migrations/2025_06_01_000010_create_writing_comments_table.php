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
        Schema::create('writing_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('writing_item_id')->constrained('writing_items')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('writing_comments')->onDelete('cascade');
            $table->text('content');
            $table->json('position')->nullable()->comment('Position in the document (e.g., line number, character position)');
            $table->string('type')->default('comment')->comment('comment, suggestion, question, etc.');
            $table->string('status')->default('active')->comment('active, resolved, archived');
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['writing_item_id', 'type']);
            $table->index(['writing_item_id', 'status']);
            $table->index('user_id');
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_comments');
    }
};
