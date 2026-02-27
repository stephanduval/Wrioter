<?php

namespace App\Services;

use App\Models\WritingMindmap;
use App\Models\MindmapItemPosition;
use App\Models\Item;
use Illuminate\Support\Facades\Log;

class MindmapLayoutService
{
    const VERTICAL_SPACING = 150;      // Space between rows (parent to children)
    const HORIZONTAL_SPACING = 250;    // Space between columns (sibling to sibling)
    const FOLDER_OFFSET = 300;         // Offset for children of folders (cascading)
    const ROOT_X = 50;                 // Start at left
    const ROOT_Y = 50;

    public function __construct(
        protected FolderMindmapSyncService $syncService
    ) {}

    /**
     * Compute hierarchical tree layout positions for all items in a mindmap.
     *
     * Items cascade vertically down from root.
     * Children of folders are offset horizontally based on folder depth.
     * Siblings are spaced horizontally next to each other.
     *
     * @return array<int, array{x: int, y: int}> item_id => position
     */
    public function computeHierarchicalLayout(WritingMindmap $mindmap): array
    {
        if (!$mindmap->folder_id) return [];

        $items = $this->syncService->getAllFolderItems($mindmap->folder_id, $mindmap->user_id);

        // Build tree: group items by parent_id and sort by item_order
        $childrenByParent = [];
        foreach ($items as $item) {
            $parentId = $item->parent_id;
            if (!isset($childrenByParent[$parentId])) {
                $childrenByParent[$parentId] = [];
            }
            $childrenByParent[$parentId][] = $item;
        }

        // Sort each group by item_order (descending to match expected order)
        foreach ($childrenByParent as &$children) {
            usort($children, fn($a, $b) => ($b->item_order ?? 0) <=> ($a->item_order ?? 0));
        }
        unset($children);

        // Get item types for folder detection
        $itemsById = [];

        // Add the root folder to itemsById
        $rootFolder = Item::find($mindmap->folder_id);
        if ($rootFolder) {
            $itemsById[$rootFolder->id] = $rootFolder;
        }

        foreach ($items as $item) {
            $itemsById[$item->id] = $item;
        }

        // Position nodes using cascading vertical layout
        $positions = [];
        $verticalCounter = ['y' => self::ROOT_Y];

        $this->positionNodeCascading(
            $mindmap->folder_id,
            self::ROOT_X,
            $childrenByParent,
            $itemsById,
            $positions,
            $verticalCounter,
            0  // depth level
        );

        return $positions;
    }

    /**
     * Apply computed layout positions to the database.
     */
    public function applyLayout(WritingMindmap $mindmap, array $positions): void
    {
        foreach ($positions as $itemId => $position) {
            MindmapItemPosition::where('mindmap_id', $mindmap->id)
                ->where('item_id', $itemId)
                ->update(['position' => $position]);
        }
    }

    /**
     * Position nodes using cascading vertical layout.
     *
     * - Root folder at top left
     * - All items cascade downward vertically
     * - Items are positioned based on folder nesting:
     *   * Direct children of root: x = 50 + (0 * FOLDER_OFFSET)
     *   * Children of 1st folder: x = 50 + (1 * FOLDER_OFFSET)
     *   * Children of 2nd folder: x = 50 + (2 * FOLDER_OFFSET), etc.
     *
     * @param int $nodeId Current node being positioned
     * @param float $baseX Horizontal position for this node's children
     * @param array $childrenByParent Map of parent_id => [children]
     * @param array $itemsById Map of item_id => Item for type checking
     * @param array &$positions Accumulator for positions
     * @param array &$verticalCounter Track of current Y position globally
     * @param int $folderDepth Count of folders above this node
     */
    protected function positionNodeCascading(
        int $nodeId,
        float $baseX,
        array &$childrenByParent,
        array &$itemsById,
        array &$positions,
        array &$verticalCounter,
        int $folderDepth
    ): void {
        // Position current node at its parent's X offset
        $positions[$nodeId] = [
            'x' => (int) round($baseX),
            'y' => (int) round($verticalCounter['y']),
        ];

        // Move down for next item
        $verticalCounter['y'] += self::VERTICAL_SPACING;

        // Get children sorted by item_order
        $children = $childrenByParent[$nodeId] ?? [];
        if (empty($children)) return;

        // Check if this node is a folder
        $isCurrentFolder = $itemsById[$nodeId]->type === 'folder';

        // Calculate X offset for children
        // If current node is a folder, its children get shifted right
        $childrenX = $isCurrentFolder
            ? $baseX + self::FOLDER_OFFSET
            : $baseX;

        // Process each child vertically, all at the same X offset
        foreach ($children as $child) {
            $this->positionNodeCascading(
                $child->id,
                $childrenX,
                $childrenByParent,
                $itemsById,
                $positions,
                $verticalCounter,
                $isCurrentFolder ? $folderDepth + 1 : $folderDepth
            );
        }
    }
}
