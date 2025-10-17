<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

// Parse command line arguments
$options = getopt('', ['env::']);
if (isset($options['env'])) {
    $app['env'] = $options['env'];
}

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$outputFile = end($argv);
if (!$outputFile || strpos($outputFile, '--') === 0) {
    echo "Please provide an output file path\n";
    exit(1);
}

// Create the output directory if it doesn't exist
$directory = dirname($outputFile);
if (!is_dir($directory)) {
    mkdir($directory, 0755, true);
}

$tables = DB::select('SHOW TABLES');
$dbName = config('database.connections.mysql.database');
$tableKey = "Tables_in_{$dbName}";

$file = fopen($outputFile, 'w');

// Write header
fwrite($file, "Database Export: {$dbName}\n");
fwrite($file, "Generated: " . date('Y-m-d H:i:s') . "\n");
fwrite($file, str_repeat("=", 80) . "\n\n");

foreach ($tables as $table) {
    $tableName = $table->$tableKey;
    echo "Exporting table: {$tableName}\n";
    
    // Get table structure
    $columns = DB::select("SHOW COLUMNS FROM {$tableName}");
    
    // Write table header
    fwrite($file, "Table: {$tableName}\n");
    fwrite($file, str_repeat("-", 80) . "\n");
    
    // Write table structure
    fwrite($file, "Table Structure:\n");
    fwrite($file, str_repeat("-", 80) . "\n");
    fwrite($file, sprintf("%-20s %-15s %-10s %-10s %-10s %-10s\n", 
        'Column', 'Type', 'Null', 'Key', 'Default', 'Extra'));
    fwrite($file, str_repeat("-", 80) . "\n");
    
    foreach ($columns as $column) {
        fwrite($file, sprintf("%-20s %-15s %-10s %-10s %-10s %-10s\n",
            $column->Field,
            $column->Type,
            $column->Null,
            $column->Key,
            $column->Default ?? 'NULL',
            $column->Extra
        ));
    }
    fwrite($file, "\n");
    
    // Get table data
    $data = DB::table($tableName)->get();
    
    if ($data->isEmpty()) {
        fwrite($file, "No records found\n\n");
        continue;
    }

    // Write table data header
    fwrite($file, "Table Data:\n");
    fwrite($file, str_repeat("-", 80) . "\n");
    
    // Get column names and calculate column widths
    $dataColumns = array_keys((array) $data->first());
    $columnWidths = [];
    
    // Initialize column widths with header lengths
    foreach ($dataColumns as $column) {
        $columnWidths[$column] = strlen($column);
    }
    
    // Calculate maximum width for each column
    foreach ($data as $row) {
        foreach ($dataColumns as $column) {
            $value = (string) $row->$column;
            $columnWidths[$column] = max($columnWidths[$column], strlen($value));
        }
    }
    
    // Write column headers
    $header = '| ';
    $separator = '+-';
    foreach ($dataColumns as $column) {
        $header .= str_pad($column, $columnWidths[$column]) . ' | ';
        $separator .= str_repeat('-', $columnWidths[$column]) . '-+-';
    }
    $header = rtrim($header, ' | ') . ' |';
    $separator = rtrim($separator, '-+-') . '-+';
    
    fwrite($file, $separator . "\n");
    fwrite($file, $header . "\n");
    fwrite($file, $separator . "\n");
    
    // Write data rows
    foreach ($data as $row) {
        $line = '| ';
        foreach ($dataColumns as $column) {
            $value = (string) $row->$column;
            $line .= str_pad($value, $columnWidths[$column]) . ' | ';
        }
        $line = rtrim($line, ' | ') . ' |';
        fwrite($file, $line . "\n");
    }
    
    fwrite($file, $separator . "\n\n");
    echo "Exported {$tableName} to {$outputFile}\n";
}

fclose($file);
echo "Database export completed successfully!\n"; 
