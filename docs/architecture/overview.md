# Wrioter Architecture Overview

## System Architecture

Wrioter follows a modern web application architecture with clear separation between frontend and backend components.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vue.js SPA    │────▶│  Laravel API    │────▶│   MySQL DB      │
│   (Frontend)    │     │   (Backend)     │     │   (Storage)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                        │
         │                       │                        │
    ┌────▼────┐            ┌────▼────┐            ┌─────▼─────┐
    │  Vite   │            │  Queue  │            │   Redis   │
    │ (Build) │            │ Worker  │            │  (Cache)  │
    └─────────┘            └─────────┘            └───────────┘
```

## Core Components

### Frontend (Vue.js 3)
- **Framework**: Vue 3 with Composition API
- **TypeScript**: Full type safety
- **Build Tool**: Vite for fast development
- **UI Framework**: Sneat Admin Template
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios with custom composables
- **Authorization**: CASL for permissions

### Backend (Laravel 11)
- **Framework**: Laravel 11.13.0
- **PHP Version**: 8.3.11
- **API**: RESTful JSON API
- **Authentication**: Laravel Sanctum
- **Queue System**: Database driver with Redis option
- **Cache**: Database driver with Redis option
- **File Storage**: Local with S3 option
- **Mail**: Mailgun driver

### Database (MySQL)
- **Version**: MySQL 8.0+
- **Schema Design**: Unified approach for manuscripts
- **Migrations**: Version-controlled schema changes
- **Seeders**: Test data generation

## Key Design Principles

### 1. Separation of Concerns
- Frontend handles presentation and user interaction
- Backend manages business logic and data persistence
- Clear API contracts between layers

### 2. Scalability
- Stateless API design
- Queue-based processing for heavy operations
- Horizontal scaling capability
- Cache-first approach for read operations

### 3. Security
- Token-based authentication (Sanctum)
- CASL-based authorization
- CSRF protection for web requests
- Input validation at multiple layers
- SQL injection prevention via Eloquent ORM

### 4. Maintainability
- Modular service architecture
- Repository pattern for data access
- Clear naming conventions
- Comprehensive documentation
- Automated testing

## Request Flow

1. **User Action** → Vue component
2. **API Call** → Axios with auth headers
3. **Route Matching** → Laravel router
4. **Middleware** → Auth, throttle, CORS
5. **Controller** → Request validation
6. **Service Layer** → Business logic
7. **Repository** → Database operations
8. **Response** → JSON transformation
9. **Frontend Update** → Reactive UI update

## Technology Stack

### Development Tools
- **Version Control**: Git
- **Package Managers**: Yarn (frontend), Composer (backend)
- **Code Quality**: ESLint, PHP CS Fixer
- **Testing**: Vitest (frontend), PHPUnit (backend)

### Infrastructure
- **Web Server**: Apache/Nginx
- **Process Manager**: Systemd/Supervisor
- **Deployment**: SSH-based with scripts
- **Monitoring**: Laravel Telescope (dev)

### Third-Party Services
- **Email**: Mailgun
- **File Conversion**: pandoc (RTF → Markdown)
- **Authentication**: OAuth providers (Google, GitHub)

## Data Flow Patterns

### Synchronous Operations
- User authentication
- CRUD operations
- Real-time messaging
- Quick searches

### Asynchronous Operations
- File imports (Scrivener)
- Export generation
- Email notifications
- Heavy data processing

## Caching Strategy

### Cache Layers
1. **Browser Cache**: Static assets
2. **CDN Cache**: Public resources
3. **Application Cache**: Database queries
4. **Session Cache**: User sessions

### Cache Keys
- Manuscripts: `manuscript:{id}`
- User permissions: `user:{id}:permissions`
- Search results: `search:{query}:{filters}`

## Security Architecture

### Authentication Flow
1. User credentials → API
2. Validate → Generate token
3. Store token → Frontend
4. Include token → All requests
5. Validate token → Each request

### Authorization Layers
1. **Route Level**: Middleware protection
2. **Controller Level**: Policy checks
3. **Model Level**: Scopes and guards
4. **Frontend Level**: CASL rules

## Performance Optimizations

### Frontend
- Code splitting by route
- Lazy loading components
- Image optimization
- Bundle size monitoring

### Backend
- Query optimization with eager loading
- Database indexing strategy
- Response caching
- Queue prioritization

### Database
- Optimized indexes
- Query result caching
- Connection pooling
- Read replicas (future)

## Monitoring & Logging

### Application Logs
- Location: `storage/logs/`
- Channels: single, daily, slack
- Levels: debug, info, warning, error

### Performance Monitoring
- Laravel Telescope (development)
- Query profiling
- Queue monitoring
- Memory usage tracking

## Deployment Architecture

### Environments
- **Development**: Local machine
- **Testing**: Isolated test database
- **Staging**: Pre-production testing
- **Production**: Live environment

### Deployment Process
1. Code push to repository
2. SSH to production server
3. Pull latest changes
4. Run migrations
5. Clear caches
6. Restart queue workers

## Future Considerations

### Planned Improvements
- Microservices for file processing
- WebSocket for real-time features
- GraphQL API option
- Kubernetes deployment

### Scalability Path
1. Separate read/write databases
2. Redis for all caching
3. CDN for static assets
4. Load balancing
5. Container orchestration