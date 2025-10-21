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
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100);
            $table->enum('type', ['hashtag', 'label', 'mention', 'category'])->default('hashtag');
            $table->string('color', 7)->nullable()->comment('Hex color code');
            $table->string('icon', 50)->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedBigInteger('parent_id')->nullable()->comment('For hierarchical tags');
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Unique constraint for slug per user
            $table->unique(['slug', 'user_id'], 'unique_tag_user');

            // Indexes for performance
            $table->index(['type', 'user_id'], 'idx_tag_type');
            $table->index('parent_id', 'idx_tag_parent');
            $table->index('usage_count', 'idx_tag_usage');

            // Foreign key for hierarchical tags
            $table->foreign('parent_id')->references('id')->on('tags')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};