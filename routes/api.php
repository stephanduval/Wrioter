<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\LabelController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\SystemController;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Mail;

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
    
    // Password Reset Routes
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/auth/validate-reset-token', [AuthController::class, 'validateResetToken'])->name('password.validate-token');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.email');

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
    Route::post('/users/{id}/generate-reset-code', [UserController::class, 'generateResetCode']);
});

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

// Message notification route
Route::get('/send-message-notification', function () {
    try {
        // Get the latest message with all necessary relationships
        $message = \App\Models\Message::with(['sender', 'company', 'attachments', 'project'])
            ->latest()
            ->first();

        if (!$message) {
            return response()->json([
                'error' => 'No message found to send notification for',
            ], 404);
        }

        // Log the message and its relationships for debugging
        \Log::info('Message notification - Message details:', [
            'message_id' => $message->id,
            'has_sender' => $message->relationLoaded('sender'),
            'has_company' => $message->relationLoaded('company'),
            'sender' => $message->sender ? [
                'id' => $message->sender->id,
                'name' => $message->sender->name,
                'email' => $message->sender->email,
            ] : null,
            'company' => $message->company ? [
                'id' => $message->company->id,
                'name' => $message->company->company_name,
            ] : null,
            'subject' => $message->subject,
            'body' => $message->body,
        ]);

        // Ensure relationships are loaded
        if (!$message->relationLoaded('sender') || !$message->relationLoaded('company')) {
            $message->load(['sender', 'company']);
        }

        // Send email using the template with the message data
        Mail::mailer('mailgun')
            ->send('emails.new-message-alert', ['msg' => $message], function($mail) use ($message) {
                $mail->to('stephan.duval@gmail.com')
                     ->subject('Freynet-Gagné Portal - New Message: ' . $message->subject);
            });

        return response()->json([
            'success' => true,
            'message' => 'Notification sent successfully',
            'message_id' => $message->id
        ]);
    } catch (\Exception $e) {
        \Log::error('Error sending message notification:', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'error' => 'Failed to send notification: ' . $e->getMessage()
        ], 500);
    }
});
