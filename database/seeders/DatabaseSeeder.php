<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            RolePermissionActionSubjectSeeder::class,
            CompanySeeder::class,
            UserSeeder::class,
            // ... other seeders
        ]);
    }
}
