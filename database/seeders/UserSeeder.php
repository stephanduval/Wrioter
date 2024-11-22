<?php

        // database/seeders/UserSeeder.php

   namespace Database\Seeders;

   use Illuminate\Database\Seeder;
   use App\Models\User;
   use Illuminate\Support\Facades\Hash;
   use Illuminate\Support\Facades\DB;

   class UserSeeder extends Seeder
   {
       /**
        * Run the database seeds.
        *
        * @return void
        */
       public function run()
       {
           $users = [
               [
                   'name' => 'Sophie',
                   'email' => 'sophie@freynet-gagne.com',
                   'password' => Hash::make('password123'), // Use a secure password
               ],
               [
                   'name' => 'Jean-Paul',
                   'email' => 'Jean-paul@freynet-gagne.com',
                   'password' => Hash::make('password123'), // Use a secure password
               ],
               [
                   'name' => 'Maya',
                   'email' => 'maya@freynet-gagne.com',
                   'password' => Hash::make('password123'), // Use a secure password
               ],
           ];

           foreach ($users as $userData) {
               $user = User::firstOrCreate(['email' => $userData['email']], $userData);

               // Assign role ID 4 to each user
               DB::table('user_roles')->updateOrInsert(
                   ['user_id' => $user->id, 'role_id' => 4],
                   ['created_at' => now(), 'updated_at' => now()]
               );
           }
       }
   }
