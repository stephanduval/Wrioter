<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\UserCompanyController;
use App\Http\Controllers\EmailController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::group(['prefix' => 'auth'], function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);

    Route::group(['middleware' => 'auth:api'], function() {
      Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
      Route::get('user', [AuthController::class, 'user']);
    });
});

Route::middleware('auth:api')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/email', [EmailController::class, 'index']);
});


Route::middleware('auth:api')->get('/companies/all', [CompanyController::class, 'allCompanies']);
Route::middleware('auth:api')->get('/paginatedCompanies', [CompanyController::class, 'paginatedIndex']);

Route::middleware('auth:api')->delete('/users/{id}', [UserController::class, 'deleteUser']);

Route::middleware('auth:api')->get('/roles', [RolesController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'showUser']);
Route::put('/users/{id}', [UserController::class, 'updateUser']);


Route::post('/users', [UserController::class, 'addUser'])->name('users.store');
Route::fallback(function () {
    return view('welcome'); // This could be causing the HTML response.
});
