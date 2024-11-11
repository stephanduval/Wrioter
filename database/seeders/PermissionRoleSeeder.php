<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $now = now();

        // Define the permission_role relationships
        $permissionRoleData = [
            ['role_id' => 1, 'permission_id' => 5, 'created_at' => $now, 'updated_at' => $now], // Admin - manage all
            ['role_id' => 1, 'permission_id' => 1, 'created_at' => $now, 'updated_at' => $now], // Admin - create Post
            ['role_id' => 1, 'permission_id' => 2, 'created_at' => $now, 'updated_at' => $now], // Admin - read Post
            ['role_id' => 1, 'permission_id' => 3, 'created_at' => $now, 'updated_at' => $now], // Admin - update Post
            ['role_id' => 1, 'permission_id' => 4, 'created_at' => $now, 'updated_at' => $now], // Admin - delete Post
            ['role_id' => 2, 'permission_id' => 2, 'created_at' => $now, 'updated_at' => $now], // User - read Post
            ['role_id' => 3, 'permission_id' => 2, 'created_at' => $now, 'updated_at' => $now], // Client - read Post
            ['role_id' => 4, 'permission_id' => 5, 'created_at' => $now, 'updated_at' => $now], // Manager - manage all
        ];

        // Insert data into the permission_role table
        DB::table('permission_role')->insert($permissionRoleData);
    }
}
