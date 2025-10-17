<?php

// Test route to debug upload authentication
Route::post('/api/test-upload', function (Request $request) {
    return response()->json([
        'authenticated' => auth()->check(),
        'user_id' => auth()->id(),
        'headers' => $request->headers->all(),
        'content_length' => $request->header('Content-Length'),
        'has_file' => $request->hasFile('file'),
        'php_limits' => [
            'post_max_size' => ini_get('post_max_size'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
        ]
    ]);
})->middleware('auth:sanctum');