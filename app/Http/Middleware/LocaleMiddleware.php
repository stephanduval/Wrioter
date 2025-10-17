<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LocaleMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Locale is enabled and allowed to be change
        if (session()->has('locale') && in_array(session()->get('locale'), ['en', 'fr', 'de', 'ar'])) {
            app()->setLocale(session()->get('locale'));
        }

        return $next($request);
    }
} 
