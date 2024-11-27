<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Company;
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
            [
                'name' => 'admin',
                'email' => 'admin@admin.com',
                'password' => Hash::make('password123'), // Use a secure password
            ],
            [
                'name' => 'auth',
                'email' => 'auth@auth.com',
                'password' => Hash::make('password123'), // Use a secure password
            ],
            [
                'name' => 'manager',
                'email' => 'manager@manager.com',
                'password' => Hash::make('password123'), // Use a secure password
            ],
            [
                'name' => 'client',
                'email' => 'client@client.com',
                'password' => Hash::make('password123'), // Use a secure password
            ],
            [
                'name' => 'user',
                'email' => 'user@user.com',
                'password' => Hash::make('password123'), // Use a secure password
            ],
        ];

        // Find or create the "Freynet-Gagné" company
        $freynetGagne = Company::firstOrCreate(['company_name' => 'Freynet-Gagné']);

        // Define roles for specific users
        $userRoles = [
            'admin@admin.com' => 1,   // Admin role
            'auth@auth.com' => 2,    // Auth role
            'manager@manager.com' => 3, // Manager role
            'client@client.com' => 4,  // Client role
            'user@user.com' => 5,    // User role
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(['email' => $userData['email']], $userData);

            // Assign specific roles if email matches, else assign manager role (role_id = 3)
            $roleId = $userRoles[$userData['email']] ?? 3;

            DB::table('user_roles')->updateOrInsert(
                ['user_id' => $user->id, 'role_id' => $roleId],
                ['created_at' => now(), 'updated_at' => now()]
            );

            // Assign the user to the "Freynet-Gagné" company
            DB::table('user_company')->updateOrInsert(
                ['user_id' => $user->id, 'company_id' => $freynetGagne->id],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
