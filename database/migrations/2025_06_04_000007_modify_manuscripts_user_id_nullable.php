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
        // Alter scrivener_imports: change 'current_step' to TEXT so that it can hold a full error message.
        Schema::table('scrivener_imports', function (Blueprint $table) {
            if (Schema::hasColumn('scrivener_imports', 'current_step')) {
                $table->text('current_step')->change();
            } else {
                $table->text('current_step')->nullable();
            }
        });

        // Alter manuscripts: drop FK, then change user_id to nullable (in production, a valid (logged-in) user_id will be assigned).
        Schema::table('manuscripts', function (Blueprint $table) {
             $table->dropForeign(['user_id']);
             $table->foreignId('user_id')->nullable()->change();
        });

        // Alter items: drop FK (if any) and then change user_id to nullable (in production, a valid (logged-in) user_id will be assigned).
         Schema::table('items', function (Blueprint $table) {
             // (If a FK exists, drop it first; otherwise, comment out or remove the dropForeign line.)
             // $table->dropForeign(['user_id']);
             $table->foreignId('user_id')->nullable()->change();
         });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         // Revert scrivener_imports: change 'current_step' back to a shorter VARCHAR (e.g. 255).
         Schema::table('scrivener_imports', function (Blueprint $table) {
             $table->string('current_step', 255)->change();
         });

         // Revert manuscripts: drop FK, then change user_id back to NOT NULL.
         Schema::table('manuscripts', function (Blueprint $table) {
             $table->dropForeign(['user_id']);
             $table->foreignId('user_id')->nullable(false)->change()->constrained()->onDelete('cascade');
         });

         // Revert items: drop FK (if any) and then change user_id back to NOT NULL.
         Schema::table('items', function (Blueprint $table) {
             // (If a FK exists, drop it first; otherwise, comment out or remove the dropForeign line.)
             // $table->dropForeign(['user_id']);
             $table->foreignId('user_id')->nullable(false)->change()->constrained()->onDelete('cascade');
         });
    }
}; 
