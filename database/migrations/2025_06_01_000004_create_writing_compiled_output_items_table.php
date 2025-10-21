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
        Schema::create('writing_compiled_output_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compiled_output_id')->constrained('writing_compiled_outputs')->onDelete('cascade');
            $table->foreignId('writing_item_id')->constrained('writing_items')->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->json('export_metadata')->nullable()->comment('Export-specific settings for this item');
            $table->boolean('start_new_page')->default(false);
            $table->boolean('include_title')->default(true);
            $table->string('custom_title')->nullable();
            $table->timestamps();

            // Indexes
            $table->unique(['compiled_output_id', 'writing_item_id'], 'wcoi_compiled_output_id_writing_item_id_unique');
            $table->index(['compiled_output_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_compiled_output_items');
    }
};
