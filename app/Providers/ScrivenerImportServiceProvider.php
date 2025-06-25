<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\ScrivenerImport\RtfConverter;
use App\Services\ScrivenerImport\FileHandler;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;

class ScrivenerImportServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(RtfConverter::class, function ($app) {
            return new RtfConverter();
        });

        $this->app->singleton(FileHandler::class, function ($app) {
            return new FileHandler();
        });

        $this->app->singleton(XmlParser::class, function ($app) {
            return new XmlParser($app->make(RtfConverter::class));
        });

        $this->app->singleton(DataTransformer::class, function ($app) {
            return new DataTransformer($app->make(RtfConverter::class));
        });

        $this->app->singleton(DatabasePopulator::class, function ($app) {
            return new DatabasePopulator();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
} 
