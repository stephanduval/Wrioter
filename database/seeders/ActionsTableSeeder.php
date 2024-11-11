<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ActionsTableSeeder extends Seeder
{
    public function run()
    {
        $actions = [
            [
                'name' => 'create',
                'description' => 'Ability to create new resources',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'read',
                'description' => 'Ability to view resources',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'update',
                'description' => 'Ability to modify existing resources',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'delete',
                'description' => 'Ability to remove resources',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'manage',
                'description' => 'Full control over resources',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('actions')->insert($actions);
    }
}
