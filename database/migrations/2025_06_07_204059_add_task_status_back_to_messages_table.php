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
        Schema::table('messages', function (Blueprint $table) {
            if (!Schema::hasColumn('messages', 'task_status')) {
                $table->string('task_status')->default('new')->after('is_starred');
            }
            if (!Schema::hasColumn('messages', 'is_archived')) {
                $table->boolean('is_archived')->default(false)->after('due_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'task_status')) {
                $table->dropColumn('task_status');
            }
            if (Schema::hasColumn('messages', 'is_archived')) {
                $table->dropColumn('is_archived');
            }
        });
    }
};
