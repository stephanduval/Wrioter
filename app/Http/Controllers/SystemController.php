<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SystemController extends Controller
{
    /**
     * Get disk usage statistics.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function diskUsage()
    {
        try {
            $disk = '/'; // Check root filesystem

            $totalBytes = disk_total_space($disk);
            $freeBytes = disk_free_space($disk);

            if ($totalBytes === false || $freeBytes === false) {
                Log::error("Could not retrieve disk space information for {$disk}.");
                return response()->json(['error' => 'Could not retrieve disk space information.'], 500);
            }

            $usedBytes = $totalBytes - $freeBytes;
            $percentUsed = $totalBytes > 0 ? round(($usedBytes / $totalBytes) * 100, 2) : 0;

            // Helper function to format bytes
            $formatBytes = function ($bytes, $precision = 2) {
                $units = ['B', 'KB', 'MB', 'GB', 'TB'];
                $bytes = max($bytes, 0);
                $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
                $pow = min($pow, count($units) - 1);
                $bytes /= pow(1024, $pow);
                return round($bytes, $precision) . ' ' . $units[$pow];
            };

            return response()->json([
                'total' => $formatBytes($totalBytes),
                'used' => $formatBytes($usedBytes),
                'free' => $formatBytes($freeBytes),
                'percent' => $percentUsed,
            ]);
        } catch (\Exception $e) {
            Log::error("Error getting disk usage: " . $e->getMessage());
            return response()->json(['error' => 'Server error retrieving disk usage.'], 500);
        }
    }
}
