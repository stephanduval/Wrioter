<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClientErrorController extends Controller
{
    /**
     * Log client-side JavaScript errors to the application log
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logError(Request $request)
    {
        try {
            $validated = $request->validate([
                'message' => 'required|string|max:1000',
                'stack' => 'nullable|string|max:5000',
                'url' => 'nullable|string|max:2000',
                'userAgent' => 'nullable|string|max:500',
                'componentName' => 'nullable|string|max:255',
                'timestamp' => 'nullable|numeric',
            ]);

            // Rate limiting: prevent spam
            $sessionKey = 'client_errors_' . session()->getId();
            $errorCount = cache()->get($sessionKey, 0);

            if ($errorCount >= 50) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error limit reached for this session'
                ], 429);
            }

            // Increment error count for this session
            cache()->put($sessionKey, $errorCount + 1, 3600); // 1 hour expiry

            // Format the error log message
            $logMessage = sprintf(
                "[CLIENT_ERROR] %s\nURL: %s\nStack: %s\nComponent: %s\nUser Agent: %s",
                $validated['message'],
                $validated['url'] ?? 'Unknown',
                $validated['stack'] ?? 'Not provided',
                $validated['componentName'] ?? 'Unknown',
                $validated['userAgent'] ?? 'Unknown'
            );

            // Log the error
            Log::error($logMessage);

            return response()->json([
                'success' => true,
                'message' => 'Error logged successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in ClientErrorController::logError: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to log error'
            ], 500);
        }
    }
}
