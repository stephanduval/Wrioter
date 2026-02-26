<?php

namespace App\Services;

use App\Models\Item;
use App\Models\WritingMindmap;
use App\Models\MindmapItemPosition;
use App\Models\MindmapGhost;
use Illuminate\Support\Facades\DB;

class FolderMindmapSyncService
{
    /**
     * Get or create mindmap for a folder, then sync.
     */
    public function getOrCreateAndSync(int $folderId, int $userId): WritingMindmap
    {
        $mindmap = WritingMindmap::forFolder($folderId)
            ->where('user_id', $userId)
            ->first();

        if (!$mindmap) {
            $folder = Item::findOrFail($folderId);
            $mindmap = WritingMindmap::create([
                'user_id' => $userId,
                'folder_id' => $folderId,
                'title' => $folder->title . ' Mindmap',
                'format' => 'internal',
            ]);
        }

        $this->sync($mindmap);

        return $mindmap;
    }

    /**
     * Ensure the folder itself has a position record (root node).
     */
    protected function ensureFolderRootNode(WritingMindmap $mindmap): void
    {
        // The folder itself should appear as the root node
        $folderItem = Item::findOrFail($mindmap->folder_id);

        // Check if position already exists
        $existingPosition = MindmapItemPosition::where('mindmap_id', $mindmap->id)
            ->where('item_id', $mindmap->folder_id)
            ->first();

        if (!$existingPosition) {
            // Create root position at top center
            MindmapItemPosition::create([
                'mindmap_id' => $mindmap->id,
                'item_id' => $mindmap->folder_id,
                'position' => ['x' => 400, 'y' => 50],
                'style' => $mindmap->getDefaultStyleForItem($folderItem),
                'is_collapsed' => false, // Root is never collapsed
            ]);
        }
    }

    /**
     * Sync mindmap with current folder contents.
     *
     * This is the core smart-sync algorithm that preserves user work
     * while keeping the mindmap in sync with folder structure.
     */
    public function sync(WritingMindmap $mindmap): void
    {
        if (!$mindmap->folder_id) return;

        DB::transaction(function () use ($mindmap) {
            // Ensure folder itself is on the canvas as root node
            $this->ensureFolderRootNode($mindmap);

            // Get all items under this folder recursively (including nested folder children)
            $folderItems = $this->getAllFolderItems($mindmap->folder_id, $mindmap->user_id);

            $folderItemIds = $folderItems->pluck('id')->toArray();

            // Get existing positions
            $existingPositions = MindmapItemPosition::where('mindmap_id', $mindmap->id)->get();
            $existingItemIds = $existingPositions->pluck('item_id')->toArray();

            // Find new items (in folder but not in mindmap)
            $newItemIds = array_diff($folderItemIds, $existingItemIds);

            // Find removed items (in mindmap but not in folder)
            $removedItemIds = array_diff($existingItemIds, $folderItemIds);

            // Add new items with auto-layout
            if (!empty($newItemIds)) {
                $newItems = $folderItems->whereIn('id', $newItemIds);
                $this->addNewItems($mindmap, $newItems, $existingPositions);
            }

            // Handle removed items (create ghosts)
            if (!empty($removedItemIds)) {
                $this->handleRemovedItems($mindmap, $removedItemIds);
            }
        });
    }

    /**
     * Add new items with intelligent positioning.
     */
    protected function addNewItems(WritingMindmap $mindmap, $newItems, $existingPositions): void
    {
        $offsetX = 0;
        $offsetY = 0;

        // Find bounds of existing positions to place new items appropriately
        if ($existingPositions->isNotEmpty()) {
            $maxY = $existingPositions->max(fn($p) => $p->position['y'] ?? 0);
            $offsetY = $maxY + 150; // Place below existing items
        }

        foreach ($newItems as $index => $item) {
            $position = $this->calculatePosition($item, $index, $offsetX, $offsetY, $existingPositions);

            MindmapItemPosition::create([
                'mindmap_id' => $mindmap->id,
                'item_id' => $item->id,
                'position' => $position,
                'style' => $mindmap->getDefaultStyleForItem($item),
                'is_collapsed' => $item->type === 'folder',
            ]);
        }
    }

