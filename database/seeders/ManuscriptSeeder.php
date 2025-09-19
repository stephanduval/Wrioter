<?php

namespace Database\Seeders;

use App\Models\Manuscript;
use App\Models\ManuscriptGroup;
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

        // Create diverse manuscripts
        $manuscripts = [
            [
                'title' => 'The Last Chapter',
                'description' => 'A gripping mystery novel about a writer who discovers their own story is being written by someone else. As reality and fiction blur, they must solve the mystery before the story ends.',
                'status' => 'in_progress',
                'manuscript_type' => 'standard',
            ],
            [
                'title' => 'Echoes of Tomorrow',
                'description' => 'A hard science fiction epic exploring time travel, parallel universes, and the consequences of trying to change the past. Features complex characters and mind-bending plot twists.',
                'status' => 'draft',
                'manuscript_type' => 'standard',
            ],
            [
                'title' => 'The Garden of Memories',
                'description' => 'A magical realism novel about an elderly woman who tends a garden where each plant holds the memory of someone who has passed away.',
                'status' => 'completed',
                'manuscript_type' => 'standard',
            ],
            [
                'title' => 'Client Project: Corporate Thriller',
                'description' => 'A commissioned thriller about corporate espionage in the tech industry. High-stakes drama with modern relevance.',
                'status' => 'in_progress',
                'manuscript_type' => 'standard',
            ],
            [
                'title' => 'Poetry Collection: Urban Sunrise',
                'description' => 'A collection of contemporary poems exploring themes of urban life, hope, and human connection in the digital age.',
                'status' => 'draft',
                'manuscript_type' => 'standard',
            ],
        ];

        $createdManuscripts = [];
        foreach ($manuscripts as $manuscriptData) {
            $manuscript = Manuscript::create([
                ...$manuscriptData,
                'user_id' => $user->id,
            ]);
            $createdManuscripts[] = $manuscript;
        }

        // Assign manuscripts to groups
        $currentProjects = ManuscriptGroup::where('title', 'Current Projects')->first();
        $clientWork = ManuscriptGroup::where('title', 'Client Work')->first();
        $archivedProjects = ManuscriptGroup::where('title', 'Archived Projects')->first();

        if ($currentProjects && $clientWork && $archivedProjects) {
            // Assign manuscripts to groups using the relationship methods
            $currentProjects->addManuscript($createdManuscripts[0], 1); // The Last Chapter
            $currentProjects->addManuscript($createdManuscripts[1], 2); // Echoes of Tomorrow
            $currentProjects->addManuscript($createdManuscripts[4], 3); // Poetry Collection

            $clientWork->addManuscript($createdManuscripts[3], 1); // Client Project

            $archivedProjects->addManuscript($createdManuscripts[2], 1); // Garden of Memories
        }

        $this->command->info('Created ' . count($manuscripts) . ' manuscripts and assigned them to groups');
    }
}
