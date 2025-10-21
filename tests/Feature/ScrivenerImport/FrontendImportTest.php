<?php

namespace Tests\Feature\ScrivenerImport;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;
use App\Jobs\ProcessScrivenerImport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Bus;
use PHPUnit\Framework\Attributes\Test;

class FrontendImportTest extends TestCase
{
    use RefreshDatabase;

    protected $testFile;
    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a test user
        $this->user = User::factory()->create();
        
        // Get the test file path
        $testFilePath = base_path('tests/Fixtures/Scrivener tutorial [2025_06_01_05_17_17].zip');
        
        // Create an UploadedFile instance from the real file
        $this->testFile = new UploadedFile(
            $testFilePath,
            'Scrivener tutorial [2025_06_01_05_17_17].zip',
            'application/zip',
            null,
            true // test mode
        );

        // Fake the queue to prevent actual job processing
        Bus::fake();
    }

    #[Test]
    public function it_can_access_the_import_page()
    {
        $response = $this->actingAs($this->user)
            ->get('/scrivener-import');

        $response->assertStatus(200)
            ->assertSee('<div id="app">', false);
    }

    #[Test]
    public function it_shows_upload_progress_during_file_upload()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/scrivener/import', [
                'file' => $this->testFile
            ], [
                'X-CSRF-TOKEN' => csrf_token(),
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest'
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'import_id'
            ]);

        // Verify the import record was created
        $import = \App\Models\ScrivenerImport::where('user_id', $this->user->id)
            ->where('filename', 'Scrivener tutorial [2025_06_01_05_17_17].zip')
            ->first();
        
        $this->assertNotNull($import);
        $this->assertEquals('pending', $import->status);

        // Verify the job was dispatched
        Bus::assertDispatched(ProcessScrivenerImport::class);
    }

    #[Test]
    public function it_shows_processing_status_after_upload()
    {
        // Create a pending import
        $import = $this->user->scrivenerImports()->create([
            'filename' => 'test.zip',
            'status' => 'processing',
            'storage_path' => 'scrivener/temp/test.zip',
            'current_step' => 'Processing items...',
            'progress' => 50
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/scrivener/imports');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $import->id,
                'status' => 'processing',
                'current_step' => 'Processing items...',
                'progress' => 50
            ]);
    }

    #[Test]
    public function it_shows_error_message_for_invalid_file()
    {
        $invalidFile = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->actingAs($this->user)
            ->postJson('/api/scrivener/import', [
                'file' => $invalidFile
            ], [
                'X-CSRF-TOKEN' => csrf_token(),
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest'
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    #[Test]
    public function it_shows_completed_status_with_manuscript_link()
    {
        // Create a manuscript first
        $manuscript = \App\Models\Manuscript::factory()->create([
            'user_id' => $this->user->id
        ]);

        // Create a completed import with manuscript
        $import = $this->user->scrivenerImports()->create([
            'filename' => 'test.zip',
            'status' => 'completed',
            'storage_path' => 'scrivener/temp/test.zip',
            'manuscript_id' => $manuscript->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/scrivener/imports');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $import->id,
                'status' => 'completed',
                'manuscript_id' => $manuscript->id
            ]);
    }

    #[Test]
    public function it_shows_failed_status_with_error_message()
    {
        // Create a failed import
        $import = $this->user->scrivenerImports()->create([
            'filename' => 'test.zip',
            'status' => 'failed',
            'storage_path' => 'scrivener/temp/test.zip',
            'error_message' => 'Test error message'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/scrivener/imports');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $import->id,
                'status' => 'failed',
                'error_message' => 'Test error message'
            ]);
    }

    #[Test]
    public function it_updates_status_in_real_time()
    {
        // Create a pending import
        $import = $this->user->scrivenerImports()->create([
            'filename' => 'test.zip',
            'status' => 'pending',
            'storage_path' => 'scrivener/temp/test.zip'
        ]);

        // First request
        $response1 = $this->actingAs($this->user)
            ->getJson('/api/scrivener/imports');

        $response1->assertStatus(200)
            ->assertJsonFragment([
                'id' => $import->id,
                'status' => 'pending'
            ]);

        // Update the import status
        $import->update([
            'status' => 'processing',
            'current_step' => 'Processing items...',
            'progress' => 50
        ]);

        // Second request
        $response2 = $this->actingAs($this->user)
            ->getJson('/api/scrivener/imports');

        $response2->assertStatus(200)
            ->assertJsonFragment([
                'id' => $import->id,
                'status' => 'processing',
                'current_step' => 'Processing items...',
                'progress' => 50
            ]);
    }

    #[Test]
    public function it_validates_file_size_limit()
    {
        // Create a file that exceeds the 50MB limit
        $largeFile = UploadedFile::fake()->create('large.zip', 51 * 1024 * 1024);

        $response = $this->actingAs($this->user)
            ->postJson('/api/scrivener/import', [
                'file' => $largeFile
            ], [
                'X-CSRF-TOKEN' => csrf_token(),
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest'
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    #[Test]
    public function it_can_cancel_pending_import()
    {
        // Create a pending import
        $import = $this->user->scrivenerImports()->create([
            'filename' => 'test.zip',
            'status' => 'pending',
            'storage_path' => 'scrivener/temp/test.zip'
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/scrivener/imports/{$import->id}/cancel", [], [
                'X-CSRF-TOKEN' => csrf_token(),
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest'
            ]);

        $response->assertStatus(200);

        // Verify the import was cancelled (status should be 'failed' with error message)
        $this->assertDatabaseHas('scrivener_imports', [
            'id' => $import->id,
            'status' => 'failed',
            'error_message' => 'Import cancelled by user'
        ]);
    }

    #[Test]
    public function it_can_retry_failed_import()
    {
        // Create a failed import
        $import = $this->user->scrivenerImports()->create([
            'filename' => 'test.zip',
            'status' => 'failed',
            'storage_path' => 'scrivener/temp/test.zip',
            'error_message' => 'Test error message'
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/scrivener/imports/{$import->id}/retry", [], [
                'X-CSRF-TOKEN' => csrf_token(),
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest'
            ]);

        $response->assertStatus(200);

        // Verify the import was reset to pending
        $this->assertDatabaseHas('scrivener_imports', [
            'id' => $import->id,
            'status' => 'pending',
            'error_message' => null
        ]);

        // Verify the job was dispatched
        Bus::assertDispatched(ProcessScrivenerImport::class);
    }

    #[Test]
    public function it_handles_concurrent_imports_correctly()
    {
        // Create a manuscript first
        $manuscript = \App\Models\Manuscript::factory()->create([
            'user_id' => $this->user->id
        ]);

        // Create multiple imports with different statuses
        $pendingImport = $this->user->scrivenerImports()->create([
            'filename' => 'pending.zip',
            'status' => 'pending',
            'storage_path' => 'scrivener/temp/pending.zip'
        ]);

        $processingImport = $this->user->scrivenerImports()->create([
            'filename' => 'processing.zip',
            'status' => 'processing',
            'storage_path' => 'scrivener/temp/processing.zip',
            'current_step' => 'Processing items...',
            'progress' => 50
        ]);

        $completedImport = $this->user->scrivenerImports()->create([
            'filename' => 'completed.zip',
            'status' => 'completed',
            'storage_path' => 'scrivener/temp/completed.zip',
            'manuscript_id' => $manuscript->id
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/scrivener/imports');

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonFragment([
                'id' => $pendingImport->id,
                'status' => 'pending'
            ])
            ->assertJsonFragment([
                'id' => $processingImport->id,
                'status' => 'processing',
                'current_step' => 'Processing items...',
                'progress' => 50
            ])
            ->assertJsonFragment([
                'id' => $completedImport->id,
                'status' => 'completed',
                'manuscript_id' => $manuscript->id
            ]);
    }
} 
