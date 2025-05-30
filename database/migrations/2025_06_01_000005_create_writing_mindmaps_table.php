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
        Schema::create('writing_mindmaps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('writing_item_id')->constrained('writing_items')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->json('settings')->nullable()->comment('Mind map visualization settings');
            $table->string('format')->default('opml')->comment('opml, freemind, xmind');
            $table->boolean('is_archived')->default(false);
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('writing_item_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_mindmaps');
    }
};
