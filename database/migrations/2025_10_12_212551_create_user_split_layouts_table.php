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
        Schema::create('user_split_layouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('manuscript_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->json('layout_config');
            $table->boolean('is_default')->default(false);
            $table->boolean('is_preset')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'manuscript_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_split_layouts');
    }
};
