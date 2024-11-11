<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder

{
    public function run()
    {
        // Define permissions
        $permissions = [
            ['action' => 'create', 'subject' => 'Post'],
            ['action' => 'read', 'subject' => 'Post'],
            ['action' => 'update', 'subject' => 'Post'],
            ['action' => 'delete', 'subject' => 'Post'],
        ];

        // Create permissions if they don’t already exist
        foreach ($permissions as $permission) {
            Permission::firstOrCreate($permission);
        }

        // Define roles and assign permissions
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $adminRole->permissions()->sync(Permission::all());

        $userRole = Role::firstOrCreate(['name' => 'User']);
        $userRole->permissions()->sync(Permission::where('action', 'read')->get());

        $clientRole = Role::firstOrCreate(['name' => 'Client']);
        $clientRole->permissions()->sync(Permission::where('action', 'read')->get());

        $managerRole = Role::firstOrCreate(['name' => 'Manager']);
        $managerRole->permissions()->sync(Permission::whereIn('action', ['read', 'update'])->get());
    }
}
