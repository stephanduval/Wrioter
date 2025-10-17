<?php

namespace App\Console\Commands;

use App\Services\ScrivenerImport\FileHandler;
use App\Services\ScrivenerImport\XmlParser;
use App\Services\ScrivenerImport\DataTransformer;
use App\Services\ScrivenerImport\DatabasePopulator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Helper\ProgressBar;

class ScrivenerImportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scrivener:import 
        {file : Path to the .zip file containing the Scrivener project}
        {--validate-only : Only validate the file}
        {--keep-extracted : Keep extracted files for debugging}
        {--title= : Custom manuscript title}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import a Scrivener project from a .zip file into Wrioter';

    private FileHandler $fileHandler;
    private XmlParser $xmlParser;
    private DataTransformer $dataTransformer;
    private DatabasePopulator $databasePopulator;
    private ?ProgressBar $progressBar = null;

    public function __construct(
        FileHandler $fileHandler,
        XmlParser $xmlParser,
        DataTransformer $dataTransformer,
        DatabasePopulator $databasePopulator
    ) {
        parent::__construct();
        $this->fileHandler = $fileHandler;
        $this->xmlParser = $xmlParser;
        $this->dataTransformer = $dataTransformer;
        $this->databasePopulator = $databasePopulator;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $this->validateInput();
            $this->info('Starting Scrivener import process...');

            // Step 1: Extract and validate the .scrivx file
            $this->info('Extracting Scrivener project file...');
            $extractedPath = $this->fileHandler->extract($this->argument('file'));
            
            if (!$this->fileHandler->validate($extractedPath)) {
                throw new \RuntimeException('Invalid Scrivener project file structure');
            }

            if ($this->option('validate-only')) {
                $this->info('Validation successful. Exiting as requested.');
                return 0;
            }

            // Step 2: Parse the XML
            $this->info('Parsing project data...');
            $xmlData = $this->xmlParser->parse($extractedPath . '/project.scrivx');
            
            if (!$this->xmlParser->validate($xmlData)) {
                throw new \RuntimeException('Invalid project data structure');
            }

            // Step 3: Transform the data
            $this->info('Transforming data...');
            $transformedData = [
                'manuscript' => $this->dataTransformer->transformManuscript($xmlData),
                'items' => $this->dataTransformer->transformItems($xmlData),
                'collections' => $this->dataTransformer->transformCollections($xmlData),
                'writing_history' => $this->dataTransformer->transformWritingHistory($xmlData),
            ];

            // Validate transformed data
            if (!$this->databasePopulator->validate(
                $transformedData['manuscript'],
                $transformedData['items'],
                $transformedData['collections'],
                $transformedData['writing_history']
            )) {
                throw new \RuntimeException('Transformed data validation failed');
            }

            // Step 4: Populate the database
            $this->info('Importing data into database...');
            $this->setupProgressBar(count($transformedData['items']));
            
            $result = $this->databasePopulator->populate(
                $transformedData['manuscript'],
                $transformedData['items'],
                $transformedData['collections'],
                $transformedData['writing_history']
            );

            $this->finishProgressBar();

            // Step 5: Cleanup
            if (!$this->option('keep-extracted')) {
                $this->info('Cleaning up temporary files...');
                $this->fileHandler->cleanup($extractedPath);
            }

            $this->info('Import completed successfully!');
            $this->info(sprintf(
                'Created manuscript "%s" with %d items, %d collections, and %d writing history records.',
                $result['manuscript']->title,
                $result['items_count'],
                $result['collections_count'],
                $result['writing_history_count']
            ));

            return 0;

        } catch (\Exception $e) {
            $this->error('Import failed: ' . $e->getMessage());
            Log::error('Scrivener import failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $this->argument('file'),
                'user_id' => 1, // Hardcoded user ID
            ]);

            // Attempt rollback if we have a manuscript ID
            if (isset($result['manuscript'])) {
                $this->info('Attempting to rollback import...');
                if ($this->databasePopulator->rollback($result['manuscript']->id)) {
                    $this->info('Rollback successful.');
                } else {
                    $this->error('Rollback failed. Manual cleanup may be required.');
                }
            }

            return 1;
        }
    }

    private function validateInput(): void
    {
        $file = $this->argument('file');
        if (!file_exists($file)) {
            throw new \InvalidArgumentException("File not found: {$file}");
        }

        if (!str_ends_with(strtolower($file), '.zip')) {
            throw new \InvalidArgumentException('File must be a .zip file containing a Scrivener project');
        }

        // Verify it's a valid ZIP file
        $zip = new \ZipArchive();
        if ($zip->open($file) !== true) {
            throw new \InvalidArgumentException('Invalid or corrupted ZIP file');
        }
        $zip->close();

        // Hardcoded user ID for info@freynet-gagne.com
        $userId = 1;

        // Verify user exists
        if (!\App\Models\User::find($userId)) {
            throw new \InvalidArgumentException("User not found: {$userId}");
        }
    }

    private function setupProgressBar(int $total): void
    {
        $this->progressBar = $this->output->createProgressBar($total);
        $this->progressBar->setFormat(' %current%/%max% [%bar%] %percent:3s%% %elapsed:6s%/%estimated:-6s% %memory:6s%');
        $this->progressBar->start();
    }

    private function updateProgress(): void
    {
        if ($this->progressBar) {
            $this->progressBar->advance();
        }
    }

    private function finishProgressBar(): void
    {
        if ($this->progressBar) {
            $this->progressBar->finish();
            $this->newLine();
        }
    }
} 
