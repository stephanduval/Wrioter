<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\ProjectController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Register API routes for your application. These routes are loaded by the
| RouteServiceProvider and assigned the "api" middleware group.
|
*/

// Authentication Routes
Route::group(['prefix' => 'auth'], function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
    });
});

// User Management Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'showUser']);
    Route::post('/users', [UserController::class, 'addUser'])->name('users.store');
    Route::put('/users/{id}', [UserController::class, 'updateUser']);
    Route::delete('/users/{id}', [UserController::class, 'deleteUser']);
});

// Email Management Routes
Route::middleware('auth:sanctum')->get('/email', [EmailController::class, 'index']);

// Company Management Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/companies/all', [CompanyController::class, 'allCompanies']);
    Route::get('/paginatedCompanies', [CompanyController::class, 'paginatedIndex']);
    Route::post('/companies', [CompanyController::class, 'addCompany']);
    Route::delete('/companies/{id}', [CompanyController::class, 'deleteCompany']);
    Route::get('/companies/{id}', [CompanyController::class, 'showCompany']);
    Route::put('/companies/{id}', [CompanyController::class, 'updateCompany']);
});

// Role Management Routes
Route::middleware('auth:sanctum')->get('/roles', [RolesController::class, 'index']);

// Fallback Route
// Route::fallback(function () {
//     return response()->json(['message' => 'Resource not found.'], 404);
// });

Route::get('/diagnostic', function (Request $request) {
    return response()->json(['message' => 'API is up', 'user' => $request->user()]);
});


// Message Controller Routes:


Route::middleware('auth:sanctum')->group(function () {
    Route::get('/messages', [MessageController::class, 'index']); // Fetch messages for UI display
    Route::get('/messages/summary', [MessageController::class, 'summary']); // Fetch summary data for counts
    Route::post('/messages', [MessageController::class, 'store']); // Send message
    Route::put('/messages/{id}', [MessageController::class, 'update']); // Update message (e.g., status, read, starred)
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']); // Delete message
});

// Label Controller Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/labels', [LabelController::class, 'index']); // Fetch user labels
    Route::post('/labels', [LabelController::class, 'store']); // Create new label
    Route::delete('/labels/{id}', [LabelController::class, 'destroy']); // Delete label
    // Add other label routes if needed (index, update, destroy)
});

// Attachment Download Route
// Use 'signed' middleware ONLY. Assumes the signed URL itself provides sufficient temporary authorization.
Route::middleware('signed')->get('/attachments/{attachment}/download', [AttachmentController::class, 'download'])->name('attachments.download');

// System Info Route
Route::middleware('auth:sanctum')->get('/system/disk-usage', [SystemController::class, 'diskUsage'])->name('system.diskUsage');

Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::middleware('auth:sanctum')->get('/test-middleware', function (Request $request) {
    return response()->json(['user' => $request->user()]);
});

// Project Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/projects/summary', [ProjectController::class, 'summary']);
    Route::apiResource('/projects', ProjectController::class);
});