    /**
     * Calculate position for a new item.
     *
     * Tries to place intelligently:
     * 1. Below parent if parent has position
     * 2. In grid layout otherwise
     */
    protected function calculatePosition(Item $item, int $index, int $offsetX, int $offsetY, $existingPositions): array
    {
        // Check if parent has a position (place child below parent)
        if ($item->parent_id) {
            $parentPosition = $existingPositions->firstWhere('item_id', $item->parent_id);
            if ($parentPosition) {
                return [
                    'x' => ($parentPosition->position['x'] ?? 0) + 50,
                    'y' => ($parentPosition->position['y'] ?? 0) + 150,
                ];
            }
        }

        // Grid layout for items without positioned parents
        $cols = 4;
        $spacingX = 250;
        $spacingY = 150;

        return [
            'x' => $offsetX + ($index % $cols) * $spacingX,
            'y' => $offsetY + floor($index / $cols) * $spacingY,
        ];
    }

    /**
     * Handle items removed from folder (but not deleted).
     *
     * Note: Deleted items are handled by ItemObserver::deleting
     * This only handles items moved to another folder.
     */
    protected function handleRemovedItems(WritingMindmap $mindmap, array $removedItemIds): void
    {
        foreach ($removedItemIds as $itemId) {
            // NEVER remove or ghost the root folder itself
            if ($itemId == $mindmap->folder_id) {
                continue;
            }

            // Check if item still exists (moved, not deleted)
            $item = Item::find($itemId);

            $position = MindmapItemPosition::where('mindmap_id', $mindmap->id)
                ->where('item_id', $itemId)
                ->first();

            if ($position) {
                // Only create ghost if item was moved (not deleted)
                // Deleted items are handled by ItemObserver
                if ($item) {
                    MindmapGhost::create([
                        'mindmap_id' => $mindmap->id,
                        'original_item_id' => $itemId,
                        'label' => $item->title . ' (moved)',
                        'position' => $position->position,
                        'size' => $position->size,
                        'style' => $position->style,
                        'z_index' => $position->z_index,
                        'item_type' => $item->type,
                        'deleted_at' => now(),
                    ]);
                }

                $position->delete();
            }
        }
    }

    /**
     * Compute hierarchy edges from parent_id relationships and item_order.
     *
     * These are NOT stored - computed on the fly from folder structure.
     * Returns edge data suitable for frontend rendering.
     *
     * Creates edges for:
     * 1. Parent → first child (based on parent_id)
     * 2. Child → next sibling (based on item_order within same parent)
     *
     * This shows both containment (parent→child) AND sequential flow (item→next item).
     */
    public function computeHierarchyEdges(WritingMindmap $mindmap): array
    {
        if (!$mindmap->folder_id) return [];

        // Get all items under this folder at any depth level (already ordered by item_order)
        $items = $this->getAllFolderItems($mindmap->folder_id, $mindmap->user_id);
        $itemIds = $items->pluck('id')->toArray();

        // Add folder ID as a valid parent
        $validParentIds = array_merge([$mindmap->folder_id], $itemIds);

        // Group items by parent_id
        $itemsByParent = $items->groupBy('parent_id');

        $edges = [];

        foreach ($itemsByParent as $parentId => $children) {
            // Skip if parent is not in our mindmap
            if (!in_array($parentId, $validParentIds)) {
                continue;
            }

            // Sort children by item_order (should already be sorted from query, but ensure it)
            $sortedChildren = $children->sortBy('item_order')->values();

            foreach ($sortedChildren as $index => $child) {
                if ($index === 0) {
                    // First child: create edge from parent to first child
                    $edges[] = [
                        'id' => 'hierarchy_' . $parentId . '_' . $child->id,
                        'source' => 'item-' . $parentId,
                        'target' => 'item-' . $child->id,
                        'type' => 'hierarchy',
                        'data' => [
                            'is_hierarchy' => true,
                            'editable' => false,
                            'is_sequential' => false, // parent→child containment
                        ],
                    ];
                } else {
                    // Subsequent children: create edge from previous sibling (sequential flow)
                    $previousChild = $sortedChildren[$index - 1];
                    $edges[] = [
                        'id' => 'hierarchy_seq_' . $previousChild->id . '_' . $child->id,
                        'source' => 'item-' . $previousChild->id,
                        'target' => 'item-' . $child->id,
                        'type' => 'hierarchy',
                        'data' => [
                            'is_hierarchy' => true,
                            'editable' => false,
                            'is_sequential' => true, // sibling→sibling sequential flow
                        ],
                    ];
                }
            }
        }

        return $edges;
    }

