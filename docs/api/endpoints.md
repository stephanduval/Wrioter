# API Endpoints Reference

## Overview
Wrioter's API follows RESTful conventions and returns JSON responses. All endpoints require authentication unless specified otherwise.

## Base URL
- Development: `http://localhost:8000/api`
- Testing: `http://localhost:8000/api` (with test database)
- Production: `https://your-domain.com/api`

## Authentication
See [authentication.md](./authentication.md) for detailed auth documentation.

## Endpoints

### Manuscripts

#### List Manuscripts
```
GET /api/manuscripts
```
Returns paginated list of manuscripts for authenticated user.

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page (default: 10)
- `search` (string): Search in title/content
- `type` (string): Filter by type ('standard', 'scrivener')

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "My Novel",
      "manuscript_type": "standard",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 10,
    "per_page": 10
  }
}
```

#### Get Manuscript
```
GET /api/manuscripts/{id}
```
Returns single manuscript with items.

**Response:**
```json
{
  "data": {
    "id": 1,
    "title": "My Novel",
    "items": [
      {
        "id": 1,
        "title": "Chapter 1",
        "content": "...",
        "order_index": 0
      }
    ]
  }
}
```

#### Create Manuscript
```
POST /api/manuscripts
```

**Request Body:**
```json
{
  "title": "New Manuscript",
  "description": "Optional description",
  "manuscript_type": "standard"
}
```

#### Update Manuscript
```
PUT /api/manuscripts/{id}
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Manuscript
```
DELETE /api/manuscripts/{id}
```

### Items (Chapters/Sections)

#### List Items
```
GET /api/manuscripts/{manuscript_id}/items
```

#### Create Item
```
POST /api/manuscripts/{manuscript_id}/items
```

**Request Body:**
```json
{
  "title": "Chapter 1",
  "content": "Chapter content...",
  "parent_id": null,
  "order_index": 0
}
```

#### Update Item
```
PUT /api/items/{id}
```

#### Delete Item
```
DELETE /api/items/{id}
```

#### Reorder Items
```
POST /api/manuscripts/{manuscript_id}/items/reorder
```

**Request Body:**
```json
{
  "items": [
    {"id": 1, "order_index": 0},
    {"id": 2, "order_index": 1}
  ]
}
```

### Scrivener Import

#### Upload Scrivener File
```
POST /api/scrivener/import
```

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: 
  - `file`: .scrivx file (max 50MB)
  - `title` (optional): Override project title

**Response:**
```json
{
  "data": {
    "import_id": "uuid",
    "status": "queued",
    "manuscript_id": null
  }
}
```

#### Check Import Status
```
GET /api/scrivener/import/{import_id}/status
```

**Response:**
```json
{
  "data": {
    "import_id": "uuid",
    "status": "processing|completed|failed",
    "progress": 75,
    "manuscript_id": 123,
    "error": null
  }
}
```

#### List Import History
```
GET /api/scrivener/imports
```

### Messages

#### List Conversations
```
GET /api/messages
```

#### Send Message
```
POST /api/messages
```

**Request Body:**
```json
{
  "recipient_id": 2,
  "message": "Hello!",
  "attachments": []
}
```

#### Mark as Read
```
POST /api/messages/{id}/read
```

### Comments

#### List Comments
```
GET /api/items/{item_id}/comments
```

#### Add Comment
```
POST /api/items/{item_id}/comments
```

**Request Body:**
```json
{
  "content": "Great chapter!",
  "parent_id": null,
  "position": {"start": 100, "end": 150}
}
```

### Writing Statistics

#### Get Statistics
```
GET /api/manuscripts/{id}/statistics
```

**Response:**
```json
{
  "data": {
    "total_words": 50000,
    "total_characters": 250000,
    "chapters": 20,
    "daily_average": 500,
    "history": [
      {
        "date": "2024-01-01",
        "words_added": 1000,
        "words_total": 50000
      }
    ]
  }
}
```

### Export

#### Export Manuscript
```
POST /api/manuscripts/{id}/export
```

**Request Body:**
```json
{
  "format": "docx|pdf|txt|md",
  "include_metadata": true,
  "include_comments": false
}
```

**Response:**
```json
{
  "data": {
    "download_url": "/api/exports/download/{token}",
    "expires_at": "2024-01-01T00:00:00Z"
  }
}
```

### User Profile

#### Get Profile
```
GET /api/user
```

#### Update Profile
```
PUT /api/user
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "new@email.com",
  "preferences": {
    "theme": "dark",
    "editor_font_size": 16
  }
}
```

### Search

#### Global Search
```
GET /api/search
```

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Filter by type (manuscripts|items|comments)
- `limit` (integer): Max results per type

**Response:**
```json
{
  "data": {
    "manuscripts": [...],
    "items": [...],
    "comments": [...]
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### Common Status Codes
- `200 OK`: Success
- `201 Created`: Resource created
- `204 No Content`: Success with no response body
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

- Default: 60 requests per minute
- Upload endpoints: 10 requests per minute
- Export endpoints: 5 requests per minute

Headers included in response:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Pagination

Paginated responses include meta information:

```json
{
  "data": [...],
  "links": {
    "first": "...",
    "last": "...",
    "prev": "...",
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 10,
    "per_page": 15,
    "to": 15,
    "total": 150
  }
}
```