<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\MessageController;

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
    Route::get('/messages', [MessageController::class, 'index']); // Fetch all messages
    Route::post('/messages', [MessageController::class, 'store']); // Create a new message
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']); // Delete a message
});

Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::middleware('auth:sanctum')->get('/test-middleware', function (Request $request) {
    return response()->json(['user' => $request->user()]);
});
