<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->text('synopsis')->nullable();
            $table->integer('version_number');
            $table->boolean('is_forked')->default(false);
            $table->foreignId('parent_version_id')->nullable()->constrained('item_versions')->onDelete('set null');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Ensure version numbers are unique per item
            $table->unique(['item_id', 'version_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('item_versions');
    }
}; 