    /**
     * Get the IDs of items that should be visible on the mindmap canvas.
     *
     * An item is visible if:
     * - It is the root folder itself (always visible)
     * - It is a direct child of the viewed folder (always visible as top-level)
     * - OR none of its ancestor folders (within this mindmap) are collapsed
     */
    public function getVisibleNodeIds(WritingMindmap $mindmap): array
    {
        if (!$mindmap->folder_id) return [];

        $positions = MindmapItemPosition::where('mindmap_id', $mindmap->id)
            ->with('item')
            ->get();

        // Build lookup maps
        $positionsByItemId = $positions->keyBy('item_id');
        $itemsById = $positions->pluck('item')->filter()->keyBy('id');

        $visibleIds = [];

        foreach ($positions as $position) {
            // Root folder is ALWAYS visible
            if ($position->item_id == $mindmap->folder_id) {
                $visibleIds[] = $position->item_id;
                continue;
            }

            if (!$position->item) continue;

            // Direct children of the viewed folder are always visible
            if ($position->item->parent_id == $mindmap->folder_id) {
                $visibleIds[] = $position->item_id;
                continue;
            }

            // Walk up the parent chain — if any ancestor folder is collapsed, hide this node
            $visible = true;
            $currentItem = $position->item;

            while ($currentItem && $currentItem->parent_id != $mindmap->folder_id) {
                $parentPosition = $positionsByItemId->get($currentItem->parent_id);

                if ($parentPosition && $parentPosition->is_collapsed) {
                    $visible = false;
                    break;
                }

                // Move up to parent
                $currentItem = $itemsById->get($currentItem->parent_id);
                if (!$currentItem) break;
            }

            if ($visible) {
                $visibleIds[] = $position->item_id;
            }
        }

        return $visibleIds;
    }

    /**
     * Recursively get all items under a folder at any depth level.
     *
     * This traverses the item tree to find all descendants of the folder,
     * allowing hierarchy edges to be drawn for nested items.
     */
    protected function getAllFolderItems(int $folderId, int $userId)
    {
        // Start with direct children of the folder, ordered by item_order for sequential hierarchy
        $directChildren = Item::where('parent_id', $folderId)
            ->where('user_id', $userId)
            ->orderBy('item_order')
            ->get();

        $allItems = $directChildren->collect();

        // Recursively fetch all descendants
        foreach ($directChildren as $item) {
            $descendants = $this->getAllDescendants($item->id, $userId);
            $allItems = $allItems->merge($descendants);
        }

        return $allItems;
    }

    /**
     * Recursively get all descendants of an item.
     */
    protected function getAllDescendants(int $itemId, int $userId)
    {
        $children = Item::where('parent_id', $itemId)
            ->where('user_id', $userId)
            ->orderBy('item_order')
            ->get();

        $allDescendants = $children->collect();

        foreach ($children as $child) {
            $descendants = $this->getAllDescendants($child->id, $userId);
            $allDescendants = $allDescendants->merge($descendants);
        }

        return $allDescendants;
    }
}
