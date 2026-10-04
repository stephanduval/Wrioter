<?php

namespace App\Http\Controllers;

use App\Models\UserFolderViewPreference;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class UserPreferencesController extends Controller
{
    /**
     * Get folder view preferences for a specific folder
     *
     * @param int $folderId
     * @return JsonResponse
     */
    public function getFolderViewPreferences(int $folderId): JsonResponse
    {
        // Verify folder exists and user has access
        $folder = Item::where('id', $folderId)
            ->where('type', 'folder')
            ->firstOrFail();

        if ($folder->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        $preference = UserFolderViewPreference::where('user_id', Auth::id())
            ->where('folder_id', $folderId)
            ->first();

        if (!$preference) {
            // Return default preferences
            return response()->json([
                'data' => [
                    'view_mode' => 'corkboard',
                    'settings' => $this->getDefaultSettings()
                ]
            ]);
        }

        return response()->json([
            'data' => [
                'view_mode' => $preference->view_mode,
                'settings' => $preference->settings
            ]
        ]);
    }

    /**
     * Save or update folder view preferences
     *
     * @param Request $request
     * @param int $folderId
     * @return JsonResponse
     */
    public function saveFolderViewPreferences(Request $request, int $folderId): JsonResponse
    {
        // Verify folder exists and user has access
        $folder = Item::where('id', $folderId)
            ->where('type', 'folder')
            ->firstOrFail();

        if ($folder->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        // Validate request
        $validator = Validator::make($request->all(), [
            'view_mode' => 'sometimes|string|in:manuscript,corkboard,outline',
            'settings' => 'sometimes|array',
            'settings.manuscript' => 'sometimes|array',
            'settings.manuscript.font_size' => 'sometimes|string|in:small,medium,large',
            'settings.manuscript.line_spacing' => 'sometimes|string|in:single,1.5,double',
            'settings.manuscript.show_page_breaks' => 'sometimes|boolean',
            'settings.corkboard' => 'sometimes|array',
            'settings.corkboard.zoom' => 'sometimes|string|in:small,medium,large',
            'settings.corkboard.layout' => 'sometimes|string|in:grid,freeform',
            'settings.corkboard.columns' => 'sometimes|integer|min:1|max:8',
            'settings.corkboard.display_mode' => 'sometimes|string|in:synopsis,excerpt,metadata',
            'settings.outline' => 'sometimes|array',
            'settings.outline.visible_columns' => 'sometimes|array',
            'settings.outline.column_widths' => 'sometimes|array',
            'settings.outline.sort_column' => 'sometimes|string',
            'settings.outline.sort_direction' => 'sometimes|string|in:asc,desc',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find or create preference
        $preference = UserFolderViewPreference::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'folder_id' => $folderId
            ],
            [
                'view_mode' => $request->input('view_mode', 'corkboard'),
                'settings' => $request->input('settings', $this->getDefaultSettings())
            ]
        );

        return response()->json([
            'message' => 'Preferences saved successfully',
            'data' => [
                'view_mode' => $preference->view_mode,
                'settings' => $preference->settings
            ]
        ]);
    }

    /**
     * Delete folder view preferences (reset to defaults)
     *
     * @param int $folderId
     * @return JsonResponse
     */
    public function deleteFolderViewPreferences(int $folderId): JsonResponse
    {
        UserFolderViewPreference::where('user_id', Auth::id())
            ->where('folder_id', $folderId)
            ->delete();

        return response()->json([
            'message' => 'Preferences reset to defaults'
        ]);
    }

    /**
     * Get default settings structure
     *
     * @return array
     */
    private function getDefaultSettings(): array
    {
        return [
            'manuscript' => [
                'font_size' => 'medium',
                'line_spacing' => '1.5',
                'show_page_breaks' => true
            ],
            'corkboard' => [
                'zoom' => 'medium',
                'layout' => 'grid',
                'columns' => 4,
                'display_mode' => 'excerpt'
            ],
            'outline' => [
                'visible_columns' => [
                    'title',
                    'type',
                    'synopsis',
                    'word_count',
                    'status',
                    'include_in_compile',
                    'updated_at'
                ],
                'column_widths' => [],
                'sort_column' => 'item_order',
                'sort_direction' => 'asc'
            ]
        ];
    }
}
