# Backend Architecture

## Overview
The Wrioter backend is built on Laravel 11, providing a robust RESTful API with comprehensive features for manuscript management, user authentication, and content processing.

## Technology Stack

### Core Technologies
- **Laravel 11.13.0**: PHP framework
- **PHP 8.3.11**: Programming language
- **Composer 2.7.7**: Dependency management
- **MySQL 8.0+**: Primary database
- **Redis**: Cache and queue (optional)

### Key Laravel Features Used
- Eloquent ORM
- Sanctum Authentication
- Queue System
- Event Broadcasting
- Service Providers
- Middleware
- Policies & Gates

## Directory Structure

```
app/
├── Console/
│   ├── Commands/           # Artisan commands
│   └── Kernel.php         # Command scheduling
├── Events/                # Application events
├── Exceptions/            # Exception handlers
├── Http/
│   ├── Controllers/       # API controllers
│   ├── Middleware/        # HTTP middleware
│   ├── Requests/          # Form requests
│   └── Resources/         # API resources
├── Jobs/                  # Queue jobs
├── Listeners/             # Event listeners
├── Models/                # Eloquent models
├── Policies/              # Authorization policies
├── Providers/             # Service providers
├── Repositories/          # Data repositories
└── Services/              # Business logic
    └── ScrivenerImport/   # Scrivener module
```

## Service Architecture

### Service Layer Pattern
```php
// app/Services/ManuscriptService.php
class ManuscriptService
{
    public function __construct(
        private ManuscriptRepository $repository,
        private ItemService $itemService
    ) {}
    
    public function create(array $data): Manuscript
    {
        DB::beginTransaction();
        try {
            $manuscript = $this->repository->create($data);
            $this->itemService->createDefaultStructure($manuscript);
            
            DB::commit();
            return $manuscript;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
```

### Repository Pattern
```php
// app/Repositories/ManuscriptRepository.php
class ManuscriptRepository
{
    public function findByUser(int $userId): Collection
    {
        return Manuscript::where('user_id', $userId)
            ->with(['items', 'collections'])
            ->orderBy('updated_at', 'desc')
            ->get();
    }
    
    public function create(array $data): Manuscript
    {
        return Manuscript::create($data);
    }
}
```

## API Design

### RESTful Routes
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('manuscripts', ManuscriptController::class);
    Route::apiResource('manuscripts.items', ItemController::class)
        ->shallow();
    Route::post('manuscripts/{manuscript}/items/reorder', 
        [ItemController::class, 'reorder']);
});
```

### Controller Structure
```php
// app/Http/Controllers/ManuscriptController.php
class ManuscriptController extends Controller
{
    public function __construct(
        private ManuscriptService $service
    ) {}
    
    public function index(Request $request): JsonResponse
    {
        $manuscripts = $this->service->getUserManuscripts(
            $request->user()->id,
            $request->query()
        );
        
        return ManuscriptResource::collection($manuscripts);
    }
    
    public function store(StoreManuscriptRequest $request): JsonResponse
    {
        $manuscript = $this->service->create(
            $request->validated()
        );
        
        return new ManuscriptResource($manuscript);
    }
}
```

### API Resources
```php
// app/Http/Resources/ManuscriptResource.php
class ManuscriptResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->manuscript_type,
            'items' => ItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
```

## Authentication & Authorization

### Sanctum Setup
```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS')),
'expiration' => 525600, // 1 year
```

### Policies
```php
// app/Policies/ManuscriptPolicy.php
class ManuscriptPolicy
{
    public function view(User $user, Manuscript $manuscript): bool
    {
        return $user->id === $manuscript->user_id;
    }
    
    public function update(User $user, Manuscript $manuscript): bool
    {
        return $user->id === $manuscript->user_id;
    }
}
```

### Gates & Permissions
```php
// app/Providers/AuthServiceProvider.php
Gate::define('admin', function (User $user) {
    return $user->hasRole('admin');
});

Gate::define('manage-manuscripts', function (User $user) {
    return $user->hasPermission('manuscripts.manage');
});
```

## Database Design

### Eloquent Models
```php
// app/Models/Manuscript.php
class Manuscript extends Model
{
    use HasFactory, SoftDeletes;
    
    protected $fillable = [
        'title',
        'description',
        'user_id',
        'manuscript_type',
        'scrivener_uuid',
        'scrivener_metadata',
    ];
    
    protected $casts = [
        'scrivener_metadata' => 'json',
        'scrivener_created_date' => 'datetime',
        'scrivener_modified_date' => 'datetime',
    ];
    
