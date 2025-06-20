<?php

namespace App\Http\Controllers;

use App\Models\ScrivenerImport;
use App\Jobs\ProcessScrivenerImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ScrivenerImportController extends Controller
{
    /**
     * Get list of recent imports
     */
    public function index()
    {
        $imports = ScrivenerImport::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json($imports);
    }

    /**
     * Handle file upload and start import process
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:zip|max:51200', // 50MB max
        ]);

        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $filename = Str::random(40) . '.zip';
            
            // Store in temporary location
            $path = $file->storeAs('scrivener/temp', $filename);

            // Create import record
            $import = ScrivenerImport::create([
                'user_id' => auth()->id(),
                'filename' => $originalName,
                'status' => 'pending',
                'storage_path' => $path,
                'progress' => 0,
                'total_items' => 0,
                'processed_items' => 0,
                'current_step' => 'Queued for processing',
            ]);

            // Dispatch job to process the file
            ProcessScrivenerImport::dispatch($import);

            return response()->json([
                'message' => 'File uploaded successfully',
                'import_id' => $import->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Scrivener import failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to process file upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get status of a specific import
     */
    public function show($id)
    {
        $import = ScrivenerImport::where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json($import);
    }

    /**
     * Cancel a pending import
     */
    public function cancel($id)
    {
        $import = ScrivenerImport::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->findOrFail($id);

        // Delete the stored file
        if ($import->storage_path) {
            Storage::delete($import->storage_path);
        }

        // Update the import record
        $import->update([
            'status' => 'failed',
            'error_message' => 'Import cancelled by user',
            'current_step' => 'Cancelled',
        ]);

        return response()->json(['message' => 'Import cancelled successfully']);
    }

    /**
     * Retry a failed import
     */
    public function retry($id)
    {
        $import = ScrivenerImport::where('user_id', auth()->id())
            ->where('status', 'failed')
            ->findOrFail($id);

        // Reset the import record
        $import->update([
            'status' => 'pending',
            'error_message' => null,
            'current_step' => null,
            'progress' => 0,
            'processed_items' => 0,
        ]);

        // Dispatch a new job
        ProcessScrivenerImport::dispatch($import);

        return response()->json(['message' => 'Import restarted successfully']);
    }

    /**
     * Delete a failed import record
     */
    public function destroy($id)
    {
        $import = ScrivenerImport::where('user_id', auth()->id())
            ->where('status', 'failed')
            ->findOrFail($id);

        // Clean up the stored file if it exists
        if ($import->storage_path && Storage::exists($import->storage_path)) {
            Storage::delete($import->storage_path);
        }

        $import->delete();

        return response()->json(['message' => 'Import deleted successfully']);
    }
} 
 