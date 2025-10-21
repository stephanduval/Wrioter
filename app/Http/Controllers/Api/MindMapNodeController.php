<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WritingMindmap;
use App\Models\WritingMindmapNode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MindMapNodeController extends Controller
{
    /**
     * Display a listing of nodes for a mindmap.
     */
    public function index($mindmapId): JsonResponse
    {
        // Verify mindmap ownership
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($mindmapId);

        $nodes = WritingMindmapNode::where('mindmap_id', $mindmapId)
            ->with(['parent', 'children', 'linkedItems'])
            ->orderBy('order_index')
            ->get();

        return response()->json($nodes);
    }

    /**
     * Store a newly created node.
     */
    public function store(Request $request, $mindmapId): JsonResponse
    {
        // Verify mindmap ownership
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($mindmapId);

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:writing_mindmap_nodes,id',
            'content' => 'required|string',
            'position' => 'nullable|array',
            'position.x' => 'nullable|numeric',
            'position.y' => 'nullable|numeric',
            'style' => 'nullable|array',
            'node_type' => 'nullable|string|max:50',
            'is_collapsed' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
            'metadata' => 'nullable|array',
        ]);

        // If parent_id is provided, verify it belongs to the same mindmap
        if (!empty($validated['parent_id'])) {
            $parentNode = WritingMindmapNode::where('id', $validated['parent_id'])
                ->where('mindmap_id', $mindmapId)
                ->firstOrFail();
        }

        // Auto-calculate order_index if not provided
        if (!isset($validated['order_index'])) {
            $maxOrder = WritingMindmapNode::where('mindmap_id', $mindmapId)
                ->where('parent_id', $validated['parent_id'] ?? null)
                ->max('order_index');
            $validated['order_index'] = ($maxOrder ?? -1) + 1;
        }

        $node = WritingMindmapNode::create([
            ...$validated,
            'mindmap_id' => $mindmapId,
            'node_type' => $validated['node_type'] ?? 'default',
        ]);

        $node->load(['parent', 'children', 'linkedItems']);

        return response()->json($node, 201);
    }

    /**
     * Update the specified node.
     */
    public function update(Request $request, $nodeId): JsonResponse
    {
        $node = WritingMindmapNode::findOrFail($nodeId);

        // Verify ownership through mindmap
        $mindmap = WritingMindmap::where('id', $node->mindmap_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:writing_mindmap_nodes,id',
            'content' => 'nullable|string',
            'position' => 'nullable|array',
            'position.x' => 'nullable|numeric',
            'position.y' => 'nullable|numeric',
            'style' => 'nullable|array',
            'node_type' => 'nullable|string|max:50',
            'is_collapsed' => 'nullable|boolean',
            'order_index' => 'nullable|integer',
            'metadata' => 'nullable|array',
        ]);

        // If changing parent, verify new parent belongs to same mindmap
        if (isset($validated['parent_id']) && $validated['parent_id'] !== $node->parent_id) {
            if ($validated['parent_id']) {
                $parentNode = WritingMindmapNode::where('id', $validated['parent_id'])
                    ->where('mindmap_id', $node->mindmap_id)
                    ->firstOrFail();

                // Prevent circular reference
                if ($this->wouldCreateCircularReference($node, $validated['parent_id'])) {
                    return response()->json(['error' => 'Cannot create circular reference'], 422);
                }
            }

            // Reorder siblings when moving nodes
            $this->reorderSiblings($node->mindmap_id, $node->parent_id);
        }

        $node->update($validated);

        $node->load(['parent', 'children', 'linkedItems']);

        return response()->json($node);
    }

    /**
     * Remove the specified node.
     */
    public function destroy($nodeId): JsonResponse
    {
        $node = WritingMindmapNode::findOrFail($nodeId);

        // Verify ownership through mindmap
        $mindmap = WritingMindmap::where('id', $node->mindmap_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Don't allow deletion of root node if it's the only one
        if (!$node->parent_id) {
            $rootCount = WritingMindmapNode::where('mindmap_id', $node->mindmap_id)
                ->whereNull('parent_id')
                ->count();

            if ($rootCount === 1) {
                return response()->json(['error' => 'Cannot delete the only root node'], 422);
            }
        }

        DB::transaction(function () use ($node) {
            // Move children to parent (or make them root if deleting a root node)
            WritingMindmapNode::where('parent_id', $node->id)
                ->update(['parent_id' => $node->parent_id]);

            // Reorder siblings
            $this->reorderSiblings($node->mindmap_id, $node->parent_id);

            // Delete the node (connections will be cascade deleted)
            $node->delete();
        });

        return response()->json(['message' => 'Node deleted successfully']);
    }

    /**
     * Move a node to a new position or parent.
     */
    public function move(Request $request, $nodeId): JsonResponse
    {
        $node = WritingMindmapNode::findOrFail($nodeId);

        // Verify ownership through mindmap
        $mindmap = WritingMindmap::where('id', $node->mindmap_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:writing_mindmap_nodes,id',
            'position' => 'nullable|array',
            'position.x' => 'required_with:position|numeric',
            'position.y' => 'required_with:position|numeric',
            'order_index' => 'nullable|integer',
        ]);

        DB::transaction(function () use ($node, $validated) {
            $oldParentId = $node->parent_id;

            // Update parent if changed
            if (isset($validated['parent_id']) && $validated['parent_id'] != $node->parent_id) {
                // Verify new parent is in same mindmap
                if ($validated['parent_id']) {
                    $parentNode = WritingMindmapNode::where('id', $validated['parent_id'])
                        ->where('mindmap_id', $node->mindmap_id)
                        ->firstOrFail();

                    // Prevent circular reference
                    if ($this->wouldCreateCircularReference($node, $validated['parent_id'])) {
                        throw new \Exception('Cannot create circular reference');
                    }
                }

                $node->parent_id = $validated['parent_id'];
            }

            // Update position if provided
            if (isset($validated['position'])) {
                $node->position = $validated['position'];
            }

            // Update order_index
            if (isset($validated['order_index'])) {
                $node->order_index = $validated['order_index'];
            } elseif (isset($validated['parent_id']) && $validated['parent_id'] != $oldParentId) {
                // If parent changed but no order specified, add to end
                $maxOrder = WritingMindmapNode::where('mindmap_id', $node->mindmap_id)
                    ->where('parent_id', $validated['parent_id'])
                    ->where('id', '!=', $node->id)
                    ->max('order_index');
                $node->order_index = ($maxOrder ?? -1) + 1;
            }

            $node->save();

            // Reorder old siblings
            if ($oldParentId != $node->parent_id) {
                $this->reorderSiblings($node->mindmap_id, $oldParentId);
            }

            // Reorder new siblings if order changed
            if (isset($validated['order_index']) || ($oldParentId != $node->parent_id)) {
                $this->reorderSiblings($node->mindmap_id, $node->parent_id);
            }
        });

        $node->load(['parent', 'children', 'linkedItems']);

        return response()->json($node);
    }

    /**
     * Link a node to an item.
     */
    public function linkItem(Request $request, $nodeId): JsonResponse
    {
        $node = WritingMindmapNode::findOrFail($nodeId);

        // Verify ownership through mindmap
        $mindmap = WritingMindmap::where('id', $node->mindmap_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'relationship_type' => 'required|string|max:191',
            'description' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // Verify item ownership
        $item = \App\Models\Item::where('id', $validated['item_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $node->linkedItems()->attach($validated['item_id'], [
            'relationship_type' => $validated['relationship_type'],
            'description' => $validated['description'] ?? null,
            'metadata' => isset($validated['metadata']) ? json_encode($validated['metadata']) : null,
        ]);

        return response()->json(['message' => 'Item linked successfully']);
    }

    /**
     * Unlink a node from an item.
     */
    public function unlinkItem($nodeId, $itemId): JsonResponse
    {
        $node = WritingMindmapNode::findOrFail($nodeId);

        // Verify ownership through mindmap
        $mindmap = WritingMindmap::where('id', $node->mindmap_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $node->linkedItems()->detach($itemId);

        return response()->json(['message' => 'Item unlinked successfully']);
    }

    /**
     * Check if setting a parent would create a circular reference.
     */
    private function wouldCreateCircularReference($node, $newParentId): bool
    {
        if ($node->id == $newParentId) {
            return true;
        }

        $current = WritingMindmapNode::find($newParentId);
        while ($current) {
            if ($current->id == $node->id) {
                return true;
            }
            $current = $current->parent;
        }

        return false;
    }

    /**
     * Reorder sibling nodes to maintain sequential order_index.
     */
    private function reorderSiblings($mindmapId, $parentId): void
    {
        $siblings = WritingMindmapNode::where('mindmap_id', $mindmapId)
            ->where('parent_id', $parentId)
            ->orderBy('order_index')
            ->get();

        $index = 0;
        foreach ($siblings as $sibling) {
            $sibling->update(['order_index' => $index++]);
        }
    }

    /**
     * Toggle node collapse state.
     */
    public function toggleCollapse($nodeId): JsonResponse
    {
        $node = WritingMindmapNode::findOrFail($nodeId);

        // Verify ownership through mindmap
        $mindmap = WritingMindmap::where('id', $node->mindmap_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $node->is_collapsed = !$node->is_collapsed;
        $node->save();

        return response()->json([
            'id' => $node->id,
            'is_collapsed' => $node->is_collapsed,
        ]);
    }

    /**
     * Batch update multiple nodes.
     */
    public function batchUpdate(Request $request, $mindmapId): JsonResponse
    {
        // Verify mindmap ownership
        $mindmap = WritingMindmap::where('user_id', Auth::id())->findOrFail($mindmapId);

        $validated = $request->validate([
            'nodes' => 'required|array',
            'nodes.*.id' => 'required|exists:writing_mindmap_nodes,id',
            'nodes.*.position' => 'nullable|array',
            'nodes.*.position.x' => 'nullable|numeric',
            'nodes.*.position.y' => 'nullable|numeric',
            'nodes.*.style' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated, $mindmapId) {
            foreach ($validated['nodes'] as $nodeData) {
                $node = WritingMindmapNode::where('id', $nodeData['id'])
                    ->where('mindmap_id', $mindmapId)
                    ->first();

                if ($node) {
                    $updateData = [];
                    if (isset($nodeData['position'])) {
                        $updateData['position'] = $nodeData['position'];
                    }
                    if (isset($nodeData['style'])) {
                        $updateData['style'] = $nodeData['style'];
                    }

                    if (!empty($updateData)) {
                        $node->update($updateData);
                    }
                }
            }
        });

        return response()->json(['message' => 'Nodes updated successfully']);
    }
}