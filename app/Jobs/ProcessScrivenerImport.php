<?php

namespace App\Jobs;

use App\Models\ScrivenerImport;
use App\Services\ScrivenerImport\FileHandler;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;
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
        DatabasePopulator $databasePopulator
    ): void {
        try {
            // Update status to processing
            $this->import->update(['status' => 'processing']);
            $this->updateProgress('Starting import...');

            // Get the full path to the stored file
            $filePath = Storage::path($this->import->storage_path);

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
            $transformedData = [
                'manuscript' => array_merge(
                    $dataTransformer->transformManuscript($xmlData),
                    ['user_id' => $this->import->user_id]
                ),
                'items' => array_map(function ($item) {
                    $item['user_id'] = $this->import->user_id;
                    return $item;
                }, $dataTransformer->transformItems($xmlData)),
                'collections' => $dataTransformer->transformCollections($xmlData),
                'writing_history' => array_map(function ($history) {
                    $history['user_id'] = $this->import->user_id;
                    return $history;
                }, $dataTransformer->transformWritingHistory($xmlData)),
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
            ]);

        } catch (\Exception $e) {
            Log::error('Scrivener import failed', [
                'import_id' => $this->import->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Update import record with failure
            $this->import->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'current_step' => 'Failed: ' . $e->getMessage(),
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

        // Ensure the import record is marked as failed
        $this->import->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);
    }
} 
 