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
        Schema::dropIfExists('writing_item_versions');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('writing_item_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('writing_item_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
        });
    }
};
