<?php

namespace App\Http\Controllers;

use App\Models\Label;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LabelController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $userId = Auth::id();
        Log::info("Fetching labels for user {$userId}");

        $labels = Label::where('user_id', $userId)->get();

        Log::info("Found {" . $labels->count() . "} labels for user {$userId}");

        // Ensure ID is included along with name and color
        return response()->json($labels->map(function ($label) {
            return [
                'id' => $label->id,
                'label_name' => $label->label_name,
                'colour' => $label->colour,
            ];
        }));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label_name' => 'required|string|max:191',
            'colour' => 'required|string|max:50', // Validate colour (e.g., hex, name)
        ]);

        $userId = Auth::id();
        Log::info("Attempting to create label for user {$userId}", $validated);

        // Check if label already exists for this user
        $existingLabel = Label::where('user_id', $userId)
                             ->where('label_name', $validated['label_name'])
                             ->first();

        if ($existingLabel) {
            Log::warning("Label '{$validated['label_name']}' already exists for user {$userId}");
            return response()->json(['message' => 'Label already exists.'], 409); // 409 Conflict
        }

        // Create the new label
        $label = Label::create([
            'label_name' => $validated['label_name'],
            'user_id' => $userId,
            'colour' => $validated['colour'],
        ]);

        Log::info("Label created successfully", ['id' => $label->id]);

        return response()->json($label, 201); // Return the created label
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $userId = Auth::id();
        Log::info("Attempting to delete label {$id} for user {$userId}");

        $label = Label::where('id', $id)
                      ->where('user_id', $userId)
                      ->first();

        if (!$label) {
            Log::warning("Label {$id} not found or does not belong to user {$userId}.");
            return response()->json(['message' => 'Label not found.'], 404);
        }

        try {
            // Detach the label from all messages first (optional but good practice)
            $label->messages()->detach();
            Log::info("Detached label {$id} from messages.");

            // Delete the label itself
            $label->delete();
            Log::info("Successfully deleted label {$id}.");

            return response()->json(['message' => 'Label deleted successfully.']);
        } catch (\Exception $e) {
            Log::error("Error deleting label {$id}: {$e->getMessage()}");
            return response()->json(['message' => 'Failed to delete label.'], 500);
        }
    }
}
