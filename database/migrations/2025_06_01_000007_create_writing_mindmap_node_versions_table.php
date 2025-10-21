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
        Schema::create('writing_mindmap_node_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mindmap_node_id')->constrained('writing_mindmap_nodes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('name')->nullable()->comment('Version name/label');
            $table->string('title');
            $table->text('content')->nullable();
            $table->json('position')->nullable();
            $table->json('style')->nullable();
            $table->text('change_description')->nullable();
            $table->timestamps();

            // Indexes
            $table->index(['mindmap_node_id', 'created_at']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_mindmap_node_versions');
    }
};
