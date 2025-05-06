<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProjectsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users');
            $table->string('title');
            $table->string('property')->nullable();
            $table->string('contact_email')->nullable();
            $table->timestamp('date_requested')->useCurrent();
            $table->enum('status', ['received', 'in_progress', 'delivered'])->default('received');
            $table->enum('time_preference', ['before_noon', 'before_4pm', 'anytime'])->default('anytime');
            $table->date('deadline')->nullable();
            $table->enum('service_type', ['translation', 'revision', 'modifications', 'transcription', 'voice_over', 'other'])->nullable();
            $table->text('service_description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('projects');
    }
}
