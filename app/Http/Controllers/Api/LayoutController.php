<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LayoutController extends Controller
{
    /**
     * Get all layouts for a manuscript
     */
    public function index(Request $request, $manuscriptId)
    {
        $layouts = DB::table('user_split_layouts')
            ->where('user_id', Auth::id())
            ->where('manuscript_id', $manuscriptId)
            ->orderBy('is_default', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($layouts);
    }

    /**
     * Store a new layout
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'manuscript_id' => 'required|exists:manuscripts,id',
            'name' => 'required|string|max:255',
            'layout_config' => 'required|array',
            'is_default' => 'boolean'
        ]);

        // If setting as default, unset other defaults
        if ($request->is_default) {
            DB::table('user_split_layouts')
                ->where('user_id', Auth::id())
                ->where('manuscript_id', $validated['manuscript_id'])
                ->update(['is_default' => false]);
        }

        $layout = DB::table('user_split_layouts')->insertGetId([
            'user_id' => Auth::id(),
            'manuscript_id' => $validated['manuscript_id'],
            'name' => $validated['name'],
            'layout_config' => json_encode($validated['layout_config']),
            'is_default' => $request->is_default ?? false,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'id' => $layout,
            'message' => 'Layout saved successfully'
        ], 201);
    }

    /**
     * Get a specific layout
     */
    public function show($id)
    {
        $layout = DB::table('user_split_layouts')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$layout) {
            return response()->json(['message' => 'Layout not found'], 404);
        }

        $layout->layout_config = json_decode($layout->layout_config);

        return response()->json($layout);
    }

    /**
     * Update a layout
     */
    public function update(Request $request, $id)
    {
        $layout = DB::table('user_split_layouts')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$layout) {
            return response()->json(['message' => 'Layout not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'layout_config' => 'array',
            'is_default' => 'boolean'
        ]);

        // If setting as default, unset other defaults
        if (isset($validated['is_default']) && $validated['is_default']) {
            DB::table('user_split_layouts')
                ->where('user_id', Auth::id())
                ->where('manuscript_id', $layout->manuscript_id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        $updateData = [
            'updated_at' => now()
        ];

        if (isset($validated['name'])) {
            $updateData['name'] = $validated['name'];
        }

        if (isset($validated['layout_config'])) {
            $updateData['layout_config'] = json_encode($validated['layout_config']);
        }

        if (isset($validated['is_default'])) {
            $updateData['is_default'] = $validated['is_default'];
        }

        DB::table('user_split_layouts')
            ->where('id', $id)
            ->update($updateData);

        return response()->json(['message' => 'Layout updated successfully']);
    }

    /**
     * Delete a layout
     */
    public function destroy($id)
    {
        $deleted = DB::table('user_split_layouts')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Layout not found'], 404);
        }

        return response()->json(['message' => 'Layout deleted successfully']);
    }

    /**
     * Set a layout as default
     */
    public function setDefault($id)
    {
        $layout = DB::table('user_split_layouts')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->first();

        if (!$layout) {
            return response()->json(['message' => 'Layout not found'], 404);
        }

        // Unset other defaults
        DB::table('user_split_layouts')
            ->where('user_id', Auth::id())
            ->where('manuscript_id', $layout->manuscript_id)
            ->update(['is_default' => false]);

        // Set this as default
        DB::table('user_split_layouts')
            ->where('id', $id)
            ->update(['is_default' => true]);

        return response()->json(['message' => 'Layout set as default']);
    }
}
