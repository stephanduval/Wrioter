<?php
   // app/Models/Company.php

   namespace App\Models;

   use Illuminate\Database\Eloquent\Factories\HasFactory;
   use Illuminate\Database\Eloquent\Model;

   class Company extends Model
   {
       use HasFactory;

       // Specify the table if it's not the plural of the model name
       protected $table = 'companies';

       // Specify the attributes that are mass assignable
       protected $fillable = ['company_name'];
   }
