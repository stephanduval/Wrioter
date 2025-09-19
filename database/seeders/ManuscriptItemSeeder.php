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
    private $user;

    public function run(): void
    {
        // Get the user for version history
        $this->user = User::where('email', 'info@freynet-gagne.com')->first();

        if (!$this->user) {
            $this->command->error('User info@freynet-gagne.com not found!');
            return;
        }

        $this->linkItemsToTheLastChapter();
        $this->linkItemsToEchoesOfTomorrow();
        $this->linkItemsToGardenOfMemories();
        $this->linkItemsToClientProject();
        $this->linkItemsToPoetryCollection();

        $this->command->info('Linked all items to manuscripts with comprehensive metadata');
    }

    /**
     * Link items to "The Last Chapter" manuscript
     */
    private function linkItemsToTheLastChapter(): void
    {
        $manuscript = Manuscript::where('title', 'The Last Chapter')->first();
        if (!$manuscript) return;

        // Get all items related to this manuscript
        $draftFolder = Item::where('title', 'Draft')->where('type', 'folder')->first();
        $researchFolder = Item::where('title', 'Research')->where('type', 'folder')->first();
        $charactersFolder = Item::where('title', 'Characters')->where('type', 'folder')->first();
        $planningFolder = Item::where('title', 'Planning')->where('type', 'folder')->first();

        $items = collect([
            // Folders first
            $draftFolder,
            $researchFolder,
            $charactersFolder,
            $planningFolder,
        ])->filter();

        // Add all child items
        $allItems = Item::whereIn('title', [
            'Draft', 'Chapter 1: The Discovery', 'Chapter 2: First Clues', 'Chapter 3: The Plot Thickens',
            'Research', 'Meta-Fiction Research', 'Meta-Fiction Articles',
            'Characters', 'Sarah Chen - Protagonist', 'The Author - Antagonist',
            'Planning', 'Plot Structure', 'Chapter Outline'
        ])->get();

        foreach ($allItems as $index => $item) {
            if (!$item) continue;

            $status = $this->getItemStatus($item);
            $metadata = $this->buildItemMetadata($item, $status);

            ManuscriptItem::create([
                'manuscript_id' => $manuscript->id,
                'item_id' => $item->id,
                'order_index' => $index + 1,
                'is_independent' => false,
                'metadata' => json_encode($metadata),
            ]);

            // Create item version
            $this->createItemVersion($item, $status);
        }
    }

    /**
     * Link items to "Echoes of Tomorrow" manuscript
     */
    private function linkItemsToEchoesOfTomorrow(): void
    {
        $manuscript = Manuscript::where('title', 'Echoes of Tomorrow')->first();
        if (!$manuscript) return;

        $allItems = Item::whereIn('title', [
            'Manuscript', 'Part I: The Discovery', 'Chapter 1: First Contact', 'Chapter 2: The Message',
            'Part II: The Journey', 'Chapter 3: Departure',
            'World Building', 'Temporal Mechanics', 'Future Timeline Map'
        ])->get();

        foreach ($allItems as $index => $item) {
            if (!$item) continue;

            $status = $this->getItemStatus($item);
            $metadata = $this->buildItemMetadata($item, $status);

            ManuscriptItem::create([
                'manuscript_id' => $manuscript->id,
                'item_id' => $item->id,
                'order_index' => $index + 1,
                'is_independent' => false,
                'metadata' => json_encode($metadata),
            ]);

            $this->createItemVersion($item, $status);
        }
    }

    /**
     * Link items to "The Garden of Memories" manuscript
     */
    private function linkItemsToGardenOfMemories(): void
    {
        $manuscript = Manuscript::where('title', 'The Garden of Memories')->first();
        if (!$manuscript) return;

        $allItems = Item::whereIn('title', [
            'Final Draft', 'Chapter 1: Seeds of Memory',
            'Publication Materials', 'Query Letter'
        ])->get();

        foreach ($allItems as $index => $item) {
            if (!$item) continue;

            $status = 'completed'; // This manuscript is completed
            $metadata = $this->buildItemMetadata($item, $status);

            ManuscriptItem::create([
                'manuscript_id' => $manuscript->id,
                'item_id' => $item->id,
                'order_index' => $index + 1,
                'is_independent' => false,
                'metadata' => json_encode($metadata),
            ]);

            $this->createItemVersion($item, $status);
        }
    }

    /**
     * Link items to "Client Project: Corporate Thriller" manuscript
     */
    private function linkItemsToClientProject(): void
    {
        $manuscript = Manuscript::where('title', 'Client Project: Corporate Thriller')->first();
        if (!$manuscript) return;

        $allItems = Item::whereIn('title', [
            'Client Draft', 'Chapter 1: The Whistleblower',
            'Client Requirements', 'Project Brief'
        ])->get();

        foreach ($allItems as $index => $item) {
            if (!$item) continue;

            $status = 'in_progress'; // Client work in progress
            $metadata = $this->buildItemMetadata($item, $status);

            ManuscriptItem::create([
                'manuscript_id' => $manuscript->id,
                'item_id' => $item->id,
                'order_index' => $index + 1,
                'is_independent' => false,
                'metadata' => json_encode($metadata),
            ]);

            $this->createItemVersion($item, $status);
        }
    }

    /**
     * Link items to "Poetry Collection: Urban Sunrise" manuscript
     */
    private function linkItemsToPoetryCollection(): void
    {
        $manuscript = Manuscript::where('title', 'Poetry Collection: Urban Sunrise')->first();
        if (!$manuscript) return;

        $allItems = Item::whereIn('title', [
            'Poems', 'Digital Dawn', 'Subway Connections',
            'Collection Notes', 'Thematic Structure'
        ])->get();

        foreach ($allItems as $index => $item) {
            if (!$item) continue;

            $status = 'draft'; // Poetry collection is in draft
            $metadata = $this->buildItemMetadata($item, $status);

            ManuscriptItem::create([
                'manuscript_id' => $manuscript->id,
                'item_id' => $item->id,
                'order_index' => $index + 1,
                'is_independent' => false,
                'metadata' => json_encode($metadata),
            ]);

            $this->createItemVersion($item, $status);
        }
    }

    /**
     * Determine item status based on content and type
     */
    private function getItemStatus(Item $item): string
    {
        // Folders are generally organizational
        if ($item->type === 'folder') {
            return 'in_progress';
        }

        // Text items with substantial content are in progress or completed
        if ($item->type === 'text' && $item->word_count > 100) {
            return rand(0, 1) ? 'in_progress' : 'completed';
        }

        // Mindmaps and planning items are usually draft
        if (in_array($item->type, ['mindmap', 'link'])) {
            return 'draft';
        }

        // Research items are usually completed
        if (strpos(strtolower($item->title), 'research') !== false) {
            return 'completed';
        }

        return 'draft';
    }

    /**
     * Build comprehensive metadata for manuscript items
     */
    private function buildItemMetadata(Item $item, string $status): array
    {
        $baseMetadata = [
            'status' => $status,
            'last_modified' => $item->updated_at ?? now(),
            'has_comments' => rand(0, 3) === 0, // 25% chance of having comments
            'is_compilable' => $item->include_in_compile,
        ];

        // Add type-specific metadata
        switch ($item->type) {
            case 'text':
                $baseMetadata['word_count'] = $item->word_count;
                $baseMetadata['character_count'] = $item->character_count;
                $baseMetadata['reading_time'] = ceil($item->word_count / 200); // ~200 WPM
                break;

            case 'mindmap':
                $content = json_decode($item->content, true);
                $baseMetadata['node_count'] = isset($content['nodes']) ? count($content['nodes']) : 0;
                $baseMetadata['connection_count'] = isset($content['connections']) ? count($content['connections']) : 0;
                break;

            case 'folder':
                $baseMetadata['folder_type'] = $item->folder_type ?? 'general';
                $childCount = Item::where('parent_id', $item->id)->count();
                $baseMetadata['child_count'] = $childCount;
                break;

            case 'link':
                $baseMetadata['url'] = $item->content;
                $baseMetadata['is_external'] = true;
                break;
        }

        // Add random progress indicators for some items
        if ($status === 'in_progress') {
            $baseMetadata['progress_percentage'] = rand(25, 85);
        }

        // Add difficulty/complexity rating for some items
        if (in_array($item->type, ['text', 'mindmap'])) {
            $baseMetadata['complexity'] = rand(1, 5);
        }

        return $baseMetadata;
    }

    /**
     * Create item version for the manuscript item
     */
    private function createItemVersion(Item $item, string $status): void
    {
        // Check if version already exists
        $existingVersion = ItemVersion::where('item_id', $item->id)->first();
        if ($existingVersion) {
            return; // Don't create duplicate versions
        }

        $versionMetadata = [
            'status' => $status,
            'created_from' => 'seeder',
            'edit_session_duration' => rand(15, 180), // minutes
        ];

        if ($item->type === 'text') {
            $versionMetadata['word_count'] = $item->word_count;
            $versionMetadata['character_count'] = $item->character_count;
        }

        ItemVersion::create([
            'item_id' => $item->id,
            'user_id' => $this->user->id,
            'content' => $item->content ?? '',
            'synopsis' => $item->synopsis ?? '',
            'version_number' => 1,
            'is_forked' => false,
            'metadata' => json_encode($versionMetadata),
            'created_at' => $item->created_at ?? now(),
            'updated_at' => $item->updated_at ?? now(),
        ]);
    }
} 
