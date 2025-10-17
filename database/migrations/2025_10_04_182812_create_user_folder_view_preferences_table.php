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
        Schema::create('user_folder_view_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('folder_id')->constrained('items')->onDelete('cascade');
            $table->enum('view_mode', ['manuscript', 'corkboard', 'outline'])->default('corkboard');
            $table->json('settings')->nullable();
            $table->timestamps();

            // Ensure one preference per user per folder
            $table->unique(['user_id', 'folder_id']);

            // Indexes for performance
            $table->index('user_id');
            $table->index('folder_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_folder_view_preferences');
    }
};
