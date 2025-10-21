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
        Schema::create('writing_item_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('writing_item_id')->constrained('writing_items')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name')->nullable()->comment('Version name/label');
            $table->longText('content')->nullable();
            $table->text('synopsis')->nullable();
            $table->json('metadata')->nullable();
            $table->text('change_description')->nullable()->comment('Description of changes in this version');
            $table->timestamps();

            // Indexes
            $table->index(['writing_item_id', 'created_at']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_item_versions');
    }
};
