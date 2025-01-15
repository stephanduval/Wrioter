<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessageLabelsAndStatusesTables extends Migration
{
    public function up()
    {
        // Labels Table
        Schema::create('labels', function (Blueprint $table) {
            $table->id();
            $table->string('label_name');
            $table->unsignedBigInteger('user_id'); // The user who created the label
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users');
        });

        // Message_Labels Pivot Table
        Schema::create('message_labels', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('message_id');
            $table->unsignedBigInteger('label_id');
            $table->timestamps();
            $table->foreign('message_id')->references('id')->on('messages')->onDelete('cascade');
            $table->foreign('label_id')->references('id')->on('labels')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('message_labels');
        Schema::dropIfExists('labels');
    }
}
