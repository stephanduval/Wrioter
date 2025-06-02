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
        // Create manuscript_shares table
        Schema::create('manuscript_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shared_by')->constrained('users')->cascadeOnDelete();
            $table->enum('share_type', ['group', 'manuscript'])->notNull();
            $table->unsignedBigInteger('share_target_id')->notNull()
                  ->comment('Either manuscript_group_id or manuscript_id');
            $table->enum('access_level', ['read', 'write', 'admin'])
                  ->default('read')
                  ->notNull();
            $table->timestamps();

            // Add index for shared_by
            $table->index('shared_by');
        });

        // Create manuscript_share_users pivot table
        Schema::create('manuscript_share_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('manuscript_share_id')
                  ->constrained('manuscript_shares')
                  ->cascadeOnDelete();
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamps();

            // Add unique constraint for share_id and user_id
            $table->unique(['manuscript_share_id', 'user_id'], 'unique_share_user');

            // Add indexes
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order due to foreign key constraints
        Schema::dropIfExists('manuscript_share_users');
        Schema::dropIfExists('manuscript_shares');
    }
}; 
