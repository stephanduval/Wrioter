<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ExportDatabaseTables extends Command
{
    protected $signature = 'db:export-tables {directory}';
    protected $description = 'Export all database tables to CSV files';

    public function handle()
    {
        $directory = $this->argument('directory');
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        $tables = Schema::getConnection()->getDoctrineSchemaManager()->listTableNames();
        
        foreach ($tables as $table) {
            $this->info("Exporting table: {$table}");
            
            // Get table data
            $data = DB::table($table)->get();
            
            if ($data->isEmpty()) {
                $this->warn("Table {$table} is empty, skipping...");
                continue;
            }

            // Get column names
            $columns = array_keys((array) $data->first());
            
            // Create CSV file
            $filename = $directory . '/' . $table . '.csv';
            $file = fopen($filename, 'w');
            
            // Write headers
            fputcsv($file, $columns);
            
            // Write data
            foreach ($data as $row) {
                fputcsv($file, (array) $row);
            }
            
            fclose($file);
            $this->info("Exported {$table} to {$filename}");
        }

        $this->info('Database export completed successfully!');
    }
} 
