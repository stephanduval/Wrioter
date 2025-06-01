<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionActionSubjectSeeder::class,
            CompanySeeder::class,
            UserSeeder::class,
            ManuscriptSeeder::class,
            ItemSeeder::class,
            ManuscriptItemSeeder::class,
            // ... other seeders
        ]);
    }
}