    public function items(): HasMany
    {
        return $this->hasMany(Item::class)
            ->orderBy('order_index');
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

### Query Optimization
```php
// Eager loading relationships
$manuscripts = Manuscript::with([
    'items' => function ($query) {
        $query->where('parent_id', null);
    },
    'items.children',
    'collections',
])->get();

// Query scopes
public function scopeOfType($query, string $type)
{
    return $query->where('manuscript_type', $type);
}
```

## Queue System

### Job Implementation
```php
// app/Jobs/ProcessScrivenerImport.php
class ProcessScrivenerImport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;
    
    public function __construct(
        public string $filePath,
        public int $userId,
        public string $importId
    ) {}
    
    public function handle(ScrivenerImportService $service): void
    {
        try {
            $service->import($this->filePath, $this->userId);
            
            ImportStatus::where('id', $this->importId)
                ->update(['status' => 'completed']);
        } catch (\Exception $e) {
            $this->fail($e);
        }
    }
    
    public function failed(\Throwable $exception): void
    {
        ImportStatus::where('id', $this->importId)
            ->update([
                'status' => 'failed',
                'error' => $exception->getMessage()
            ]);
    }
}
```

### Queue Configuration
```php
// config/queue.php
'connections' => [
    'database' => [
        'driver' => 'database',
        'table' => 'jobs',
        'queue' => 'default',
        'retry_after' => 90,
    ],
]
```

## Event System

### Event Definition
```php
// app/Events/ManuscriptCreated.php
class ManuscriptCreated
{
    use Dispatchable, SerializesModels;
    
    public function __construct(
        public Manuscript $manuscript
    ) {}
}
```

### Event Listeners
```php
// app/Listeners/SendManuscriptNotification.php
class SendManuscriptNotification
{
    public function handle(ManuscriptCreated $event): void
    {
        $event->manuscript->user->notify(
            new ManuscriptCreatedNotification($event->manuscript)
        );
    }
}
```

## Middleware

### Custom Middleware
```php
// app/Http/Middleware/CheckManuscriptLimit.php
class CheckManuscriptLimit
{
    public function handle($request, Closure $next)
    {
        $user = $request->user();
        $limit = $user->subscription?->manuscript_limit ?? 5;
        
        if ($user->manuscripts()->count() >= $limit) {
            return response()->json([
                'message' => 'Manuscript limit reached'
            ], 403);
        }
        
        return $next($request);
    }
}
```

## Error Handling

### Exception Handler
```php
// app/Exceptions/Handler.php
public function render($request, Throwable $exception)
{
    if ($request->wantsJson()) {
        if ($exception instanceof ValidationException) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $exception->errors()
            ], 422);
        }
        
        if ($exception instanceof ModelNotFoundException) {
            return response()->json([
                'message' => 'Resource not found'
            ], 404);
        }
    }
    
    return parent::render($request, $exception);
}
```

## Testing

### Feature Tests
```php
// tests/Feature/ManuscriptTest.php
class ManuscriptTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_user_can_create_manuscript()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
            ->postJson('/api/manuscripts', [
                'title' => 'Test Novel',
                'description' => 'A test description'
            ]);
            
        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'title', 'description']
            ]);
            
        $this->assertDatabaseHas('manuscripts', [
            'title' => 'Test Novel',
            'user_id' => $user->id
        ]);
    }
}
```

### Unit Tests
```php
// tests/Unit/ManuscriptServiceTest.php
class ManuscriptServiceTest extends TestCase
{
    public function test_create_manuscript_with_items()
    {
        $service = new ManuscriptService(
            new ManuscriptRepository(),
            new ItemService()
        );
        
        $manuscript = $service->create([
            'title' => 'Test',
            'user_id' => 1
        ]);
        
        $this->assertInstanceOf(Manuscript::class, $manuscript);
        $this->assertCount(1, $manuscript->items);
    }
}
```

## Performance Optimization

### Database Optimization
- Proper indexing on foreign keys
- Composite indexes for common queries
- Database query logging in development
- N+1 query prevention with eager loading

### Caching Strategy
```php
// Cache frequently accessed data
$manuscripts = Cache::remember("user.{$userId}.manuscripts", 3600, 
    function () use ($userId) {
        return Manuscript::where('user_id', $userId)->get();
    }
);

// Clear cache on updates
Cache::forget("user.{$userId}.manuscripts");
```

### Response Optimization
- API resource collections for efficient serialization
- Pagination for large datasets
- Selective field loading
- Compressed responses

## Security Measures

### Input Validation
- Form Request classes for all input
- Sanitization of user input
- File upload validation
- SQL injection prevention via Eloquent

### Authentication Security
- Token expiration
- Rate limiting on auth endpoints
- Password hashing with bcrypt
- Two-factor authentication support

### Authorization Checks
- Policy-based authorization
- Middleware protection
- Resource-level permissions
- Admin role separation