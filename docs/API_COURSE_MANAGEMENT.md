# Course Management API Reference

## Overview

The course management API provides endpoints for CRUD operations on courses. Authorization is handled entirely by RLS policies — API routes do not implement permission checks.

## Endpoints

### GET /api/courses/[id]

**Purpose:** Fetch a single course by ID (public or instructor-private)

**Authentication:** None required (RLS filters unpublished courses for non-owners)

**Request**
```
GET /api/courses/{courseId}
```

**Response (200 OK)**
```json
{
  "data": {
    "id": "uuid",
    "titulo": "string",
    "descripcion": "string",
    "precio": 0,
    "estado": "published|draft|archived",
    "instructor_id": "uuid",
    "category_id": "uuid|null",
    "embedding": [0.123, -0.456, ...], // vector(384)
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "categories": {
      "nombre": "string",
      "slug": "string"
    }
  }
}
```

**Error Responses**
- `400 Bad Request` — Invalid course ID format (not a valid UUID)
- `404 Not Found` — Course not found or not authorized to view (draft/private)

**Authorization Notes**
- Public: only `estado = 'published'` courses visible to anonymous/non-owner users
- Owner only: instructor can view their own draft/archived courses via RLS


### PATCH /api/courses/[id]

**Purpose:** Update course details (title, description, category, price, publish status)

**Authentication:** Required (must be logged in)

**Authorization:** RLS enforces owner-only (instructor who created the course)

**Request**
```
PATCH /api/courses/{courseId}
Content-Type: application/json

{
  "titulo": "string (optional, 3-255 chars)",
  "descripcion": "string (optional, min 10 chars)",
  "precio": "number (optional, 0-9999.99)",
  "category_id": "uuid (optional)",
  "estado": "draft|published|archived (optional)"
}
```

**Response (200 OK)**
```json
{
  "data": {
    "id": "uuid",
    "titulo": "string (updated)",
    "descripcion": "string (updated)",
    "precio": 0,
    "estado": "published",
    "instructor_id": "uuid",
    "category_id": "uuid|null",
    "embedding": [...], // regenerated if titulo/descripcion/category_id changed
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

**Error Responses**
- `400 Bad Request` — Invalid input (malformed UUID, validation failed, no fields to update)
- `401 Unauthorized` — Not logged in
- `403 Forbidden` — Not the course owner (RLS enforcement)
- `404 Not Found` — Course not found or not authorized

**Validation Rules**
- `titulo`: 3–255 characters
- `descripcion`: minimum 10 characters (optional; omit to skip update)
- `precio`: 0–9999.99
- `category_id`: must be valid UUID of existing category

**Side Effects**
- Triggers `courses_update_embedding` if titulo/descripcion/category_id changed
- Creates job in `embedding_jobs` table (async Edge Function regenerates embedding)
- Updates `updated_at` timestamp


### DELETE /api/courses/[id]

**Purpose:** Delete a course and all associated data (cascades to lessons, enrollments, reviews)

**Authentication:** Required (must be logged in)

**Authorization:** RLS enforces owner-only (instructor who created the course)

**Request**
```
DELETE /api/courses/{courseId}
```

**Response (204 No Content)**
```
(empty body)
```

**Error Responses**
- `401 Unauthorized` — Not logged in
- `403 Forbidden` — Not the course owner (RLS enforcement)
- `404 Not Found` — Course not found or not authorized

**Cascading Deletes**
- All lessons in the course
- All enrollments (student→course links)
- All reviews for the course
- Embedding job records

**Side Effects**
- Instructor loses ability to access/edit the course
- Students are unenrolled (no email notification sent currently)


### POST /api/courses/search

**Purpose:** Semantic search over published courses using embeddings (with text fallback)

**Authentication:** None required (public search)

**Request**
```
POST /api/courses/search
Content-Type: application/json

{
  "query": "string (required, non-empty)",
  "limit": 10 (optional, 1-50, default 10)
}
```

**Response (200 OK)**
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "string",
      "descripcion": "string",
      "precio": 0,
      "estado": "published",
      "instructor_id": "uuid",
      "similarity": 0.95
    }
  ],
  "count": 5,
  "search_type": "vector"
}
```

