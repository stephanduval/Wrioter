<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

//Catch-All Route (Placed at the bottom)
Route::get('{any}', function() {
    return view('application');
})->where('any', '.*');
