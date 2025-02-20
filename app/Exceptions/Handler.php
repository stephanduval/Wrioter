<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;

class Handler extends ExceptionHandler
{
    // ...

    public function render($request, Throwable $exception)
    {
        \Log::error('Exception encountered', [
            'exception' => $exception,
            'message'   => $exception->getMessage(),
            'trace'     => $exception->getTraceAsString(),
        ]);

        if ($request->expectsJson()) {
            $status = method_exists($exception, 'getStatusCode')
                ? $exception->getStatusCode()
                : 500;

            return response()->json([
                'message' => $exception->getMessage(),
                'trace'   => config('app.debug') ? $exception->getTrace() : [],
            ], $status);
        }

        return parent::render($request, $exception);
    }

    protected function unauthenticated($request, \Illuminate\Auth\AuthenticationException $exception)
    {
        if ($request->expectsJson()) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        return redirect()->guest(route('login'));
    }
}
