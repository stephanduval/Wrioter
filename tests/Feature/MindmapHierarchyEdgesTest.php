<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\WritingMindmap;
use App\Models\User;
use App\Services\FolderMindmapSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MindmapHierarchyEdgesTest extends TestCase
{
    use RefreshDatabase;

    private FolderMindmapSyncService $syncService;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->syncService = new FolderMindmapSyncService();
        $this->user = User::factory()->create();
    }

    /**
     * Test that hierarchy edges are created for nested items within a folder.
     *
     * Structure:
     * - Folder: Novel
     *   - Part 1
     *     - Scene 1.1
     *     - Scene 1.2
     *   - Part 2
     *   - Character: Alice (flat, no children)
     */
    public function test_hierarchy_edges_show_item_to_item_nesting()
    {
        // Create folder
        $folder = Item::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'folder',
            'title' => 'Novel',
        ]);

        // Create items in folder
        $part1 = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $folder->id,
            'title' => 'Part 1',
        ]);

        $part2 = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $folder->id,
            'title' => 'Part 2',
        ]);

        $alice = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $folder->id,
            'title' => 'Character: Alice',
        ]);

        // Create nested items under Part 1
        $scene11 = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $part1->id,
            'title' => 'Scene 1.1',
        ]);

        $scene12 = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $part1->id,
            'title' => 'Scene 1.2',
        ]);

        // Create mindmap
        $mindmap = WritingMindmap::create([
            'user_id' => $this->user->id,
            'folder_id' => $folder->id,
            'title' => 'Novel Mindmap',
            'format' => 'internal',
        ]);

        // Get hierarchy edges
        $edges = $this->syncService->computeHierarchyEdges($mindmap);

        // Verify edges: Part 1 -> Scene 1.1 and Part 1 -> Scene 1.2
        $this->assertCount(2, $edges, 'Should have 2 hierarchy edges (Part 1 -> Scene 1.1 and Part 1 -> Scene 1.2)');

        // Check Part 1 -> Scene 1.1 edge
        $scene11Edge = collect($edges)->firstWhere('target', 'item-' . $scene11->id);
        $this->assertNotNull($scene11Edge);
        $this->assertEquals('item-' . $part1->id, $scene11Edge['source']);
        $this->assertTrue($scene11Edge['data']['is_hierarchy']);
        $this->assertFalse($scene11Edge['data']['editable']);

        // Check Part 1 -> Scene 1.2 edge
        $scene12Edge = collect($edges)->firstWhere('target', 'item-' . $scene12->id);
        $this->assertNotNull($scene12Edge);
        $this->assertEquals('item-' . $part1->id, $scene12Edge['source']);

        // No edge for Part 2 or Alice (they have no children)
        $part2Edge = collect($edges)->firstWhere('source', 'item-' . $part2->id);
        $this->assertNull($part2Edge);

        $aliceEdge = collect($edges)->firstWhere('source', 'item-' . $alice->id);
        $this->assertNull($aliceEdge);
    }

    /**
     * Test that hierarchy edges do NOT include folder-to-item edges.
     * Only item-to-item edges should be shown.
     */
    public function test_hierarchy_edges_do_not_show_folder_to_item()
    {
        // Create folder
        $folder = Item::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'folder',
            'title' => 'Novel',
        ]);

        // Create items in folder
        $part1 = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $folder->id,
            'title' => 'Part 1',
        ]);

        Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $folder->id,
            'title' => 'Part 2',
        ]);

        // Create mindmap
        $mindmap = WritingMindmap::create([
            'user_id' => $this->user->id,
            'folder_id' => $folder->id,
            'title' => 'Novel Mindmap',
            'format' => 'internal',
        ]);

        // Get hierarchy edges
        $edges = $this->syncService->computeHierarchyEdges($mindmap);

        // Should be empty - no item-to-item nesting yet
        $this->assertCount(0, $edges, 'Should have 0 edges for flat folder structure');

        // No edges should source from the folder
        $folderEdges = collect($edges)->where('source', 'item-' . $folder->id);
        $this->assertCount(0, $folderEdges, 'Should not have folder-to-item edges');
    }

    /**
     * Test deeply nested structure (3 levels).
     *
     * Structure:
     * - Folder: Novel
     *   - Part 1
     *     - Chapter 1.1
     *       - Section 1.1.1
     */
    public function test_hierarchy_edges_with_deep_nesting()
    {
        // Create folder
        $folder = Item::factory()->create([
            'user_id' => $this->user->id,
            'type' => 'folder',
            'title' => 'Novel',
        ]);

        // Create nested structure
        $part1 = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $folder->id,
            'title' => 'Part 1',
        ]);

        $chapter11 = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $part1->id,
            'title' => 'Chapter 1.1',
        ]);

        $section111 = Item::factory()->create([
            'user_id' => $this->user->id,
            'parent_id' => $chapter11->id,
            'title' => 'Section 1.1.1',
        ]);

        // Create mindmap
        $mindmap = WritingMindmap::create([
            'user_id' => $this->user->id,
            'folder_id' => $folder->id,
            'title' => 'Novel Mindmap',
            'format' => 'internal',
        ]);

        // Get hierarchy edges
        $edges = $this->syncService->computeHierarchyEdges($mindmap);

        // Should have 2 edges: Part1->Chapter1.1 and Chapter1.1->Section1.1.1
        $this->assertCount(2, $edges, 'Should have 2 hierarchy edges for 3-level nesting');

        // Check Part 1 -> Chapter 1.1
        $chapter11Edge = collect($edges)->firstWhere('target', 'item-' . $chapter11->id);
        $this->assertNotNull($chapter11Edge);
        $this->assertEquals('item-' . $part1->id, $chapter11Edge['source']);

        // Check Chapter 1.1 -> Section 1.1.1
        $section111Edge = collect($edges)->firstWhere('target', 'item-' . $section111->id);
        $this->assertNotNull($section111Edge);
        $this->assertEquals('item-' . $chapter11->id, $section111Edge['source']);
    }
}
