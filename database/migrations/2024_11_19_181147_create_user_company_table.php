<?php

   // database/migrations/xxxx_xx_xx_xxxxxx_create_user_company_table.php

   use Illuminate\Database\Migrations\Migration;
   use Illuminate\Database\Schema\Blueprint;
   use Illuminate\Support\Facades\Schema;

   class CreateUserCompanyTable extends Migration
   {
       /**
        * Run the migrations.
        *
        * @return void
        */
       public function up()
       {
           Schema::create('user_company', function (Blueprint $table) {
               $table->id();
               $table->foreignId('user_id')->constrained()->onDelete('cascade');
               $table->foreignId('company_id')->constrained()->onDelete('cascade');
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
           Schema::dropIfExists('user_company');
       }
   }
