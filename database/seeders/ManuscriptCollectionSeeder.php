<?php

namespace Database\Seeders;

use App\Models\ManuscriptCollection;
use App\Models\Manuscript;
use App\Models\Item;
use Illuminate\Database\Seeder;

class ManuscriptCollectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->createCollectionsForTheLastChapter();
        $this->createCollectionsForEchoesOfTomorrow();
        $this->createCollectionsForGardenOfMemories();

        $this->command->info('Created manuscript collections and collection items');
    }

    /**
     * Create collections for "The Last Chapter" manuscript
     */
    private function createCollectionsForTheLastChapter(): void
    {
        $manuscript = Manuscript::where('title', 'The Last Chapter')->first();
        if (!$manuscript) return;

        // Main Story Chapters collection
        $mainStoryCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'main-story-chapters',
            'title' => 'Main Story Chapters',
            'type' => 'Arbitrary',
            'color' => '#3498db',
            'order_index' => 1,
        ]);

        // Add story chapters to the collection
        $storyChapters = Item::where('type', 'text')
            ->where('title', 'like', 'Chapter%')
            ->whereIn('title', [
                'Chapter 1: The Discovery',
                'Chapter 2: First Clues',
                'Chapter 3: The Plot Thickens'
            ])
            ->get();

        foreach ($storyChapters as $index => $chapter) {
            $mainStoryCollection->items()->attach($chapter->id, [
                'order_index' => $index + 1
            ]);
        }

        // Character Development collection
        $characterCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'character-development',
            'title' => 'Character Development',
            'type' => 'Arbitrary',
            'color' => '#e74c3c',
            'order_index' => 2,
        ]);

        // Add character-related items
        $characterItems = Item::whereIn('title', [
            'Sarah Chen - Protagonist',
            'The Author - Antagonist'
        ])->get();

        foreach ($characterItems as $index => $item) {
            $characterCollection->items()->attach($item->id, [
                'order_index' => $index + 1
            ]);
        }

        // Research Materials collection
        $researchCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'research-materials',
            'title' => 'Research Materials',
            'type' => 'Arbitrary',
            'color' => '#f39c12',
            'order_index' => 3,
        ]);

        // Add research items
        $researchItems = Item::whereIn('title', [
            'Meta-Fiction Research',
            'Meta-Fiction Articles'
        ])->get();

        foreach ($researchItems as $index => $item) {
            $researchCollection->items()->attach($item->id, [
                'order_index' => $index + 1
            ]);
        }

        // Planning & Structure collection
        $planningCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'planning-structure',
            'title' => 'Planning & Structure',
            'type' => 'Arbitrary',
            'color' => '#9b59b6',
            'order_index' => 4,
        ]);

        // Add planning items
        $planningItems = Item::whereIn('title', [
            'Plot Structure',
            'Chapter Outline'
        ])->get();

        foreach ($planningItems as $index => $item) {
            $planningCollection->items()->attach($item->id, [
                'order_index' => $index + 1
            ]);
        }
    }

    /**
     * Create collections for "Echoes of Tomorrow" manuscript
     */
    private function createCollectionsForEchoesOfTomorrow(): void
    {
        $manuscript = Manuscript::where('title', 'Echoes of Tomorrow')->first();
        if (!$manuscript) return;

        // Completed Chapters collection
        $completedCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'completed-chapters',
            'title' => 'Completed Chapters',
            'type' => 'Arbitrary',
            'color' => '#27ae60',
            'order_index' => 1,
        ]);

        // Add completed chapters
        $completedChapters = Item::where('type', 'text')
            ->whereIn('title', [
                'Chapter 1: First Contact',
                'Chapter 2: The Message',
                'Chapter 3: Departure'
            ])
            ->get();

        foreach ($completedChapters as $index => $chapter) {
            $completedCollection->items()->attach($chapter->id, [
                'order_index' => $index + 1
            ]);
        }

        // Science & Technology collection
        $scienceCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'science-technology',
            'title' => 'Science & Technology',
            'type' => 'Arbitrary',
            'color' => '#3498db',
            'order_index' => 2,
        ]);

        // Add science/tech items
        $scienceItems = Item::whereIn('title', [
            'Temporal Mechanics',
            'Future Timeline Map'
        ])->get();

        foreach ($scienceItems as $index => $item) {
            $scienceCollection->items()->attach($item->id, [
                'order_index' => $index + 1
            ]);
        }

        // Visual Elements collection
        $visualCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'visual-elements',
            'title' => 'Visual Elements',
            'type' => 'Arbitrary',
            'color' => '#e67e22',
            'order_index' => 3,
        ]);

        // Add mindmap items
        $mindmapItems = Item::where('type', 'mindmap')
            ->where('title', 'Future Timeline Map')
            ->get();

        foreach ($mindmapItems as $index => $item) {
            $visualCollection->items()->attach($item->id, [
                'order_index' => $index + 1
            ]);
        }
    }

    /**
     * Create collections for "The Garden of Memories" manuscript
     */
    private function createCollectionsForGardenOfMemories(): void
    {
        $manuscript = Manuscript::where('title', 'The Garden of Memories')->first();
        if (!$manuscript) return;

        // Final Manuscript collection
        $finalCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'final-manuscript',
            'title' => 'Final Manuscript',
            'type' => 'Arbitrary',
            'color' => '#2ecc71',
            'order_index' => 1,
        ]);

        // Add final draft items
        $finalDraftItems = Item::where('title', 'Chapter 1: Seeds of Memory')->get();

        foreach ($finalDraftItems as $index => $item) {
            $finalCollection->items()->attach($item->id, [
                'order_index' => $index + 1
            ]);
        }

        // Publication Ready collection
        $pubCollection = ManuscriptCollection::create([
            'manuscript_id' => $manuscript->id,
            'collection_id' => 'publication-ready',
            'title' => 'Publication Ready',
            'type' => 'Arbitrary',
            'color' => '#8e44ad',
            'order_index' => 2,
        ]);

        // Add publication materials
        $pubItems = Item::where('title', 'Query Letter')->get();

        foreach ($pubItems as $index => $item) {
            $pubCollection->items()->attach($item->id, [
                'order_index' => $index + 1
            ]);
        }
    }
}