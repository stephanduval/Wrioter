<?php

namespace App\Services;

use App\Models\WritingMindmap;
use App\Models\MindmapItemPosition;

class MindmapLayoutService
{
    const VERTICAL_SPACING = 150;
    const HORIZONTAL_SPACING = 200;
    const ROOT_X = 400;
    const ROOT_Y = 50;

    public function __construct(
        protected FolderMindmapSyncService $syncService
    ) {}

    /**
     * Compute hierarchical tree layout positions for all items in a mindmap.
     *
     * @return array<int, array{x: int, y: int}> item_id => position
     */
    public function computeHierarchicalLayout(WritingMindmap $mindmap): array
    {
        if (!$mindmap->folder_id) return [];

        $items = $this->syncService->getAllFolderItems($mindmap->folder_id, $mindmap->user_id);

        // Build tree: group items by parent_id
        $childrenByParent = [];
        foreach ($items as $item) {
            $parentId = $item->parent_id;
            if (!isset($childrenByParent[$parentId])) {
                $childrenByParent[$parentId] = [];
            }
            $childrenByParent[$parentId][] = $item;
        }

        // Sort each group by item_order
        foreach ($childrenByParent as &$children) {
            usort($children, fn($a, $b) => ($a->item_order ?? 0) <=> ($b->item_order ?? 0));
        }
        unset($children);

        // Calculate subtree widths bottom-up
        $widths = [];
        $this->calculateSubtreeWidths($mindmap->folder_id, $childrenByParent, $widths);

        // Position nodes top-down
        $positions = [];
        $this->positionNode(
            $mindmap->folder_id,
            self::ROOT_X,
            self::ROOT_Y,
            $childrenByParent,
            $widths,
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
     * Calculate the width (in node units) of each subtree.
     * A leaf node has width 1. A parent's width is the sum of its children's widths.
     */
    protected function calculateSubtreeWidths(int $nodeId, array &$childrenByParent, array &$widths): int
    {
        $children = $childrenByParent[$nodeId] ?? [];

        if (empty($children)) {
            $widths[$nodeId] = 1;
            return 1;
        }

        $totalWidth = 0;
        foreach ($children as $child) {
            $totalWidth += $this->calculateSubtreeWidths($child->id, $childrenByParent, $widths);
        }

        $widths[$nodeId] = $totalWidth;
        return $totalWidth;
    }

    /**
     * Position a node and recursively position its children.
     * The node is centered over its children's horizontal span.
     */
    protected function positionNode(
        int $nodeId,
        float $centerX,
        float $y,
        array &$childrenByParent,
        array &$widths,
        array &$positions
    ): void {
        $positions[$nodeId] = [
            'x' => (int) round($centerX),
            'y' => (int) round($y),
        ];

        $children = $childrenByParent[$nodeId] ?? [];
        if (empty($children)) return;

        // Total width of all children subtrees
        $totalWidth = $widths[$nodeId];
        $totalPixelWidth = $totalWidth * self::HORIZONTAL_SPACING;

        // Start position: left edge of the children span
        $startX = $centerX - ($totalPixelWidth / 2);
        $childY = $y + self::VERTICAL_SPACING;

        $currentX = $startX;
        foreach ($children as $child) {
            $childWidth = $widths[$child->id] ?? 1;
            $childPixelWidth = $childWidth * self::HORIZONTAL_SPACING;

            // Center this child within its allocated space
            $childCenterX = $currentX + ($childPixelWidth / 2);

            $this->positionNode(
                $child->id,
                $childCenterX,
                $childY,
                $childrenByParent,
                $widths,
                $positions
            );

            $currentX += $childPixelWidth;
        }
    }
}
