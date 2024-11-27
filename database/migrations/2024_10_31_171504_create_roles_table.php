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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Admin, User, Manager
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign key constraints in all dependent tables
        if (Schema::hasTable('user_roles')) {
            Schema::table('user_roles', function (Blueprint $table) {
                $table->dropForeign(['role_id']);
            });
        }

        if (Schema::hasTable('role_permissions')) {
            Schema::table('role_permissions', function (Blueprint $table) {
                $table->dropForeign(['role_id']);
            });
        }

        if (Schema::hasTable('role_ability_subject')) {
            Schema::table('role_ability_subject', function (Blueprint $table) {
                $table->dropForeign(['role_id']);
            });
        }

        // Drop dependent tables if required
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('role_ability_subject');

        // Finally, drop the 'roles' table
        Schema::dropIfExists('roles');
    }
};
