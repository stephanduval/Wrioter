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
        // Create writing_history table
        Schema::create('writing_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('manuscript_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('date')->comment('Date of the writing session');

            // Manuscript-level statistics
            $table->unsignedInteger('draft_word_count')->default(0)
                  ->comment('Scrivener draft word count');
            $table->unsignedInteger('draft_char_count')->default(0)
                  ->comment('Scrivener draft character count');
            $table->unsignedInteger('other_word_count')->default(0)
                  ->comment('Scrivener other word count');
            $table->unsignedInteger('other_char_count')->default(0)
                  ->comment('Scrivener other character count');
            $table->unsignedInteger('session_word_count')->default(0)
                  ->comment('Scrivener session word count');
            $table->unsignedInteger('session_char_count')->default(0)
                  ->comment('Scrivener session character count');

            // User-level statistics (when manuscript_id is NULL)
            $table->unsignedInteger('total_word_count')->default(0)
                  ->comment('Total words across all manuscripts');
            $table->unsignedInteger('total_char_count')->default(0)
                  ->comment('Total characters across all manuscripts');
            $table->unsignedInteger('active_manuscripts')->default(0)
                  ->comment('Number of manuscripts worked on');

            $table->timestamps();

            // Add unique constraint for user, date, and manuscript combination
            $table->unique(['user_id', 'date', 'manuscript_id'], 'unique_user_date_manuscript');
        });

        // Create writing_goals table
        Schema::create('writing_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('manuscript_id')->nullable()->constrained()->cascadeOnDelete();
            $table->enum('goal_type', ['daily', 'weekly', 'monthly', 'project'])->notNull();
            $table->enum('target_type', ['words', 'characters', 'time'])->notNull();
            $table->unsignedInteger('target_count')->notNull();
            $table->date('start_date')->notNull();
            $table->date('end_date')->nullable()->comment('NULL for ongoing goals');
            $table->enum('status', ['active', 'completed', 'abandoned'])
                  ->default('active')
                  ->notNull();
            $table->timestamps();

            // Add indexes
            $table->index(['user_id', 'status']);
            $table->index(['manuscript_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('writing_goals');
        Schema::dropIfExists('writing_history');
    }
}; 
