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
                'name' => 'Administrator',
                'email' => 'info@freynet-gagne.com',
                'password' => Hash::make('password123'), // Use a secure password
            ],
            [
                'name' => 'Sophie',
                'email' => 'sophie@freynet-gagne.com',
                'password' => Hash::make('password123'), // Use a secure password
            ],
            
            [
                'name' => 'Admin User',
                'email' => 'admin@admin.com',
                'password' => Hash::make('password123'),
            ],
            [
                'name' => 'Client User',
                'email' => 'client@client.com',
                'password' => Hash::make('password123'),
            ],
        ];

        // Find or create the "Freynet-Gagné" company
        $freynetGagne = Company::firstOrCreate(['company_name' => 'Freynet-Gagné']);

        // Define roles for specific users by role name
        $userRoles = [
            'sophie@freynet-gagne.com' => 'Client',
            'info@freynet-gagne.com' => 'Admin',
            'admin@admin.com' => 'Admin',
            'client@client.com' => 'Client',
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(['email' => $userData['email']], $userData);

            // Assign role based on email, default to Client role
            $roleName = $userRoles[$userData['email']] ?? 'Client';
            $roleId = DB::table('roles')->where('name', $roleName)->value('id');

            if ($roleId) {
                DB::table('user_roles')->updateOrInsert(
                    ['user_id' => $user->id, 'role_id' => $roleId],
                    ['created_at' => now(), 'updated_at' => now()]
                );
            }

            // Assign the user to the "Freynet-Gagné" company
            DB::table('user_company')->updateOrInsert(
                ['user_id' => $user->id, 'company_id' => $freynetGagne->id],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
