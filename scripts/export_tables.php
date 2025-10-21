<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$directory = $argv[1] ?? null;
if (!$directory) {
    echo "Please provide a directory path\n";
    exit(1);
}

if (!is_dir($directory)) {
    mkdir($directory, 0755, true);
}

$tables = DB::select('SHOW TABLES');
$dbName = config('database.connections.mysql.database');
$tableKey = "Tables_in_{$dbName}";

foreach ($tables as $table) {
    $tableName = $table->$tableKey;
    echo "Exporting table: {$tableName}\n";
    
    // Get table data
    $data = DB::table($tableName)->get();
    
    if ($data->isEmpty()) {
        echo "Table {$tableName} is empty, skipping...\n";
        continue;
    }

    // Get column names
    $columns = array_keys((array) $data->first());
    
    // Create CSV file
    $filename = $directory . '/' . $tableName . '.csv';
    $file = fopen($filename, 'w');
    
    // Write headers
    fputcsv($file, $columns);
    
    // Write data
    foreach ($data as $row) {
        fputcsv($file, (array) $row);
    }
    
    fclose($file);
    echo "Exported {$tableName} to {$filename}\n";
}

echo "Database export completed successfully!\n"; 
