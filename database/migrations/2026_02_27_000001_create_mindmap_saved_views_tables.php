<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mindmap_saved_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_id')->constrained('writing_mindmaps')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->json('settings')->nullable();
            $table->timestamps();

            $table->unique(['mindmap_id', 'user_id', 'name']);
        });

        Schema::create('mindmap_view_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('saved_view_id')->constrained('mindmap_saved_views')->cascadeOnDelete();
            $table->foreignId('item_id')->constrained('items')->cascadeOnDelete();
            $table->json('position');
            $table->json('size')->nullable();
            $table->json('style')->nullable();
            $table->boolean('is_collapsed')->default(false);
            $table->integer('z_index')->default(0);
            $table->timestamps();

            $table->unique(['saved_view_id', 'item_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mindmap_view_positions');
        Schema::dropIfExists('mindmap_saved_views');
    }
};
