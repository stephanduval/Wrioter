<?php

namespace App\Http\Controllers;

use App\Models\Manuscript;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ManuscriptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        Log::info("Fetching manuscripts for user {$userId}");

        $query = Manuscript::where('user_id', $userId);

        // Load items if requested
        if ($request->has('with') && $request->with === 'items') {
            $query->with(['items' => function ($query) {
                $query->select('items.id', 'items.title', 'items.type')
                    ->withPivot('order_index');
            }]);
        }

        $manuscripts = $query->get();

        Log::info("Found {" . $manuscripts->count() . "} manuscripts for user {$userId}");

        return response()->json($manuscripts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('ManuscriptController::store - Creating new manuscript', $request->all());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:draft,in_progress,completed',
        ]);

        $manuscript = Manuscript::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
        ]);

        return response()->json($manuscript, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $manuscript = Manuscript::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return response()->json($manuscript);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        Log::info("ManuscriptController::update - Updating manuscript {$id}", $request->all());

        $manuscript = Manuscript::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:draft,in_progress,completed',
        ]);

        $manuscript->update($validated);

        return response()->json($manuscript);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Log::info("ManuscriptController::destroy - Deleting manuscript {$id}");

        $manuscript = Manuscript::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $manuscript->delete();

        return response()->json(['message' => 'Manuscript deleted successfully']);
    }
} 
