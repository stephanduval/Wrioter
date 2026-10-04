<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->string('icon_color', 20)
                ->nullable()
                ->after('icon_name')
                ->comment('Hex color for custom icon, e.g. #FF5733');

            $table->boolean('use_custom_icon')
                ->default(false)
                ->after('icon_color')
                ->comment('When true, render icon_name + icon_color instead of type-based default');
        });
    }

    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['icon_color', 'use_custom_icon']);
        });
    }
};
