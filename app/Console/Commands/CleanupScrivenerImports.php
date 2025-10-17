<?php

namespace App\Console\Commands;

use App\Models\ScrivenerImport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CleanupScrivenerImports extends Command
{
    protected $signature = 'scrivener:cleanup
                            {--days-completed=7 : Days to keep completed import files}
                            {--days-failed=30 : Days to keep failed import files}
                            {--dry-run : Show what would be deleted without deleting}';

    protected $description = 'Clean up old Scrivener import temporary files';

    public function handle(): int
    {
        $daysCompleted = (int) $this->option('days-completed');
        $daysFailed = (int) $this->option('days-failed');
        $dryRun = $this->option('dry-run');

        $this->info('Scrivener Import Cleanup');
        $this->info('========================');
        $this->info("Days to keep completed imports: {$daysCompleted}");
        $this->info("Days to keep failed imports: {$daysFailed}");
        $this->info("Dry run: " . ($dryRun ? 'YES' : 'NO'));
        $this->newLine();

        $totalFreed = 0;
        $filesDeleted = 0;

        // Clean up completed imports
        $completedCutoff = Carbon::now()->subDays($daysCompleted);
        $completedImports = ScrivenerImport::where('status', 'completed')
            ->where('updated_at', '<', $completedCutoff)
            ->whereNotNull('storage_path')
            ->get();

        $this->info("Found {$completedImports->count()} completed imports older than {$daysCompleted} days");

        foreach ($completedImports as $import) {
            $result = $this->cleanupImportFiles($import, $dryRun);
            $totalFreed += $result['bytes'];
            $filesDeleted += $result['files'];
        }

        // Clean up failed imports
        $failedCutoff = Carbon::now()->subDays($daysFailed);
        $failedImports = ScrivenerImport::where('status', 'failed')
            ->where('updated_at', '<', $failedCutoff)
            ->whereNotNull('storage_path')
            ->get();

        $this->info("Found {$failedImports->count()} failed imports older than {$daysFailed} days");

        foreach ($failedImports as $import) {
            $result = $this->cleanupImportFiles($import, $dryRun);
            $totalFreed += $result['bytes'];
            $filesDeleted += $result['files'];
        }

        // Clean up orphaned temp files
        $orphanedResult = $this->cleanupOrphanedTempFiles($dryRun);
        $totalFreed += $orphanedResult['bytes'];
        $filesDeleted += $orphanedResult['files'];

        // Clean up orphaned extraction directories
        $extractionResult = $this->cleanupOrphanedExtractionDirs($dryRun);
        $totalFreed += $extractionResult['bytes'];
        $filesDeleted += $extractionResult['files'];

        $this->newLine();
        $this->info('Cleanup Summary:');
        $this->info("Files deleted: {$filesDeleted}");
        $this->info("Disk space freed: " . $this->formatBytes($totalFreed));

        if ($dryRun) {
            $this->warn('DRY RUN - No files were actually deleted');
        }

        Log::info('Scrivener import cleanup completed', [
            'files_deleted' => $filesDeleted,
            'bytes_freed' => $totalFreed,
            'dry_run' => $dryRun
        ]);

        return Command::SUCCESS;
    }

    private function cleanupImportFiles(ScrivenerImport $import, bool $dryRun): array
    {
        if (!$import->storage_path || !file_exists($import->storage_path)) {
            return ['bytes' => 0, 'files' => 0];
        }

        $fileSize = filesize($import->storage_path);
        $this->line("  Import #{$import->id}: {$import->storage_path} ({$this->formatBytes($fileSize)})");

        if (!$dryRun && unlink($import->storage_path)) {
            $import->update(['storage_path' => null]);
            return ['bytes' => $fileSize, 'files' => 1];
        }

        return ['bytes' => $dryRun ? $fileSize : 0, 'files' => $dryRun ? 1 : 0];
    }

    private function cleanupOrphanedTempFiles(bool $dryRun): array
    {
        $tempPath = sys_get_temp_dir() . '/scrivener-uploads';
        if (!file_exists($tempPath)) {
            return ['bytes' => 0, 'files' => 0];
        }

        $bytesFreed = 0;
        $filesDeleted = 0;
        $this->info("Checking for orphaned files in {$tempPath}");

        $activeStoragePaths = ScrivenerImport::whereNotNull('storage_path')
            ->where('status', '!=', 'completed')
            ->pluck('storage_path')
            ->toArray();

        foreach (glob($tempPath . '/*') as $file) {
            if (!is_file($file) || in_array($file, $activeStoragePaths)) {
                continue;
            }

            $fileSize = filesize($file);
            $this->line("  Orphaned: " . basename($file) . " ({$this->formatBytes($fileSize)})");

            if (!$dryRun && unlink($file)) {
                $bytesFreed += $fileSize;
                $filesDeleted++;
            } elseif ($dryRun) {
                $bytesFreed += $fileSize;
                $filesDeleted++;
            }
        }

        return ['bytes' => $bytesFreed, 'files' => $filesDeleted];
    }

    private function cleanupOrphanedExtractionDirs(bool $dryRun): array
    {
        $tempPath = sys_get_temp_dir();
        $bytesFreed = 0;
        $filesDeleted = 0;
        $cutoff = Carbon::now()->subDay()->timestamp;

        $this->info("Checking for orphaned extraction directories in {$tempPath}");

        foreach (glob($tempPath . '/scrivener-import-*', GLOB_ONLYDIR) as $dir) {
            if (filemtime($dir) >= $cutoff) {
                continue;
            }

            $size = $this->getDirectorySize($dir);
            $age = Carbon::createFromTimestamp(filemtime($dir))->diffForHumans();
            $this->line("  Orphaned: " . basename($dir) . " ({$this->formatBytes($size)}, {$age})");

            if (!$dryRun) {
                $this->deleteDirectory($dir);
                $bytesFreed += $size;
                $filesDeleted++;
            } else {
                $bytesFreed += $size;
                $filesDeleted++;
            }
        }

        return ['bytes' => $bytesFreed, 'files' => $filesDeleted];
    }

    private function getDirectorySize(string $directory): int
    {
        $size = 0;
        try {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS)
            );
            foreach ($files as $file) {
                if ($file->isFile()) $size += $file->getSize();
            }
        } catch (\Exception $e) {
            // Ignore errors
        }
        return $size;
    }

    private function deleteDirectory(string $directory): void
    {
        if (!file_exists($directory)) return;

        try {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
                \RecursiveIteratorIterator::CHILD_FIRST
            );
            foreach ($files as $file) {
                $file->isDir() ? rmdir($file->getPathname()) : unlink($file->getPathname());
            }
            rmdir($directory);
        } catch (\Exception $e) {
            Log::error('Failed to delete directory', ['directory' => $directory, 'error' => $e->getMessage()]);
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < 3) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
