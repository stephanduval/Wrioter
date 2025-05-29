<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Artisan;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Run migrations
        Artisan::call('migrate:fresh');
        
        // Create roles
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'client']);
        
        // Create an admin user
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        // Create a client user
        $this->client = User::factory()->create();
        $this->client->assignRole('client');
        
        // Create some test projects
        Project::factory()->count(15)->create([
            'client_id' => $this->client->id,
        ]);
    }

    /** @test */
    public function it_returns_all_projects_when_per_page_is_minus_one()
    {
        // Authenticate as admin
        Sanctum::actingAs($this->admin);

        // Make request with per_page = -1
        $response = $this->getJson('/api/projects?per_page=-1');

        // Assert response structure
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'total',
                'current_page',
                'per_page',
                'last_page',
                'from',
                'to',
            ]);

        // Get the response data
        $responseData = $response->json();
        
        // Assert that we got all projects
        $this->assertEquals(15, $responseData['total']);
        $this->assertEquals(15, count($responseData['data']));
        $this->assertEquals(15, $responseData['per_page']);
        $this->assertEquals(1, $responseData['current_page']);
        $this->assertEquals(1, $responseData['last_page']);
        $this->assertEquals(1, $responseData['from']);
        $this->assertEquals(15, $responseData['to']);
    }

    /** @test */
    public function it_returns_paginated_projects_when_per_page_is_valid_number()
    {
        // Authenticate as admin
        Sanctum::actingAs($this->admin);

        // Make request with per_page = 5
        $response = $this->getJson('/api/projects?per_page=5');

        // Assert response structure
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'total',
                'current_page',
                'per_page',
                'last_page',
                'from',
                'to',
            ]);

        // Get the response data
        $responseData = $response->json();
        
        // Assert pagination
        $this->assertEquals(15, $responseData['total']);
        $this->assertEquals(5, count($responseData['data']));
        $this->assertEquals(5, $responseData['per_page']);
        $this->assertEquals(1, $responseData['current_page']);
        $this->assertEquals(3, $responseData['last_page']);
        $this->assertEquals(1, $responseData['from']);
        $this->assertEquals(5, $responseData['to']);
    }

    /** @test */
    public function client_can_only_see_their_own_projects()
    {
        // Authenticate as client
        Sanctum::actingAs($this->client);

        // Make request with per_page = -1
        $response = $this->getJson('/api/projects?per_page=-1');

        // Assert response structure
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'total',
                'current_page',
                'per_page',
                'last_page',
                'from',
                'to',
            ]);

        // Get the response data
        $responseData = $response->json();
        
        // Assert that client only sees their projects
        $this->assertEquals(15, $responseData['total']);
        $this->assertEquals(15, count($responseData['data']));
        
        // Verify all projects belong to this client
        foreach ($responseData['data'] as $project) {
            $this->assertEquals($this->client->id, $project['client']['id']);
        }
    }
} 
