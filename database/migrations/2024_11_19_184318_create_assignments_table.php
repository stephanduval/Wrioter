<?php


   use Illuminate\Database\Migrations\Migration;
   use Illuminate\Database\Schema\Blueprint;
   use Illuminate\Support\Facades\Schema;

   class CreateAssignmentsTable extends Migration
   {
       /**
        * Run the migrations.
        *
        * @return void
        */
       public function up()
       {
           Schema::create('assignments', function (Blueprint $table) {
               $table->id();
               $table->string('title');
               $table->text('description')->nullable();
               $table->string('location')->nullable();
               $table->decimal('salary', 8, 2)->nullable();
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
           Schema::dropIfExists('assignments');
       }
   }
