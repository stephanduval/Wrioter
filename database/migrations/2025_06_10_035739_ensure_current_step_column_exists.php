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
        Schema::table('scrivener_imports', function (Blueprint $table) {
            if (!Schema::hasColumn('scrivener_imports', 'current_step')) {
                $table->string('current_step')->nullable()->after('processed_items');
            }
            if (!Schema::hasColumn('scrivener_imports', 'progress')) {
                $table->float('progress')->default(0)->after('status');
            }
            if (!Schema::hasColumn('scrivener_imports', 'total_items')) {
                $table->integer('total_items')->default(0)->after('progress');
            }
            if (!Schema::hasColumn('scrivener_imports', 'processed_items')) {
                $table->integer('processed_items')->default(0)->after('total_items');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scrivener_imports', function (Blueprint $table) {
            $table->dropColumn(['current_step', 'progress', 'total_items', 'processed_items']);
        });
    }
};
