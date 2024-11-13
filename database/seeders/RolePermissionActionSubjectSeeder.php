<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RolePermissionActionSubjectSeeder extends Seeder
{
    public function run()
    {
        // First, clear existing data
        DB::table('role_permissions')->truncate();
        
        // Define permissions
        $permissions = [
            ['action' => 'create', 'subject' => 'Post'],
            ['action' => 'read', 'subject' => 'Post'],
            ['action' => 'update', 'subject' => 'Post'],
            ['action' => 'delete', 'subject' => 'Post'],
            ['action' => 'manage', 'subject' => 'all'],
        ];

        // Create permissions if they don't already exist
        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                [
                    'action' => $permission['action'],
                    'subject' => $permission['subject']
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }

        // Create roles if they don't exist
        $roles = ['Admin', 'User', 'Client', 'Manager'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Define role-permission relationships
        // Define role-permission relationships
$rolePermissions = [
    ['role_id' => 1, 'permission_id' => 1], // Admin can create
    ['role_id' => 1, 'permission_id' => 2], // Admin can read
    ['role_id' => 1, 'permission_id' => 3], // Admin can update
    ['role_id' => 1, 'permission_id' => 4], // Admin can delete
    ['role_id' => 1, 'permission_id' => 5], // Admin can manage all

    // User gets read-only access
    ['role_id' => 2, 'permission_id' => 2],

    // Client gets read-only access
    ['role_id' => 3, 'permission_id' => 2],

    // Manager can read, update, and manage
    ['role_id' => 4, 'permission_id' => 2],
    ['role_id' => 4, 'permission_id' => 3],
    ['role_id' => 4, 'permission_id' => 5],
];


        // Insert role-permission relationships
        foreach ($rolePermissions as $rp) {
            DB::table('role_permissions')->updateOrInsert(
                [
                    'role_id' => $rp['role_id'],
                    'permission_id' => $rp['permission_id']
                ],
                [
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }
    }
}
