<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FolderController extends Controller
{
    /**
     * Get folder contents optimized for the specified view mode
     *
     * @param Request $request
     * @param int $folderId
     * @return JsonResponse
     */
    public function getContents(Request $request, int $folderId): JsonResponse
    {
        $viewMode = $request->query('view_mode', 'corkboard');

        // Find the folder
        $folder = Item::where('id', $folderId)
            ->where('type', 'folder')
            ->firstOrFail();

        // Check authorization
        if ($folder->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Get child items based on view mode optimization
        $itemsQuery = Item::where('parent_id', $folderId)
            ->orderBy('item_order', 'asc');

        // Apply view-specific optimizations
        switch ($viewMode) {
            case 'manuscript':
                // Manuscript view needs full content
                $items = $itemsQuery->get([
                    'id', 'title', 'type', 'content', 'synopsis',
                    'word_count', 'item_order', 'metadata',
                    'include_in_compile', 'updated_at', 'created_at'
                ]);
                break;

            case 'corkboard':
                // Corkboard view needs synopsis/excerpt, not full content
                $items = $itemsQuery->get([
                    'id', 'title', 'type', 'synopsis', 'content',
                    'word_count', 'item_order', 'metadata',
                    'include_in_compile', 'updated_at'
                ]);

                // Generate excerpts (first 360 chars of content)
                $items = $items->map(function ($item) {
                    $item->excerpt = $this->generateExcerpt($item->content, 360);
                    // Don't send full content to save bandwidth
                    unset($item->content);
                    return $item;
                });
                break;

            case 'outline':
                // Outline view needs metadata only, no content
                $items = $itemsQuery->get([
                    'id', 'title', 'type', 'synopsis',
                    'word_count', 'item_order', 'metadata',
                    'include_in_compile', 'updated_at', 'created_at'
                ]);
                break;

            default:
                // Default to corkboard
                $items = $itemsQuery->get();
        }

        // Load user preferences for this folder
        $viewPreferences = $this->loadViewPreferences($folderId);

        return response()->json([
            'folder' => [
                'id' => $folder->id,
                'title' => $folder->title,
                'type' => $folder->type,
                'parent_id' => $folder->parent_id
            ],
            'items' => $items,
            'view_preferences' => $viewPreferences
        ]);
    }

    /**
     * Generate excerpt from content
     *
     * @param string|null $content
     * @param int $maxLength
     * @return string|null
     */
    private function generateExcerpt(?string $content, int $maxLength = 360): ?string
    {
        if (!$content) {
            return null;
        }

        // Strip HTML tags
        $content = strip_tags($content);

        // Truncate at word boundary
        if (strlen($content) <= $maxLength) {
            return $content;
        }

        $excerpt = substr($content, 0, $maxLength);
        $lastSpace = strrpos($excerpt, ' ');

        if ($lastSpace !== false) {
            $excerpt = substr($excerpt, 0, $lastSpace);
        }

        return $excerpt . '...';
    }

    /**
     * Load view preferences for folder
     *
     * @param int $folderId
     * @return array|null
     */
    private function loadViewPreferences(int $folderId): ?array
    {
        $preference = \App\Models\UserFolderViewPreference::where('user_id', Auth::id())
            ->where('folder_id', $folderId)
            ->first();

        if (!$preference) {
            // Return default preferences
            return [
                'view_mode' => 'corkboard',
                'settings' => [
                    'corkboard' => [
                        'zoom' => 'medium',
                        'layout' => 'grid',
                        'columns' => 4,
                        'display_mode' => 'synopsis'
                    ],
                    'outline' => [
                        'visible_columns' => ['title', 'type', 'synopsis', 'word_count', 'status', 'include_in_compile', 'updated_at'],
                        'column_widths' => [],
                        'sort_column' => 'item_order',
                        'sort_direction' => 'asc'
                    ],
                    'manuscript' => [
                        'font_size' => 'medium',
                        'line_spacing' => '1.5',
                        'show_page_breaks' => true
                    ]
                ]
            ];
        }

        return [
            'view_mode' => $preference->view_mode,
            'settings' => $preference->settings
        ];
    }
}
