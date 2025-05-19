<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Password Reset Routes
Route::get('/reset-password', function () {
    return view('application');
})->name('password.reset');

Route::get('/forgot-password', function () {
    return view('application');
})->name('password.request');

// Catch-All Route (Placed at the bottom)
Route::get('{any}', function() {
    return view('application');
})->where('any', '.*');


Route::get('/login', function () {
    // Return a login view or an SPA page
    return view('application'); 
})->name('login');



//Route::get('/build/{path}', function ($path) {
//   return response()->file(public_path("build/{$path}"), [
//        'Content-Type' => 'application/javascript',
//    ]);
//})->where('path', '.*');

