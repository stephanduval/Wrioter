<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Drop unique constraint on items (scrivener_uuid)
        Schema::table('items', function (Blueprint $table) {
            $table->dropUnique('unique_scrivener_uuid');
        });
    }

    public function down()
    {
        // Re-add unique constraint on manuscripts (user_id, scrivener_uuid) (if needed)
        // (Note: unique_user_scrivener_uuid is no longer present, so we do not re-add it.)

        // Re-add unique constraint on items (scrivener_uuid)
        Schema::table('items', function (Blueprint $table) {
            $table->unique('scrivener_uuid', 'unique_scrivener_uuid');
        });
    }
}; 
