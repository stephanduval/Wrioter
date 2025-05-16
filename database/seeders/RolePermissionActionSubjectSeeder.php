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
        try {
            // Disable foreign key checks
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');

            // Clear existing data
            DB::table('role_permissions')->truncate();
            DB::table('permissions')->truncate();
            DB::table('roles')->truncate();

            // Enable foreign key checks again
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            // Define subjects and actions
            $subjects = ['admin', 'client', 'all', 'projects', 'messages'];
            $actions = ['create', 'read', 'update', 'delete', 'manage'];

            // Create all permissions at once
            $permissionsToInsert = [];
            foreach ($subjects as $subject) {
                foreach ($actions as $action) {
                    $permissionsToInsert[] = [
                        'action' => $action,
                        'subject' => $subject,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }

            // Insert all permissions
            DB::table('permissions')->insert($permissionsToInsert);

            // Verify all permissions were created
            $allPermissions = DB::table('permissions')->get();
            \Log::info("Created permissions", [
                'count' => $allPermissions->count(),
                'permissions' => $allPermissions->pluck('subject', 'action')->toArray()
            ]);

            // After creating permissions
            $allPermissions = DB::table('permissions')->get();
            \Log::info("All permissions in database after creation", [
                'count' => $allPermissions->count(),
                'permissions' => $allPermissions->map(function($p) {
                    return [
                        'id' => $p->id,
                        'action' => $p->action,
                        'subject' => $p->subject
                    ];
                })->toArray()
            ]);

            // Create roles
            $roles = ['Admin', 'Client', 'User'];
            foreach ($roles as $roleName) {
                $role = Role::firstOrCreate(['name' => $roleName]);
                \Log::info("Created role", [
                    'id' => $role->id,
                    'name' => $roleName
                ]);
            }

            // Define role hierarchy and permissions
            $roleHierarchy = [
                'admin' => ['admin', 'client', 'all', 'projects', 'messages'],
                'client' => ['client', 'projects', 'messages'],
                'user' => ['client'],
            ];

            // Assign permissions based on hierarchy
            $roles = Role::all();
            foreach ($roles as $role) {
                $roleName = strtolower($role->name);
                if (isset($roleHierarchy[$roleName])) {
                    $allowedSubjects = $roleHierarchy[$roleName];
                    
                    // Get all permissions for allowed subjects
                    $permissions = DB::table('permissions')
                        ->whereIn('subject', $allowedSubjects)
                        ->get();
                    
                    \Log::info("Found permissions for role: {$roleName}", [
                        'count' => $permissions->count(),
                        'permissions' => $permissions->map(function($p) {
                            return [
                                'id' => $p->id,
                                'action' => $p->action,
                                'subject' => $p->subject
                            ];
                        })->toArray()
                    ]);

                    // Clear existing permissions
                    DB::table('role_permissions')->where('role_id', $role->id)->delete();

                    // Insert all permissions at once
                    $rolePermissions = $permissions->map(function ($permission) use ($role) {
                        return [
                            'role_id' => $role->id,
                            'permission_id' => $permission->id,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    })->toArray();

                    if (!empty($rolePermissions)) {
                        DB::table('role_permissions')->insert($rolePermissions);
                    }
                }
            }

            // Final verification
            $clientRole = Role::where('name', 'Client')->first();
            $clientPermissions = $clientRole->permissions->pluck('subject', 'action');
            \Log::info("Final Client role permissions", [
                'permissions' => $clientPermissions->toArray()
            ]);

        } catch (\Exception $e) {
            \Log::error("Seeder failed", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}
