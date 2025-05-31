<?php

namespace Database\Seeders;

use App\Models\Manuscript;
use App\Models\User;
use Illuminate\Database\Seeder;

class ManuscriptSeeder extends Seeder
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

        // Create some dummy manuscripts
        $manuscripts = [
            [
                'title' => 'The Last Chapter',
                'description' => 'A mystery novel about a writer who discovers their own story is being written by someone else.',
                'status' => 'in_progress',
            ],
            [
                'title' => 'Echoes of Tomorrow',
                'description' => 'A science fiction story about time travel and its consequences.',
                'status' => 'draft',
            ],
        ];

        foreach ($manuscripts as $manuscriptData) {
            Manuscript::create([
                ...$manuscriptData,
                'user_id' => $user->id,
            ]);
        }
    }
}
