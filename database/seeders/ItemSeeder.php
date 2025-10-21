<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\User;
use App\Models\Manuscript;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch the admin user (or a default user) by email
        $admin = User::where('email', 'admin@example.com')->first();
        if (!$admin) {
            $admin = User::first();
        }
        if (!$admin) {
            echo ("No admin (or default) user found. Skipping ItemSeeder.\n");
            return;
        }

        // Fetch all manuscripts (or create a dummy manuscript if none exist)
        $manuscripts = Manuscript::all();
        if ($manuscripts->isEmpty()) {
            echo ("No manuscripts found. Skipping ItemSeeder.\n");
            return;
        }

        foreach ($manuscripts as $manuscript) {
            // Create a text item (e.g. a chapter) for the manuscript
            $textItem = Item::create([
                 'user_id' => $admin->id,
                 'type' => 'text',
                 'title' => 'Chapter 1 - The Last Chapter',
                 'content' => "# Chapter 1\n\nThis is the beginning of the story...",
                 'synopsis' => 'The opening chapter that sets up the main conflict.',
                 'item_order' => 1,
                 'metadata' => json_encode(['status' => 'draft', 'word_count' => 1500]),
                 'updated_at' => now(),
                 'created_at' => now()
             ]);
             // (Optional) Attach the item to the manuscript (using manuscript_items pivot) if needed
             // (e.g. $manuscript->items()->attach($textItem->id, ['item_version_id' => $textItem->currentVersion->id, 'order_index' => 1, 'is_independent' => false]);)

             // Create a mindmap item (e.g. a plot outline) for the manuscript
             $mindmapItem = Item::create([
                 'user_id' => $admin->id,
                 'type' => 'mindmap',
                 'title' => 'Plot Outline',
                 'content' => json_encode(['nodes' => [['id' => 1, 'text' => 'Act 1', 'x' => 0, 'y' => 0], ['id' => 2, 'text' => 'Act 2', 'x' => 100, 'y' => 0], ['id' => 3, 'text' => 'Act 3', 'x' => 200, 'y' => 0]]]),
                 'synopsis' => 'A mindmap outlining the plot.',
                 'item_order' => 2,
                 'metadata' => json_encode(['status' => 'draft', 'node_count' => 3]),
                 'updated_at' => now(),
                 'created_at' => now()
             ]);
             // (Optional) Attach the mindmap item to the manuscript (using manuscript_items pivot) if needed
             // (e.g. $manuscript->items()->attach($mindmapItem->id, ['item_version_id' => $mindmapItem->currentVersion->id, 'order_index' => 2, 'is_independent' => false]);)
        }
    }
} 
