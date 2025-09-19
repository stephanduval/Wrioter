<?php

namespace Database\Seeders;

use App\Models\ManuscriptGroup;
use App\Models\User;
use Illuminate\Database\Seeder;

class ManuscriptGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Find the user with email info@freynet-gagne.com
        $user = User::where('email', 'info@freynet-gagne.com')->first();

        if (!$user) {
            $this->command->error('User info@freynet-gagne.com not found!');
            return;
        }

        // Create manuscript groups for organization
        $groups = [
            [
                'title' => 'Current Projects',
                'description' => 'Manuscripts currently being worked on',
                'type' => 'personal',
            ],
            [
                'title' => 'Client Work',
                'description' => 'Projects for clients and publishers',
                'type' => 'client',
            ],
            [
                'title' => 'Archived Projects',
                'description' => 'Completed or shelved manuscripts',
                'type' => 'personal',
            ],
            [
                'title' => 'Collaborative Works',
                'description' => 'Shared projects with other writers',
                'type' => 'shared',
            ],
        ];

        foreach ($groups as $groupData) {
            ManuscriptGroup::create([
                ...$groupData,
                'user_id' => $user->id,
            ]);
        }

        $this->command->info('Created ' . count($groups) . ' manuscript groups');
    }
}