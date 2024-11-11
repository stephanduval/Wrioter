<?php

namespace Database\Seeders;

// database/seeders/SubjectsTableSeeder.php
use Illuminate\Database\Seeder;
use App\Models\Subject;

class SubjectsTableSeeder extends Seeder
{
    public function run()
    {
        $subjects = ['Auth', 'Admin', 'AclDemo', 'all'];

        foreach ($subjects as $subject) {
            Subject::create(['name' => $subject]);
        }
    }
};
