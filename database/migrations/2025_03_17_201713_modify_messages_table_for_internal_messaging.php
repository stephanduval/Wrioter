<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ModifyMessagesTableForInternalMessaging extends Migration
{
    public function up()
    {
        Schema::table('messages', function (Blueprint $table) {
            // Check if receiver_id already exists
            if (!Schema::hasColumn('messages', 'receiver_id')) {
                $table->foreignId('receiver_id')->after('sender_id')->nullable()->constrained('users')->onDelete('cascade');
            }
        });

        // ✅ Ensure all existing records have a valid status before altering ENUM
        DB::statement("UPDATE messages SET status = 'draft' WHERE status NOT IN ('draft', 'archived', 'deleted', 'sent', 'read')");

        // ✅ Now modify the ENUM column safely
        DB::statement("ALTER TABLE messages MODIFY COLUMN status ENUM('draft', 'archived', 'deleted', 'sent', 'read') NOT NULL DEFAULT 'draft'");
    }

    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            if (Schema::hasColumn('messages', 'receiver_id')) {
                $table->dropForeign(['receiver_id']);
                $table->dropColumn('receiver_id');
            }
        });

        // ✅ Revert ENUM back to original values
        DB::statement("ALTER TABLE messages MODIFY COLUMN status ENUM('draft', 'archived', 'deleted') NOT NULL DEFAULT 'draft'");
    }
}
