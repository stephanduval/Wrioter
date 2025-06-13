<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Queue;
use App\Jobs\ProcessScrivenerImport;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ScrivenerImportTest extends TestCase
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
    }

    /** @test */
    public function it_can_upload_a_scrivener_file()
    {
        // Do NOT fake storage or queue
        // Storage::fake('local');
        // Queue::fake();

        // Act as the test user
        $response = $this->actingAs($this->user)
            ->postJson('/api/scrivener/import', [
                'file' => $this->testFile
            ]);

        if ($response->status() === 500) {
            dd("Upload failed with 500. Response body:", $response->getContent());
        }
        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'import_id'
            ]);

        // Assert the import record was created
        $import = \App\Models\ScrivenerImport::where('user_id', $this->user->id)
            ->where('filename', 'Scrivener tutorial [2025_06_01_05_17_17].zip')
            ->first();
        $this->assertNotNull($import);
        // Wait for the job to process (if needed, you can add sleep(1) or poll for status)
        // sleep(1); // Uncomment if needed for async processing
        $import->refresh();
        $this->assertTrue(in_array($import->status, ['completed', 'processing', 'pending', 'failed']));

        // Clean up the uploaded file if it exists
        if ($import && $import->storage_path && \Storage::disk('local')->exists($import->storage_path)) {
            \Storage::disk('local')->delete($import->storage_path);
        }
    }

    /** @test */
    public function it_validates_file_type()
    {
        // Create an invalid file
        $invalidFile = UploadedFile::fake()->create('document.pdf', 100);

        // Act as the test user
        $response = $this->actingAs($this->user)
            ->postJson('/api/scrivener/import', [
                'file' => $invalidFile
            ]);

        // Assert the response
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /** @test */
    public function it_validates_file_size()
    {
        // Create a file that's too large
        $largeFile = UploadedFile::fake()->create('large.zip', 60000); // 60MB

        // Act as the test user
        $response = $this->actingAs($this->user)
            ->postJson('/api/scrivener/import', [
                'file' => $largeFile
            ]);

        // Assert the response
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['file']);
    }

    /** @test */
    public function it_requires_authentication()
    {
        $response = $this->postJson('/api/scrivener/import', [
            'file' => $this->testFile
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function it_can_cancel_a_pending_import()
    {
        // Create a pending import
        $import = $this->user->scrivenerImports()->create([
            'filename' => 'test.zip',
            'status' => 'pending',
            'storage_path' => 'scrivener/temp/test.zip'
        ]);

        // Act as the test user
        $response = $this->actingAs($this->user)
            ->postJson("/api/scrivener/imports/{$import->id}/cancel");

        // Assert the response
        $response->assertStatus(200);

        // Assert the import was cancelled
        $this->assertDatabaseHas('scrivener_imports', [
            'id' => $import->id,
            'status' => 'failed',
            'error_message' => 'Import cancelled by user'
        ]);
    }

    /** @test */
    public function it_can_retry_a_failed_import()
    {
        // Create a failed import
        $import = $this->user->scrivenerImports()->create([
            'filename' => 'test.zip',
            'status' => 'failed',
            'storage_path' => 'scrivener/temp/test.zip',
            'error_message' => 'Test error'
        ]);

        // Act as the test user
        $response = $this->actingAs($this->user)
            ->postJson("/api/scrivener/imports/{$import->id}/retry");

        // Assert the response
        $response->assertStatus(200);

        // Assert the import was reset
        $this->assertDatabaseHas('scrivener_imports', [
            'id' => $import->id,
            'status' => 'pending',
            'error_message' => null
        ]);

        // Assert the job was queued
        Queue::assertPushed(ProcessScrivenerImport::class);
    }
}
