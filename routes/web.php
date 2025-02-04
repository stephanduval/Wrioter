<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboards/crm'); // If user is logged in, send to dashboard
    }
    return redirect('/login?redirect=/dashboards/crm');
});



Route::get('{any?}', function() {
    return view('application');
})->where('any', '.*');
