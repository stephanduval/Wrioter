<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;
use App\Models\Manuscript;
use App\Models\ManuscriptItem;
use App\Models\ItemVersion;
use App\Models\User;

class ManuscriptItemSeeder extends Seeder
{
    public function run(): void
    {
        // Get the first user (admin) for version history
        $user = User::first();

        // Connect items to "The Last Chapter" manuscript (ID: 1)
        $manuscript1 = Manuscript::find(1);
        
        // Add Chapter 1 (Item ID: 1) to manuscript
        $manuscriptItem1 = ManuscriptItem::create([
            'manuscript_id' => $manuscript1->id,
            'item_id' => 1, // Chapter 1
            'order_index' => 1,
            'is_independent' => false,
            'metadata' => json_encode([
                'status' => 'draft',
                'word_count' => 1500,
                'last_modified' => now()
            ])
        ]);

        // Create a version for Chapter 1
        ItemVersion::create([
            'item_id' => 1,
            'user_id' => $user->id,
            'content' => '# Chapter 1\n\nThis is the beginning of the story...',
            'synopsis' => 'The opening chapter that sets up the main conflict.',
            'version_number' => 1,
            'is_forked' => false,
            'metadata' => json_encode([
                'word_count' => 1500,
                'status' => 'draft'
            ])
        ]);

        // Add Plot Outline (Item ID: 2) to manuscript
        $manuscriptItem2 = ManuscriptItem::create([
            'manuscript_id' => $manuscript1->id,
            'item_id' => 2, // Plot Outline
            'order_index' => 0, // Put it before Chapter 1
            'is_independent' => false,
            'metadata' => json_encode([
                'status' => 'draft',
                'node_count' => 3,
                'last_modified' => now()
            ])
        ]);

        // Create a version for Plot Outline
        ItemVersion::create([
            'item_id' => 2,
            'user_id' => $user->id,
            'content' => '{"nodes":[{"id":1,"text":"Act 1","x":0,"y":0},{"id":2,"text":"Act 2","x":100,"y":0},{"id":3,"text":"Act 3","x":200,"y":0}]}',
            'synopsis' => 'A mindmap outlining the plot.',
            'version_number' => 1,
            'is_forked' => false,
            'metadata' => json_encode([
                'node_count' => 3,
                'status' => 'draft'
            ])
        ]);

        // Connect items to "Echoes of Tomorrow" manuscript (ID: 2)
        $manuscript2 = Manuscript::find(2);
        
        // Add Chapter 1 (Item ID: 3) to manuscript
        $manuscriptItem3 = ManuscriptItem::create([
            'manuscript_id' => $manuscript2->id,
            'item_id' => 3, // Chapter 1 for Echoes
            'order_index' => 1,
            'is_independent' => false,
            'metadata' => json_encode([
                'status' => 'draft',
                'word_count' => 1500,
                'last_modified' => now()
            ])
        ]);

        // Create a version for Chapter 1 of Echoes
        ItemVersion::create([
            'item_id' => 3,
            'user_id' => $user->id,
            'content' => '# Chapter 1\n\nThis is the beginning of the story...',
            'synopsis' => 'The opening chapter that sets up the main conflict.',
            'version_number' => 1,
            'is_forked' => false,
            'metadata' => json_encode([
                'word_count' => 1500,
                'status' => 'draft'
            ])
        ]);

        // Add Plot Outline (Item ID: 4) to manuscript
        $manuscriptItem4 = ManuscriptItem::create([
            'manuscript_id' => $manuscript2->id,
            'item_id' => 4, // Plot Outline for Echoes
            'order_index' => 0, // Put it before Chapter 1
            'is_independent' => false,
            'metadata' => json_encode([
                'status' => 'draft',
                'node_count' => 3,
                'last_modified' => now()
            ])
        ]);

        // Create a version for Plot Outline of Echoes
        ItemVersion::create([
            'item_id' => 4,
            'user_id' => $user->id,
            'content' => '{"nodes":[{"id":1,"text":"Act 1","x":0,"y":0},{"id":2,"text":"Act 2","x":100,"y":0},{"id":3,"text":"Act 3","x":200,"y":0}]}',
            'synopsis' => 'A mindmap outlining the plot.',
            'version_number' => 1,
            'is_forked' => false,
            'metadata' => json_encode([
                'node_count' => 3,
                'status' => 'draft'
            ])
        ]);
    }
} 
