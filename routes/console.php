<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Scheduled tasks (Laravel 11 style)
Schedule::command('scrivener:cleanup')
    ->daily()
    ->at('02:00')
    ->appendOutputTo(storage_path('logs/cleanup.log'));

// Console commands
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
