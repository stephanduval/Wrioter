<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        // Transform positions for frontend
        $nodes = $mindmap->positions->map(fn($pos) => [
            'id' => $pos->item_id,
            'data' => $pos->item,
            'position' => $pos->position,
            'size' => $pos->size,
            'style' => $pos->style,
            'is_visible' => $pos->is_visible,
            'is_collapsed' => $pos->is_collapsed,
            'z_index' => $pos->z_index,
        ]);

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
        $hierarchyEdges = $this->syncService->computeHierarchyEdges($mindmap);

        // Get custom edges (stored in mindmap_connections)
        $customEdges = $mindmap->connections->map(fn($conn) => [
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
        ]);

        return response()->json([
            'mindmap' => $mindmap,
            'nodes' => $nodes,
            'ghosts' => $ghosts,
            'edges' => [
                'hierarchy' => $hierarchyEdges,
                'custom' => $customEdges,
            ],
        ]);
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
