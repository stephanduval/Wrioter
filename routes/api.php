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
use App\Http\Controllers\ManuscriptController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ScrivenerImportController;
use App\Http\Controllers\ItemController;
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

// Client Error Logging (no auth required - for mobile error tracking)
Route::post('log-client-error', [App\Http\Controllers\ClientErrorController::class, 'logError']);

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

// Manuscript Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/manuscripts', [ManuscriptController::class, 'index']);
    Route::post('/manuscripts', [ManuscriptController::class, 'store']);
    Route::get('/manuscripts/{id}', [ManuscriptController::class, 'show']);
    Route::get('/manuscripts/{id}/collections', [ManuscriptController::class, 'collections']);
    Route::get('/manuscripts/{id}/items', [ManuscriptController::class, 'items']);
    Route::put('/manuscripts/{id}', [ManuscriptController::class, 'update']);
    Route::delete('/manuscripts/{id}', [ManuscriptController::class, 'destroy']);

    // Mindmap routes for manuscripts
    Route::post('/manuscripts/{id}/sync-mindmap', [ManuscriptController::class, 'syncMindmap']);
    Route::get('/manuscripts/{id}/default-mindmap', [ManuscriptController::class, 'getDefaultMindmap']);

    // Item routes within manuscripts
    Route::post('/manuscripts/{manuscriptId}/items', [ItemController::class, 'store']);
    Route::get('/manuscripts/{manuscriptId}/items/{itemId}', [ItemController::class, 'show']);
    Route::put('/manuscripts/{manuscriptId}/items/{itemId}', [ItemController::class, 'update']);
    Route::delete('/manuscripts/{manuscriptId}/items/{itemId}', [ItemController::class, 'destroy']);
    Route::patch('/manuscripts/{manuscriptId}/items/{itemId}/rename', [ItemController::class, 'rename']);
    Route::get('/manuscripts/{manuscriptId}/items/{itemId}/versions', [ItemController::class, 'versions']);
    Route::post('/manuscripts/{manuscriptId}/items/reorder', [ItemController::class, 'reorder']);
    Route::post('/manuscripts/{manuscriptId}/items/{itemId}/duplicate', [ItemController::class, 'duplicate']);
    Route::patch('/manuscripts/{manuscriptId}/items/{itemId}/move-up', [ItemController::class, 'moveUp']);
    Route::patch('/manuscripts/{manuscriptId}/items/{itemId}/move-down', [ItemController::class, 'moveDown']);
});

// Admin Routes for Raw Files
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('admin')->group(function () {
        // Manuscript structure and raw files
        Route::get('/manuscripts/{manuscriptId}/structure', [AdminController::class, 'getManuscriptStructure']);
        Route::get('/manuscripts/{manuscriptId}/raw-files', [AdminController::class, 'getManuscriptRawFiles']);
        Route::get('/manuscripts/{manuscriptId}/raw-files/{fileId}', [AdminController::class, 'getRawFileContent']);
        Route::get('/manuscripts/{manuscriptId}/raw-files/{fileId}/download', [AdminController::class, 'downloadRawFile']);
        
        // Item attachments
        Route::get('/items/{itemId}/attachments', [AdminController::class, 'getItemAttachments']);
        Route::get('/items/{itemId}/attachments/{attachmentId}', [AdminController::class, 'getAttachmentContent']);
        Route::get('/items/{itemId}/attachments/{attachmentId}/download', [AdminController::class, 'downloadAttachment']);
    });
});

// Scrivener Import Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('scrivener')->group(function () {
        Route::get('/imports', [ScrivenerImportController::class, 'index']);
        Route::post('/import', [ScrivenerImportController::class, 'store']);
        Route::get('/imports/{id}', [ScrivenerImportController::class, 'show']);
        Route::post('/imports/{id}/cancel', [ScrivenerImportController::class, 'cancel']);
        Route::post('/imports/{id}/retry', [ScrivenerImportController::class, 'retry']);
        Route::delete('/imports/{id}', [ScrivenerImportController::class, 'destroy']);
    });
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

        // Use log driver in testing environment, mailgun in production
        $mailer = app()->environment('testing') ? 'log' : 'mailgun';

        // Send email using the template with the message data
        Mail::mailer($mailer)
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
            'error' => 'Failed to process notification: ' . $e->getMessage()
        ], 500);
    }
});

// Folder View Routes
Route::middleware('auth:sanctum')->group(function () {
    // Get folder contents optimized for view mode
    Route::get('/folders/{folderId}/contents', [App\Http\Controllers\FolderController::class, 'getContents']);
    // Reorder items within a folder
    Route::post('/folders/{folderId}/reorder', [App\Http\Controllers\FolderController::class, 'reorder']);
    // Get scrivening contents (multiple folders/items combined)
    Route::post('/folders/scrivening/contents', [App\Http\Controllers\FolderController::class, 'getScriveningContents']);
});

// Mind Map Routes
Route::middleware('auth:sanctum')->group(function () {
    // Mindmap CRUD
    Route::apiResource('mindmaps', App\Http\Controllers\Api\MindMapController::class);

    // Mindmap Items Management
    Route::post('/mindmaps/{id}/items/add', [App\Http\Controllers\Api\MindMapController::class, 'addItem']);
    Route::post('/mindmaps/{id}/items/create', [App\Http\Controllers\Api\MindMapController::class, 'createItem']);
    Route::put('/mindmaps/{id}/items/{itemId}/position', [App\Http\Controllers\Api\MindMapController::class, 'updatePosition']);
    Route::delete('/mindmaps/{id}/items/{itemId}', [App\Http\Controllers\Api\MindMapController::class, 'removeItem']);

    // Connections
    Route::post('/mindmaps/{id}/connections', [App\Http\Controllers\Api\MindMapController::class, 'createConnection']);
    Route::put('/connections/{id}', [App\Http\Controllers\Api\MindMapController::class, 'updateConnection']);
    Route::delete('/connections/{id}', [App\Http\Controllers\Api\MindMapController::class, 'deleteConnection']);

    // Bulk operations
    Route::post('/mindmaps/{id}/positions/batch', [App\Http\Controllers\Api\MindMapController::class, 'batchUpdatePositions']);

    // Import manuscript items
    Route::post('/mindmaps/{id}/import-manuscript', [App\Http\Controllers\Api\MindMapController::class, 'importManuscript']);
});

// User Preferences Routes
Route::middleware('auth:sanctum')->group(function () {
    // Folder view preferences
    Route::get('/preferences/folder-views/{folderId}', [App\Http\Controllers\UserPreferencesController::class, 'getFolderViewPreferences']);
    Route::post('/preferences/folder-views/{folderId}', [App\Http\Controllers\UserPreferencesController::class, 'saveFolderViewPreferences']);
    Route::delete('/preferences/folder-views/{folderId}', [App\Http\Controllers\UserPreferencesController::class, 'deleteFolderViewPreferences']);
});
