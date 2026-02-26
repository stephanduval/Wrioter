<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\MindmapItemPosition;
use App\Services\FolderMindmapSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FolderMindmapController extends Controller
{
    public function __construct(
        protected FolderMindmapSyncService $syncService
    ) {}

    /**
     * Get folder mindmap (creates if doesn't exist, syncs automatically).
     *
     * This is the main endpoint for loading a folder's mindmap view.
     * It will create the mindmap if it doesn't exist, then sync it with
     * the current folder contents before returning.
     */
    public function show(int $folderId): JsonResponse
    {
        $mindmap = $this->syncService->getOrCreateAndSync($folderId, Auth::id());

        $mindmap->load(['positions.item', 'connections', 'ghosts']);

        // Compute which nodes are visible (respects folder collapse states)
        $visibleItemIds = $this->syncService->getVisibleNodeIds($mindmap);

        // Count children for each item (so frontend knows which folders are expandable)
        // Include the folder itself in the list for child count computation
        $allPositionItemIds = $mindmap->positions->pluck('item_id')->toArray();
        $childCounts = Item::whereIn('parent_id', $allPositionItemIds)
            ->whereIn('id', $allPositionItemIds)
            ->selectRaw('parent_id, COUNT(*) as count')
            ->groupBy('parent_id')
            ->pluck('count', 'parent_id')
            ->toArray();

        // Transform positions for frontend — only visible nodes
        $nodes = $mindmap->positions
            ->filter(fn($pos) => in_array($pos->item_id, $visibleItemIds))
            ->map(fn($pos) => [
                'id' => $pos->item_id,
                'data' => $pos->item,
                'position' => $pos->position,
                'size' => $pos->size,
                'style' => $pos->style,
                'is_visible' => $pos->is_visible,
                'is_collapsed' => $pos->is_collapsed,
                'z_index' => $pos->z_index,
                'child_count' => $childCounts[$pos->item_id] ?? 0,
                'has_children' => ($childCounts[$pos->item_id] ?? 0) > 0,
                'is_root_folder' => $pos->item_id == $mindmap->folder_id,
            ])->values();

        // Transform ghosts for frontend
        $ghosts = $mindmap->ghosts->map(fn($ghost) => [
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
        ]);

        // Compute hierarchy edges (not stored, computed from folder structure)
        // Only include edges where both source and target are visible
        $allHierarchyEdges = $this->syncService->computeHierarchyEdges($mindmap);
        $hierarchyEdges = array_filter($allHierarchyEdges, function($edge) use ($visibleItemIds) {
            $sourceId = (int)str_replace('item-', '', $edge['source']);
            $targetId = (int)str_replace('item-', '', $edge['target']);
            return in_array($sourceId, $visibleItemIds) && in_array($targetId, $visibleItemIds);
        });

        // Filter custom edges to only visible nodes too
        $customEdges = $mindmap->connections
            ->filter(fn($conn) => in_array($conn->from_item_id, $visibleItemIds)
                && in_array($conn->to_item_id, $visibleItemIds))
            ->map(fn($conn) => [
                'id' => 'edge-' . $conn->id,
                'source' => 'item-' . $conn->from_item_id,
                'target' => 'item-' . $conn->to_item_id,
                'type' => $conn->connection_type,
                'data' => [
                    'label' => $conn->label,
                    'relationship_type' => $conn->relationship_type,
                    'style' => $conn->style,
                    'dbId' => $conn->id,
                    'is_hierarchy' => false,
                    'editable' => true,
                ],
            ])->values();

        return response()->json([
            'mindmap' => $mindmap,
            'nodes' => $nodes,
            'ghosts' => $ghosts,
            'edges' => [
                'hierarchy' => array_values($hierarchyEdges),
                'custom' => $customEdges,
            ],
        ]);
    }

    /**
     * Toggle collapse state of a folder node in the mindmap.
     *
     * When collapsed, the folder's children are hidden from the canvas.
     * Returns the full updated mindmap data so the frontend can re-render.
     */
    public function toggleCollapse(int $folderId, int $itemId): JsonResponse
    {
        $mindmap = $this->syncService->getOrCreateAndSync($folderId, Auth::id());

        // Prevent collapsing the root folder itself
        if ($itemId == $mindmap->folder_id) {
            return response()->json([
                'error' => 'Cannot collapse the root folder'
            ], 400);
        }

        $item = Item::where('id', $itemId)
            ->where('user_id', Auth::id())
            ->where('type', 'folder')
            ->firstOrFail();

        $position = MindmapItemPosition::where('mindmap_id', $mindmap->id)
            ->where('item_id', $itemId)
            ->firstOrFail();

        $position->update([
            'is_collapsed' => !$position->is_collapsed,
        ]);

        // Return updated mindmap data (reuse show logic)
        return $this->show($folderId);
    }

    /**
     * Force sync folder mindmap.
     *
     * Manually triggers a sync between the folder contents and the mindmap.
     * Useful for refresh button or when user suspects things are out of sync.
     */
    public function sync(int $folderId): JsonResponse
    {
        $mindmap = $this->syncService->getOrCreateAndSync($folderId, Auth::id());

        return response()->json([
            'message' => 'Mindmap synced successfully',
            'mindmap_id' => $mindmap->id,
        ]);
    }
}
