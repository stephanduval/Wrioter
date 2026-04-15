<?php

namespace App\Services;

use App\Models\WritingMindmap;
use App\Models\MindmapItemPosition;
use App\Models\Item;
use Illuminate\Support\Facades\Log;

class MindmapLayoutService
{
    const VERTICAL_SPACING = 150;      // Space between rows (parent to children)
    const HORIZONTAL_SPACING = 300;    // Space between folder branches
    const ITEM_VERTICAL_SPACING = 130; // Space between sequential items in a branch
    const ROOT_X = 400;                // Root starts horizontally centered
    const ROOT_Y = 50;

    public function __construct(
        protected FolderMindmapSyncService $syncService
    ) {}

    /**
     * Compute hierarchical tree layout positions for all items in a mindmap.
     *
     * Layout rules:
     * - Root folder is centered at the top
     * - Sub-folders branch out horizontally (each as a separate column/branch)
     * - Regular items (non-folders) within a parent chain vertically top-to-bottom
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

        // Sort each group by item_order ascending (to match VerticalNavView display order)
        foreach ($childrenByParent as &$children) {
            usort($children, fn($a, $b) => ($a->item_order ?? 0) <=> ($b->item_order ?? 0));
        }
        unset($children);

        // Build item lookup map
        $itemsById = [];
        $rootFolder = Item::find($mindmap->folder_id);
        if ($rootFolder) {
            $itemsById[$rootFolder->id] = $rootFolder;
        }
        foreach ($items as $item) {
            $itemsById[$item->id] = $item;
        }

        $positions = [];

        // First pass: compute the total width each subtree needs so we can center branches
        $subtreeWidths = [];
        $this->computeSubtreeWidth($mindmap->folder_id, $childrenByParent, $itemsById, $subtreeWidths);

        // Place root centered at top
        $rootWidth = $subtreeWidths[$mindmap->folder_id] ?? self::HORIZONTAL_SPACING;
        $rootX = (int) round($rootWidth / 2);

        $this->positionNode(
            $mindmap->folder_id,
            $rootX,
            self::ROOT_Y,
            $childrenByParent,
            $itemsById,
            $subtreeWidths,
            $positions
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
     * Compute the total horizontal width needed for a subtree.
     *
     * Folders spread their sub-folder branches horizontally.
     * Regular items only need a single column width.
     */
    protected function computeSubtreeWidth(
        int $nodeId,
        array &$childrenByParent,
        array &$itemsById,
        array &$subtreeWidths
    ): int {
        $children = $childrenByParent[$nodeId] ?? [];

        if (empty($children)) {
            $subtreeWidths[$nodeId] = self::HORIZONTAL_SPACING;
            return self::HORIZONTAL_SPACING;
        }

        $folderChildren = array_filter($children, fn($c) => $c->type === 'folder');
        $itemChildren = array_filter($children, fn($c) => $c->type !== 'folder');

        // Regular items form a single vertical chain — one column width
        $itemWidth = !empty($itemChildren) ? self::HORIZONTAL_SPACING : 0;

        // Sub-folders each get their own subtree width
        $foldersWidth = 0;
        foreach ($folderChildren as $folder) {
            $foldersWidth += $this->computeSubtreeWidth($folder->id, $childrenByParent, $itemsById, $subtreeWidths);
        }

        // Also recurse on item children (they may have sub-folders inside them)
        foreach ($itemChildren as $item) {
            $this->computeSubtreeWidth($item->id, $childrenByParent, $itemsById, $subtreeWidths);
        }

        $totalWidth = max(self::HORIZONTAL_SPACING, $itemWidth + $foldersWidth);
        $subtreeWidths[$nodeId] = $totalWidth;
        return $totalWidth;
    }

    /**
     * Recursively position nodes.
     *
     * - Place the current node at ($centerX, $y)
     * - Sub-folders spread out horizontally below, each centered in their subtree column
     * - Regular items chain vertically below the parent (or below last item)
     */
    protected function positionNode(
        int $nodeId,
        float $centerX,
        float $startY,
        array &$childrenByParent,
        array &$itemsById,
        array &$subtreeWidths,
        array &$positions
    ): float {
        // Place this node
        $positions[$nodeId] = [
            'x' => (int) round($centerX),
            'y' => (int) round($startY),
        ];

        $children = $childrenByParent[$nodeId] ?? [];
        if (empty($children)) {
            return $startY + self::VERTICAL_SPACING;
        }

        $folderChildren = array_values(array_filter($children, fn($c) => $c->type === 'folder'));
        $itemChildren = array_values(array_filter($children, fn($c) => $c->type !== 'folder'));

        $childY = $startY + self::VERTICAL_SPACING;

        // Place regular items in a vertical chain, centered under parent
        $lastItemBottomY = $childY;
        foreach ($itemChildren as $index => $item) {
            $itemY = $childY + ($index * self::ITEM_VERTICAL_SPACING);
            $positions[$item->id] = [
                'x' => (int) round($centerX),
                'y' => (int) round($itemY),
            ];

            // Recurse for any children of this item (rare, but possible)
            $this->computeSubtreeWidth($item->id, $childrenByParent, $itemsById, $subtreeWidths);
            $lastItemBottomY = $itemY + self::ITEM_VERTICAL_SPACING;
        }

        // Place sub-folders spread horizontally
        if (!empty($folderChildren)) {
            // Calculate total width of all folder branches
            $totalFoldersWidth = 0;
            foreach ($folderChildren as $folder) {
                $totalFoldersWidth += ($subtreeWidths[$folder->id] ?? self::HORIZONTAL_SPACING);
            }

            // Start X for first folder branch, centered around parent
            $folderStartX = $centerX - ($totalFoldersWidth / 2);

            foreach ($folderChildren as $folder) {
                $folderSubtreeWidth = $subtreeWidths[$folder->id] ?? self::HORIZONTAL_SPACING;
                $folderCenterX = $folderStartX + ($folderSubtreeWidth / 2);

                $this->positionNode(
                    $folder->id,
                    $folderCenterX,
                    $childY,
                    $childrenByParent,
                    $itemsById,
                    $subtreeWidths,
                    $positions
                );

                $folderStartX += $folderSubtreeWidth;
            }
        }

        return $lastItemBottomY;
    }
}
