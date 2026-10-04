<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WritingMindmap;
use App\Models\MindmapItemPosition;
use App\Models\MindmapConnection;
use App\Models\MindmapGhost;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MindMapController extends Controller
{
    /**
     * Display a listing of mindmaps.
     */
    public function index(Request $request): JsonResponse
    {
        $mindmaps = WritingMindmap::where('user_id', Auth::id())
            ->when($request->get('archived'), function ($query) use ($request) {
                return $query->where('is_archived', $request->get('archived') === 'true');
            })
            ->when($request->get('is_template'), function ($query) use ($request) {
                return $query->where('is_template', $request->get('is_template') === 'true');
            })
            ->orderBy('updated_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($mindmaps);
    }

    /**
     * Store a newly created mindmap.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:191',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'format' => 'nullable|in:internal,opml,freemind,xmind',
            'is_template' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
        ]);

        $mindmap = WritingMindmap::create([
            ...$validated,
            'user_id' => Auth::id(),
            'format' => $validated['format'] ?? 'internal',
        ]);

        return response()->json($mindmap, 201);
    }

    /**
     * Display the specified mindmap with items, connections, and ghosts.
     */
    public function show($id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())
            ->with([
                'positions.item',
                'connections.fromItem',
                'connections.toItem',
                'ghosts'
            ])
            ->findOrFail($id);

        // Transform positions into node format for frontend
        $nodes = $mindmap->positions->map(function ($pos) {
            return [
                'id' => $pos->item_id,
                'data' => $pos->item,
                'position' => $pos->position,
                'size' => $pos->size,
                'style' => $pos->style,
                'is_visible' => $pos->is_visible,
                'is_collapsed' => $pos->is_collapsed,
                'z_index' => $pos->z_index,
            ];
        });

        // Transform ghosts for frontend
        $ghosts = $mindmap->ghosts->map(function ($ghost) {
            return [
                'id' => 'ghost_' . $ghost->id,
                'ghost_id' => $ghost->id,
                'original_item_id' => $ghost->original_item_id,
                'label' => $ghost->label,
                'item_type' => $ghost->item_type,
                'position' => $ghost->position,
                'size' => $ghost->size,
                'style' => $ghost->style,
                'z_index' => $ghost->z_index,
                'deleted_at' => $ghost->deleted_at,
                'is_ghost' => true,
            ];
        });

        return response()->json([
            'mindmap' => $mindmap,
            'nodes' => $nodes,
            'ghosts' => $ghosts,
            'edges' => $mindmap->connections,
        ]);
    }

    /**
     * Update the specified mindmap.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:191',
            'description' => 'nullable|string',
            'settings' => 'nullable|array',
            'is_template' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
            'is_archived' => 'nullable|boolean',
        ]);

        $mindmap->update($validated);

        if ($request->get('is_archived') === true) {
            $mindmap->archived_at = now();
            $mindmap->save();
        } elseif ($request->get('is_archived') === false) {
            $mindmap->archived_at = null;
            $mindmap->save();
        }

        return response()->json($mindmap);
    }

    /**
     * Remove the specified mindmap.
     */
    public function destroy($id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        DB::transaction(function () use ($mindmap) {
            // Cascading deletes will handle positions and connections
            $mindmap->delete();
        });

        return response()->json(['message' => 'Mindmap deleted successfully']);
    }

    /**
     * Add an existing item to the mindmap.
     */
    public function addItem(Request $request, $id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'position' => 'required|array',
            'position.x' => 'required|numeric',
            'position.y' => 'required|numeric',
            'size' => 'nullable|array',
            'style' => 'nullable|array',
        ]);

        // Verify user owns the item
        $item = Item::where('id', $validated['item_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $position = MindmapItemPosition::updateOrCreate(
            [
                'mindmap_id' => $id,
                'item_id' => $validated['item_id']
            ],
            [
                'position' => $validated['position'],
                'size' => $validated['size'] ?? null,
                'style' => $validated['style'] ?? null,
            ]
        );

        return response()->json($position->load('item'), 201);
    }

    /**
     * Create a new item and add it to the mindmap.
     */
    public function createItem(Request $request, $id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'type' => 'required|in:text,folder',
            'title' => 'required|string|max:191',
            'content' => 'nullable|string',
            'synopsis' => 'nullable|string',
            'parent_id' => 'nullable|exists:items,id',
            'position' => 'required|array',
            'position.x' => 'required|numeric',
            'position.y' => 'required|numeric',
            'size' => 'nullable|array',
            'style' => 'nullable|array',
        ]);

        DB::beginTransaction();
        try {
            // Get project_id from parent if provided
            $projectId = null;
            if (!empty($validated['parent_id'])) {
                $parentItem = Item::find($validated['parent_id']);
                if ($parentItem) {
                    $projectId = $parentItem->project_id;
                }
            }

            // Create item in items table
            $item = Item::create([
                'user_id' => Auth::id(),
                'project_id' => $projectId,
                'type' => $validated['type'],
                'title' => $validated['title'],
                'content' => $validated['content'] ?? null,
                'synopsis' => $validated['synopsis'] ?? null,
                'parent_id' => $validated['parent_id'] ?? null,
            ]);

            // Add position to mindmap
            $position = MindmapItemPosition::create([
                'mindmap_id' => $id,
                'item_id' => $item->id,
                'position' => $validated['position'],
                'size' => $validated['size'] ?? null,
                'style' => $validated['style'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'item' => $item,
                'position' => $position
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to create item in mindmap: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'error' => 'Failed to create item',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update item position in mindmap.
     */
    /**
     * Update item content (title, content, synopsis, type).
     */
    public function updateItem(Request $request, $mindmapId, $itemId): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($mindmapId);

        $validated = $request->validate([
            'title' => 'nullable|string|max:191',
            'content' => 'nullable|string',
            'synopsis' => 'nullable|string',
            'type' => 'nullable|in:text,folder,character,location,research,note',
        ]);

        // Verify the item exists and belongs to the user
        $item = Item::where('user_id', Auth::id())->findOrFail($itemId);

        // Update only the fields that were provided
        $item->update(array_filter($validated, function($value) {
            return $value !== null;
        }));

        return response()->json(['item' => $item]);
    }

    public function updatePosition(Request $request, $mindmapId, $itemId): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($mindmapId);

        $validated = $request->validate([
            'position' => 'required|array',
            'position.x' => 'required|numeric',
            'position.y' => 'required|numeric',
            'size' => 'nullable|array',
            'style' => 'nullable|array',
            'is_visible' => 'nullable|boolean',
            'is_collapsed' => 'nullable|boolean',
            'z_index' => 'nullable|integer',
        ]);

        $position = MindmapItemPosition::where('mindmap_id', $mindmapId)
            ->where('item_id', $itemId)
            ->firstOrFail();

        $position->update($validated);

        return response()->json($position);
    }

    /**
     * Batch update positions for multiple items.
     */
    public function batchUpdatePositions(Request $request, $id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'positions' => 'required|array',
            'positions.*.item_id' => 'required|exists:items,id',
            'positions.*.position' => 'required|array',
            'positions.*.position.x' => 'required|numeric',
            'positions.*.position.y' => 'required|numeric',
        ]);

        DB::beginTransaction();
        try {
            foreach ($validated['positions'] as $posData) {
                MindmapItemPosition::where('mindmap_id', $id)
                    ->where('item_id', $posData['item_id'])
                    ->update([
                        'position' => $posData['position']
                    ]);
            }

            DB::commit();

            return response()->json(['message' => 'Positions updated successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to update positions'], 500);
        }
    }

    /**
     * Remove item from mindmap (doesn't delete the item itself).
     */
    public function removeItem($mindmapId, $itemId): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($mindmapId);

        DB::beginTransaction();
        try {
            // Remove position
            MindmapItemPosition::where('mindmap_id', $mindmapId)
                ->where('item_id', $itemId)
                ->delete();

            // Remove related connections
            MindmapConnection::where('mindmap_id', $mindmapId)
                ->where(function($q) use ($itemId) {
                    $q->where('from_item_id', $itemId)
                      ->orWhere('to_item_id', $itemId);
                })
                ->delete();

            DB::commit();

            return response()->json(['message' => 'Item removed from mindmap']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to remove item'], 500);
        }
    }

    /**
     * Create a connection between items.
     */
    public function createConnection(Request $request, $id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'from_item_id' => 'required|exists:items,id',
            'to_item_id' => 'required|exists:items,id',
            'connection_type' => 'required|in:one-way,two-way',
            'relationship_type' => 'nullable|string|max:50',
            'label' => 'nullable|string|max:255',
            'style' => 'nullable|array',
        ]);

        // Verify both items exist in this mindmap
        $fromExists = MindmapItemPosition::where('mindmap_id', $id)
            ->where('item_id', $validated['from_item_id'])
            ->exists();

        $toExists = MindmapItemPosition::where('mindmap_id', $id)
            ->where('item_id', $validated['to_item_id'])
            ->exists();

        if (!$fromExists || !$toExists) {
            return response()->json(['error' => 'Both items must exist in the mindmap'], 400);
        }

        $connection = MindmapConnection::create([
            'mindmap_id' => $id,
            ...$validated
        ]);

        return response()->json($connection->load(['fromItem', 'toItem']), 201);
    }

    /**
     * Update a connection.
     */
    public function updateConnection(Request $request, $connectionId): JsonResponse
    {
        $validated = $request->validate([
            'connection_type' => 'nullable|in:one-way,two-way',
            'relationship_type' => 'nullable|string|max:50',
            'label' => 'nullable|string|max:255',
            'style' => 'nullable|array',
        ]);

        $connection = MindmapConnection::findOrFail($connectionId);

        // Verify user owns the mindmap
        $mindmap = WritingMindmap::where('id', $connection->mindmap_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $connection->update($validated);

        return response()->json($connection);
    }

    /**
     * Delete a connection.
     */
    public function deleteConnection($connectionId): JsonResponse
    {
        $connection = MindmapConnection::findOrFail($connectionId);

        // Verify user owns the mindmap
        $mindmap = WritingMindmap::where('id', $connection->mindmap_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $connection->delete();

        return response()->json(['message' => 'Connection deleted successfully']);
    }

    /**
     * Import items from manuscript structure.
     */
    public function importManuscript(Request $request, $id): JsonResponse
    {
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'manuscript_id' => 'nullable|exists:manuscripts,id',
            'parent_id' => 'nullable|exists:items,id',
            'layout' => 'nullable|in:hierarchical,grid,force-directed',
        ]);

        // Get items to import
        $query = Item::where('user_id', Auth::id());

        if (isset($validated['manuscript_id'])) {
            $query->whereHas('manuscripts', function($q) use ($validated) {
                $q->where('manuscripts.id', $validated['manuscript_id']);
            });
        } elseif (isset($validated['parent_id'])) {
            $query->where('parent_id', $validated['parent_id']);
        }

        $items = $query->get();

        if ($items->isEmpty()) {
            return response()->json(['error' => 'No items found to import'], 404);
        }

        DB::beginTransaction();
        try {
            $layout = $validated['layout'] ?? 'hierarchical';
            $positions = [];

            foreach ($items as $index => $item) {
                // Calculate position based on layout
                $pos = $this->calculatePosition($index, count($items), $layout);

                $position = MindmapItemPosition::updateOrCreate(
                    [
                        'mindmap_id' => $id,
                        'item_id' => $item->id,
                    ],
                    [
                        'position' => $pos,
                    ]
                );

                $positions[] = $position;
            }

            DB::commit();

            return response()->json([
                'message' => 'Items imported successfully',
                'count' => count($positions),
                'positions' => $positions,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to import items'], 500);
        }
    }

    /**
     * Calculate position based on layout algorithm.
     */
    private function calculatePosition(int $index, int $total, string $layout): array
    {
        switch ($layout) {
            case 'grid':
                $cols = ceil(sqrt($total));
                $x = ($index % $cols) * 300;
                $y = floor($index / $cols) * 200;
                return ['x' => $x, 'y' => $y];

            case 'force-directed':
                $angle = ($index / $total) * 2 * pi();
                $radius = 300;
                $x = cos($angle) * $radius;
                $y = sin($angle) * $radius;
                return ['x' => $x, 'y' => $y];

            case 'hierarchical':
            default:
                $x = $index * 50;
                $y = $index * 150;
                return ['x' => $x, 'y' => $y];
        }
    }

    /**
     * Dismiss a ghost placeholder from the mindmap.
     *
     * This permanently removes the ghost - the user acknowledges the item was deleted.
     */
    public function dismissGhost($mindmapId, $ghostId): JsonResponse
    {
        // Verify user owns the mindmap
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($mindmapId);

        // Find and delete the ghost
        $ghost = MindmapGhost::where('id', $ghostId)
            ->where('mindmap_id', $mindmapId)
            ->firstOrFail();

        $ghost->delete();

        return response()->json(['message' => 'Ghost dismissed successfully']);
    }
}
