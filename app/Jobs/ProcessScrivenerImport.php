<?php

namespace App\Jobs;

use App\Models\ScrivenerImport;
use App\Services\ScrivenerImport\FileHandler;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;
use App\Services\ScrivenerImport\FileScanner;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessScrivenerImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected ScrivenerImport $import;

    /**
     * Create a new job instance.
     */
    public function __construct(ScrivenerImport $import)
    {
        $this->import = $import;
    }

    /**
     * Update import progress
     */
    protected function updateProgress(string $step, int $processed = null, int $total = null): void
    {
        $this->import->current_step = $step;
        
        if ($total !== null) {
            $this->import->total_items = $total;
        }
        
        if ($processed !== null) {
            $this->import->processed_items = $processed;
        }
        
        if ($this->import->total_items > 0) {
            $this->import->progress = ($this->import->processed_items / $this->import->total_items) * 100;
        }
        
        $this->import->save();
    }

    /**
     * Execute the job.
     */
    public function handle(
        FileHandler $fileHandler,
        XmlParser $xmlParser,
        DataTransformer $dataTransformer,
        DatabasePopulator $databasePopulator,
        FileScanner $fileScanner
    ): void {
        try {
            // Update status to processing
            $this->import->update(['status' => 'processing']);
            $this->updateProgress('Starting import...');

            // Get the full path to the stored file
            // Check if it's already an absolute path (new format) or relative (old format)
            $filePath = str_starts_with($this->import->storage_path, '/')
                ? $this->import->storage_path
                : Storage::path($this->import->storage_path);

            // Step 1: Extract and validate the .scrivx file
            $this->updateProgress('Extracting project file...');
            Log::info('Extracting Scrivener project file...', ['import_id' => $this->import->id]);
            $extractedPath = $fileHandler->extract($filePath);
            
            if (!$fileHandler->validate($extractedPath)) {
                throw new \RuntimeException('Invalid Scrivener project file structure');
            }

            // Step 2: Parse the XML
            $this->updateProgress('Parsing project data...');
            Log::info('Parsing project data...', ['import_id' => $this->import->id]);
            $xmlData = $xmlParser->parse($extractedPath . '/project.scrivx');
            
            if (!$xmlParser->validate($xmlData)) {
                throw new \RuntimeException('Invalid project data structure');
            }

            // Count total items for progress tracking
            $totalItems = count($xmlData['binder']['items'] ?? []) + 
                         count($xmlData['research']['items'] ?? []);
            $this->updateProgress('Preparing data...', 0, $totalItems);

            // Step 3: Transform the data
            Log::info('Transforming data...', ['import_id' => $this->import->id]);
            
            // Transform manuscript raw files
            $manuscriptRawFiles = $dataTransformer->transformManuscriptRawFiles($xmlData['project_files'] ?? []);
            
            // Transform items with their attachments
            $items = $dataTransformer->transformItems($xmlData);
            foreach ($items as &$item) {
                $item['user_id'] = $this->import->user_id;
                
                // Transform item attachments if they exist in the XML
                if (isset($xmlData['binder']['items'])) {
                    $itemAttachments = [];
                    foreach ($xmlData['binder']['items'] as $binderItem) {
                        if ($binderItem['UUID'] === $item['scrivener_uuid'] && !empty($binderItem['Content']['Files'])) {
                            $itemAttachments = $dataTransformer->transformItemAttachments($binderItem['Content']['Files'], $item['scrivener_uuid']);
                            break;
                        }
                    }
                    $item['attachments'] = $itemAttachments;
                }
            }
            unset($item);
            
            $transformedData = [
                'manuscript' => array_merge(
                    $dataTransformer->transformManuscript($xmlData),
                    ['user_id' => $this->import->user_id]
                ),
                'items' => $items,
                'collections' => $dataTransformer->transformCollections($xmlData),
                'writing_history' => array_map(function ($history) {
                    $history['user_id'] = $this->import->user_id;
                    return $history;
                }, $dataTransformer->transformWritingHistory($xmlData)),
                'manuscript_raw_files' => $manuscriptRawFiles,
            ];

            // Validate transformed data
            $this->updateProgress('Validating data...');
            if (!$databasePopulator->validate(
                $transformedData['manuscript'],
                $transformedData['items'],
                $transformedData['collections'],
                $transformedData['writing_history']
            )) {
                throw new \RuntimeException('Transformed data validation failed');
            }

            // Step 4: Populate the database
            $this->updateProgress('Importing data...', 0);
            Log::info('Importing data into database...', ['import_id' => $this->import->id]);
            
            // Update progress as items are processed
            $processedItems = 0;
            $result = $databasePopulator->populate(
                $transformedData['manuscript'],
                $transformedData['items'],
                $transformedData['collections'],
                $transformedData['writing_history'],
                $transformedData['manuscript_raw_files'],
                function() use (&$processedItems) {
                    $processedItems++;
                    $this->updateProgress('Importing items...', $processedItems);
                }
            );

            // Update import record with success
            $this->updateProgress('Finalizing...', $totalItems);
            $this->import->update([
                'status' => 'completed',
                'manuscript_id' => $result['manuscript']->id,
            ]);

            // Cleanup
            $this->updateProgress('Cleaning up...');
            Log::info('Cleaning up temporary files...', ['import_id' => $this->import->id]);
            $fileHandler->cleanup($extractedPath);
            Storage::delete($this->import->storage_path);

            Log::info('Import completed successfully', [
                'import_id' => $this->import->id,
                'manuscript_id' => $result['manuscript']->id,
                'items_count' => $result['items_count'],
                'collections_count' => $result['collections_count'],
                'writing_history_count' => $result['writing_history_count'],
                'raw_files_count' => $result['raw_files_count'],
            ]);

        } catch (\Exception $e) {
            Log::error('Scrivener import failed', [
                'import_id' => $this->import->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Create user-friendly error message
            $userFriendlyError = $this->createUserFriendlyErrorMessage($e);

            // Update import record with failure
            $this->import->update([
                'status' => 'failed',
                'error_message' => $userFriendlyError,
                'current_step' => 'Failed: ' . $userFriendlyError,
            ]);

            // Attempt cleanup
            if (isset($extractedPath)) {
                try {
                    $fileHandler->cleanup($extractedPath);
                } catch (\Exception $cleanupError) {
                    Log::error('Failed to cleanup after import error', [
                        'import_id' => $this->import->id,
                        'error' => $cleanupError->getMessage(),
                    ]);
                }
            }

            // Attempt rollback if we have a manuscript ID
            if (isset($result['manuscript'])) {
                try {
                    if ($databasePopulator->rollback($result['manuscript']->id)) {
                        Log::info('Rollback successful after import failure', [
                            'import_id' => $this->import->id,
                            'manuscript_id' => $result['manuscript']->id,
                        ]);
                    } else {
                        Log::error('Rollback failed after import failure', [
                            'import_id' => $this->import->id,
                            'manuscript_id' => $result['manuscript']->id,
                        ]);
                    }
                } catch (\Exception $rollbackError) {
                    Log::error('Error during rollback after import failure', [
                        'import_id' => $this->import->id,
                        'error' => $rollbackError->getMessage(),
                    ]);
                }
            }

            throw $e; // Re-throw to mark job as failed
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Scrivener import job failed', [
            'import_id' => $this->import->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);

        // Create a user-friendly error message
        $errorMessage = $this->createUserFriendlyErrorMessage($exception);

        // Ensure the import record is marked as failed
        $this->import->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    /**
     * Create a user-friendly error message from an exception
     */
    private function createUserFriendlyErrorMessage(\Throwable $exception): string
    {
        $message = $exception->getMessage();

        // Handle database-related errors with cleaner messages
        if (strpos($message, 'SQLSTATE') !== false) {
            if (strpos($message, 'String data, right truncated') !== false) {
                return 'Import failed: Some content in your Scrivener project is too large to import. Please try importing smaller sections or contact support.';
            } elseif (strpos($message, 'Duplicate entry') !== false) {
                return 'Import failed: Duplicate content detected. This project may have already been imported.';
            } elseif (strpos($message, 'foreign key constraint') !== false) {
                return 'Import failed: Database constraint error. Please try again or contact support.';
            } else {
                return 'Import failed: Database error occurred during import. Please try again.';
            }
        }

        // Handle file-related errors
        if (strpos($message, 'file_get_contents') !== false || strpos($message, 'fopen') !== false) {
            return 'Import failed: Unable to read the uploaded file. Please ensure the file is not corrupted and try again.';
        }

        // Handle memory or timeout errors
        if (strpos($message, 'memory') !== false || strpos($message, 'timeout') !== false) {
            return 'Import failed: The project is too large to process. Please try importing smaller sections.';
        }

        // Handle RTF conversion errors
        if (strpos($message, 'RTF') !== false || strpos($message, 'conversion') !== false) {
            return 'Import failed: Error converting document content. Some documents may have unsupported formatting.';
        }

        // For other errors, truncate the message if it's too long and make it user-friendly
        if (strlen($message) > 500) {
            $shortMessage = substr($message, 0, 500) . '...';
            return 'Import failed: ' . $shortMessage . ' Please contact support with this error.';
        }

        // Default fallback
        if (empty($message)) {
            return 'Import failed: An unexpected error occurred. Please try again.';
        }

        return 'Import failed: ' . $message;
    }
} 
 