<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReceiverIdToMessagesTable extends Migration
{
    public function up()
    {
        Schema::table('messages', function (Blueprint $table) {
            // Add the receiver_id column after sender_id
            $table->unsignedBigInteger('receiver_id')->after('sender_id')->nullable();

            // Add foreign key constraint
            $table->foreign('receiver_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['receiver_id']);

            // Drop the receiver_id column
            $table->dropColumn('receiver_id');
        });
    }
}
