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
        // Create manuscript_groups table
        Schema::create('manuscript_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title', 191);
            $table->text('description')->nullable();
            $table->enum('type', ['personal', 'shared', 'client'])
                  ->default('personal');
            $table->timestamps();

            // Add index for user_id
            $table->index('user_id');
        });

        // Create manuscript_group_items pivot table
        Schema::create('manuscript_group_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manuscript_group_id')
                  ->constrained('manuscript_groups')
                  ->cascadeOnDelete();
            $table->foreignId('manuscript_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->integer('order_index')->default(0);
            $table->timestamps();

            // Add unique constraint for group_id and manuscript_id
            $table->unique(['manuscript_group_id', 'manuscript_id'], 'unique_group_manuscript');

            // Add indexes
            $table->index('manuscript_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order due to foreign key constraints
        Schema::dropIfExists('manuscript_group_items');
        Schema::dropIfExists('manuscript_groups');
    }
}; 
