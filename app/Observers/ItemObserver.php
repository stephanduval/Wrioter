<?php

namespace App\Observers;

use App\Models\Item;
use App\Models\MindmapGhost;
use App\Models\MindmapItemPosition;
use App\Models\SnippetReference;
use App\Models\WritingMindmap;
use App\Services\SnippetService;

class ItemObserver
{
    /**
     * Handle the Item "updated" event.
     *
     * Updates snippet references when source content changes.
     */
    public function updated(Item $item): void
    {
        // When content changes, update all snippets referencing this item
        if ($item->isDirty('content')) {
            $this->handleContentUpdate($item);
        }
    }

    /**
     * Handle the Item "updating" event.
     *
     * Detects when an item is moved to a different folder (parent_id change).
     * Creates ghost in old folder's mindmap.
     */
    public function updating(Item $item): void
    {
        // Check if parent_id changed (item moved between folders)
        if ($item->isDirty('parent_id')) {
            $oldParentId = $item->getOriginal('parent_id');
            if ($oldParentId) {
                $this->handleItemMoved($item, $oldParentId);
            }
        }
    }

    /**
     * Handle the Item "deleting" event.
     *
     * Creates ghost placeholders in mindmaps before the item is deleted.
     * Marks snippet references as ghosts when source item is deleted.
     * This runs BEFORE cascade deletes remove the position records.
     */
    public function deleting(Item $item): void
    {
        // Mark all snippet references to this item as ghosts
        $this->handleSourceDeletion($item);

        // Find all mindmap positions for this item
        $positions = MindmapItemPosition::where('item_id', $item->id)->get();

        foreach ($positions as $position) {
            // Create ghost placeholder to preserve position in mindmap
            MindmapGhost::create([
                'mindmap_id' => $position->mindmap_id,
                'original_item_id' => $item->id,
                'label' => $item->title . ' (deleted)',
                'position' => $position->position,
                'size' => $position->size,
                'style' => $position->style,
                'z_index' => $position->z_index,
                'item_type' => $item->type,
                'deleted_at' => now(),
            ]);
        }

        // Position records will be cascade-deleted by FK constraint
        // Connection records will also be cascade-deleted
    }

    /**
     * Handle item moved from one folder to another.
     *
     * Creates a "moved" ghost in the old folder's mindmap.
     */
    protected function handleItemMoved(Item $item, int $oldParentId): void
    {
        // Find folder mindmap for old parent
        $folderMindmap = WritingMindmap::forFolder($oldParentId)
            ->where('user_id', $item->user_id)
            ->first();

        if (!$folderMindmap) return;

        // Find position in that mindmap
        $position = MindmapItemPosition::where('mindmap_id', $folderMindmap->id)
            ->where('item_id', $item->id)
            ->first();

        if ($position) {
            // Create "moved" ghost
            MindmapGhost::create([
                'mindmap_id' => $folderMindmap->id,
                'original_item_id' => $item->id,
                'label' => $item->title . ' (moved)',
                'position' => $position->position,
                'size' => $position->size,
                'style' => $position->style,
                'z_index' => $position->z_index,
                'item_type' => $item->type,
                'deleted_at' => now(),
            ]);

            // Remove old position
            $position->delete();
        }
    }

    /**
     * Handle source item content update.
     *
     * Updates all snippet references that point to this item with auto-update enabled.
     */
    protected function handleContentUpdate(Item $item): void
    {
        try {
            $snippetService = app(SnippetService::class);
            $snippetService->handleSourceUpdate($item);
        } catch (\Exception $e) {
            // Log error but don't fail the main update
            \Log::warning('Failed to update snippet references', [
                'item_id' => $item->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle source item deletion.
     *
     * Marks all snippet references to this item as ghosts.
     */
    protected function handleSourceDeletion(Item $item): void
    {
        try {
            // Directly update snippet references to mark as ghosts
            // We do this directly instead of through service to avoid circular dependencies
            SnippetReference::where('source_item_id', $item->id)
                ->where('status', '!=', 'ghost')
                ->update([
                    'status' => 'ghost',
                    'became_ghost_at' => now(),
                    'current_text' => \DB::raw('reference_text'),
                ]);
        } catch (\Exception $e) {
            // Log error but don't fail the main delete
            \Log::warning('Failed to mark snippet references as ghosts', [
                'item_id' => $item->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
