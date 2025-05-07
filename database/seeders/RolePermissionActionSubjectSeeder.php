<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Facades\DB;

class RolePermissionActionSubjectSeeder extends Seeder
{
    public function run()
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Clear existing data
        DB::table('role_permissions')->truncate();
        DB::table('permissions')->truncate();
        DB::table('roles')->truncate();

        // Enable foreign key checks again
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Define subjects and actions
        $subjects = ['admin', 'client', 'all'];
        $actions = ['create', 'read', 'update', 'delete', 'manage'];

        // Create permissions
        foreach ($subjects as $subject) {
            foreach ($actions as $action) {
                DB::table('permissions')->updateOrInsert(
                    [
                        'action' => $action,
                        'subject' => $subject,
                    ],
                    [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        // Create roles
        $roles = ['Admin', 'Client'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Define role hierarchy and permissions
        $roleHierarchy = [
            'admin' => ['admin', 'client', 'all'], // Admin gets everything
            'client' => ['client'],  // Client only gets client permissions
        ];

        // Assign permissions based on hierarchy
        $roles = Role::all();
        foreach ($roles as $role) {
            $roleName = strtolower($role->name);
            if (isset($roleHierarchy[$roleName])) {
                $allowedSubjects = $roleHierarchy[$roleName];
                
                // Get all permissions for allowed subjects
                $permissions = Permission::whereIn('subject', $allowedSubjects)->get();

                foreach ($permissions as $permission) {
                    DB::table('role_permissions')->updateOrInsert(
                        [
                            'role_id' => $role->id,
                            'permission_id' => $permission->id,
                        ],
                        [
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            }
        }
    }
}