**Error Responses**
- `400 Bad Request` — Missing/empty query or invalid limit
- `500 Internal Server Error` — Edge Function or embedding generation failed

**Search Flow**
1. Calls Edge Function `generate-query-embedding` to embed the query string
2. If successful: calls RPC `search_courses_by_embedding()` (vector similarity search)
3. If embedding fails: falls back to text search (LIKE on titulo/descripcion)
4. Returns only `estado = 'published'` courses
5. Limits results to `limit` (min 1, max 50)

**Response Fields**
- `search_type`: `"vector"` (semantic) or `"text"` (fallback)
- `similarity`: cosine similarity score (0–1) when using vector search
- `count`: number of results returned

**Performance Notes**
- Vector search: O(n) with IVFFlat index on `courses.embedding`
- Text search: Uses PostgreSQL `ILIKE` (case-insensitive)
- Debouncing recommended on client (SearchCourses component does 500ms debounce)


## Common Patterns

### How to publish a course

```bash
curl -X PATCH http://localhost:3000/api/courses/{courseId} \
  -H "Content-Type: application/json" \
  -d '{"estado": "published"}'
```

After publish, the course becomes visible in public listings and search results. Embedding is generated automatically if not already present.

### How to update course details and republish embeddings

```bash
curl -X PATCH http://localhost:3000/api/courses/{courseId} \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "New Title",
    "descripcion": "New description...",
    "estado": "published"
  }'
```

Changing `titulo`, `descripcion`, or `category_id` triggers a new embedding job. The `estado` update does not re-trigger embedding.

### How to search courses

```bash
curl -X POST http://localhost:3000/api/courses/search \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning", "limit": 5}'
```

Returns up to 5 published courses ranked by semantic relevance.


## Authorization Model

All endpoints use **RLS (Row-Level Security) as the sole source of truth**. API code does not check permissions; Postgres enforces them.

### RLS Policies for courses table

- **SELECT**: Public users see `estado = 'published'`; instructors see all their own courses
- **INSERT**: Instructor only (enforced by RLS on instructor_id = auth.uid())
- **UPDATE**: Owner only (instructor_id = auth.uid() + estado field is published)
- **DELETE**: Owner only (instructor_id = auth.uid())

**Forbidden errors (403)** are returned when:
- User attempts to PATCH/DELETE a course they don't own
- RLS policy blocks the operation at the Postgres layer
- API translates `42501` (RLS deny) error code to 403


## Error Code Reference

| HTTP Status | Cause | Example |
|---|---|---|
| 400 | Input validation failed | Invalid UUID, missing required field, invalid price |
| 401 | Not authenticated | No session/token |
| 403 | Forbidden by RLS | Trying to edit another instructor's course |
| 404 | Course not found | Course ID doesn't exist |
| 409 | Unique constraint | Duplicate course (rare; not typical for this API) |
| 500 | Server error | Edge Function timeout, database failure |

## Implementation Notes

### PATCH endpoint behavior

- Only fields in the `allowed` list are updatable: `titulo`, `descripcion`, `category_id`, `precio`, `estado`
- Unknown fields in the request body are silently ignored
- Field validation happens before the database write
- If no fields are provided, returns 400 with "Sin campos para actualizar"
- Returns 403 if the update succeeds but no rows match (indicates RLS blocking)

### Embedding regeneration

When embedding regenerates (via PATCH with changed titulo/descripcion/category_id):
1. `handle_course_update()` trigger fires
2. Calls `queue_embedding_job()` which inserts a job in `embedding_jobs`
3. Edge Function `generate-embedding` is called asynchronously
4. Job status tracked in `embedding_jobs.status`
5. Embedding stored in `courses.embedding` when complete
6. Retry logic: up to 3 retries with exponential backoff if embedding service fails

**Important:** During embedding regeneration, the course is searchable by its old embedding. No downtime; search is always available.
