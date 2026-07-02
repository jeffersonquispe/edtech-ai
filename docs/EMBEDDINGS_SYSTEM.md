# Vector Embeddings & Semantic Search System

## Overview

The embedding system provides semantic search capabilities over course content. Courses are automatically embedded when created/updated, and users can search semantically via the `/api/courses/search` endpoint.

**Key characteristics:**
- Embeddings are **384-dimensional vectors** using the `gte-small` model (free tier on Supabase.ai)
- Generation is **asynchronous** (triggered by database triggers, executed via Edge Functions)
- Search supports both **vector similarity** and **text fallback** (LIKE)
- Only **published courses** are searchable
- Embedding regeneration does not block the UI

## Architecture

### Data Flow: Course Creation → Embedding → Search

```
1. User creates/updates course
   ↓
2. Database trigger fires (INSERT or UPDATE on courses)
   ↓
3. queue_embedding_job() inserts row in embedding_jobs table
   ↓
4. net.http_post() calls Edge Function generate-embedding
   ↓
5. Edge Function calls Supabase.ai (gte-small model)
   ↓
6. Embedding saved to courses.embedding
   ↓
7. Job marked as completed (or failed + retried)
```

### Search Flow: Query → Embedding → Similarity Search

```
1. POST /api/courses/search with query text
   ↓
2. Call Edge Function generate-query-embedding
   ↓
3. Supabase.ai embeds the query (same gte-small model)
   ↓
4. Call RPC search_courses_by_embedding(query_embedding)
   ↓
5. Postgres computes cosine similarity (1 - <=> operator)
   ↓
6. Return top-k results ordered by similarity
   ↓
   If embedding fails → fallback to text search (LIKE)
```

## Database Schema

### courses table (new/modified columns)

```sql
CREATE TABLE public.courses (
  id uuid PRIMARY KEY,
  -- ... existing columns ...
  embedding vector(384),  -- 384-dim vector from gte-small model
  -- ... existing columns ...
);

CREATE INDEX ON public.courses USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);  -- IVFFlat index for fast similarity search
```

**Key fields:**
- `embedding`: Can be NULL (for courses not yet embedded or with failed jobs)
- Indexed: IVFFlat index with cosine distance for O(log n) similarity search

### embedding_jobs table

Tracks the state of embedding generation tasks, including retries and error tracking.

```sql
CREATE TABLE public.embedding_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('insert', 'update')),
  text_chunk text NOT NULL,  -- Self-explanatory text: "Curso: ... | Descripción: ... | Categoría: ..."
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,  -- Reason for failure (if status = 'failed')
  retry_count int NOT NULL DEFAULT 0,
  max_retries int NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz  -- Set when status = 'completed'
);

-- Indexes for efficient status/retry queries
CREATE INDEX ON public.embedding_jobs(course_id);
CREATE INDEX ON public.embedding_jobs(status);
CREATE INDEX ON public.embedding_jobs(status, retry_count) 
  WHERE status = 'failed' AND retry_count < max_retries;
```

**Status flow:** `pending` → `processing` → `completed` (or `failed` → retry)

### Helper Functions

#### build_course_text(course_id uuid) → text

Constructs a self-explanatory text representation of a course for embedding.

```sql
SELECT build_course_text(course_id);
-- Returns: "Curso: Python Basics | Descripción: Learn Python from scratch | Categoría: Programming"
```

Used internally by `queue_embedding_job()`.

#### queue_embedding_job(course_id uuid, action text) → void

Inserts an embedding job and calls the Edge Function.

```sql
CALL queue_embedding_job(course_id, 'insert');  -- After new course created
CALL queue_embedding_job(course_id, 'update');  -- After course edited
```

**Side effects:**
- Inserts row in `embedding_jobs` (status = 'pending')
- Calls `net.http_post()` to trigger Edge Function `generate-embedding`

#### search_courses_by_embedding(query_embedding vector(384), limit_count int) → table

Performs vector similarity search. Used by POST /api/courses/search.

```sql
SELECT * FROM search_courses_by_embedding(
  query_embedding := '[0.1, -0.2, ...]'::vector,
  limit_count := 10
);
-- Returns: published courses ranked by cosine similarity
```

**Filter:** Only returns courses with `estado = 'published'` and non-null `embedding`.

## Triggers

### courses_insert_embedding

Fires after a new course is inserted.

**Action:** Calls `queue_embedding_job(new.id, 'insert')`

**Note:** Courses are created in the API (POST /api/courses), so embedding generation starts immediately after creation.

### courses_update_embedding

Fires after a course is updated.

**Condition:** Only re-queues embedding if the content changed:
```sql
IF (
  old.titulo IS DISTINCT FROM new.titulo OR
  old.descripcion IS DISTINCT FROM new.descripcion OR
  old.category_id IS DISTINCT FROM new.category_id
) THEN
  CALL queue_embedding_job(new.id, 'update');
END IF;
```

**Behavior:**
- Changing `estado` (draft ↔ published) does NOT re-trigger embedding
- Changing `precio` does NOT re-trigger embedding
- Only content-related changes trigger re-embedding

## Edge Functions

### generate-embedding

**Location:** `supabase/functions/generate-embedding/index.ts`

**Purpose:** Generate and save vector embedding for a course

**Request (from trigger via net.http_post)**
```json
{
  "course_id": "uuid",
  "text": "Curso: Python | Descripción: ...",
  "action": "insert" | "update"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Embedding generated and saved successfully",
  "course_id": "uuid",
  "embedding_dimension": 384
}
```

**Errors**
- `400`: Missing required fields
- `500`: Embedding generation failed after 3 retries

**Process:**
1. Receive course_id and text
2. Mark job as `processing`
3. Call Supabase.ai `gte-small` model with text
4. Save embedding to `courses.embedding`
5. Mark job as `completed`
6. If error: mark job as `failed`, increment `retry_count`

**Retry Strategy:**
- Up to 3 attempts per job
- Exponential backoff: 1s, 2s, 4s between attempts
- Failed jobs can be manually retried via `/api/admin/retry-embeddings` (if implemented)

### generate-query-embedding

**Location:** `supabase/functions/generate-query-embedding/index.ts`

**Purpose:** Generate embedding for a user search query

**Request (from POST /api/courses/search)**
```json
{
  "text": "machine learning"
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "embedding": [0.123, -0.456, ...],
  "dimension": 384
}
```

**Errors**
- `400`: Missing or empty text
- `500`: Model generation failed

**Note:** No retries on query embedding (search gracefully degrades to text search if this fails).

## API Endpoint: POST /api/courses/search

**Full documentation:** See `docs/API_COURSE_MANAGEMENT.md`

**Endpoint:** `POST /api/courses/search`

**Request**
```json
{
  "query": "machine learning",
  "limit": 10
}
```

**Response**
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Machine Learning Fundamentals",
      "descripcion": "...",
      "precio": 49.99,
      "estado": "published",
      "instructor_id": "uuid",
      "similarity": 0.92
    }
  ],
  "count": 5,
  "search_type": "vector"
}
```

**Fallback behavior:** If embedding generation fails, falls back to text search (LIKE on titulo/descripcion). Response includes `"search_type": "text"` in this case.

## Client Component: SearchCourses

**Location:** `src/components/SearchCourses.tsx`

A client-side React component for semantic course search with debouncing and inline feedback.

### Props

None — component is self-contained.

### Features

- **Debounced search:** 500ms debounce on input change (avoids excessive API calls)
- **Manual search:** Form submission triggers immediate search (clears debounce timer)
- **Search type indicator:** Shows "🔍 Búsqueda semántica (vectorial)" or "📝 Búsqueda por texto (fallback)"
- **Live results:** Displays course cards with similarity score (if vector search)
- **Error handling:** Shows error messages if search fails
- **Loading state:** Disables button and shows "Buscando..." while searching

### State

```typescript
const [query, setQuery] = useState('');           // Current search input
const [results, setSearchResult[]>('');           // Search results
const [loading, setLoading] = useState(false);    // Loading indicator
const [error, setError] = useState('');           // Error message
const [searched, setSearched] = useState(false);  // Whether search was performed
const [searchType, setSearchType] = useState(...); // 'vector' or 'text'
```

### Usage

```tsx
import SearchCourses from '@/components/SearchCourses';

export default function CoursesPage() {
  return (
    <div>
      <SearchCourses />
      {/* ... other content ... */}
    </div>
  );
}
```

### Styling

- Uses custom CSS classes: `btn btn-primary`, `card`, `grid`
- Inline styles for responsive layout (flexbox, gap, padding)
- No external UI library dependency

## Environment Variables

**Required for embeddings to work:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (public)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key (private; used by Edge Functions and search API)

**Not set = embeddings disabled:**
- Search API returns 500 error if these are missing
- Embedding generation silently fails (jobs marked as failed; can be retried)

**Optional for SEO:**
- `NEXT_PUBLIC_APP_URL` — Base URL for JSON-LD schema generation

## Migrations

### 0006_add_embeddings.sql

Creates:
- `embedding_jobs` table with status tracking
- `build_course_text()` function (constructs self-explanatory course text)
- `queue_embedding_job()` function (enqueues job + calls Edge Function)
- `courses_insert_embedding` trigger (auto-embed on course creation)
- `courses_update_embedding` trigger (re-embed if content changed)

### 0007_search_function.sql

Creates:
- `search_courses_by_embedding()` RPC function (vector similarity search)
- `search_courses()` RPC function (deprecated; requires query_embedding parameter)

## Troubleshooting

### Embeddings not generating

1. **Check `embedding_jobs` table:**
   ```sql
   SELECT * FROM embedding_jobs 
   WHERE status = 'failed' 
   ORDER BY created_at DESC LIMIT 5;
   ```
   
2. **Check Edge Function logs:**
   - Go to Supabase Dashboard → Functions → generate-embedding → Logs
   
3. **Common causes:**
   - Supabase.ai service down (check status page)
   - Invalid SUPABASE_SERVICE_ROLE_KEY in Edge Function environment
   - Network timeout (Edge Functions have 60s timeout)

### Search results are empty

1. **Check if courses are published:**
   ```sql
   SELECT id, titulo, estado, embedding IS NOT NULL as has_embedding
   FROM courses
   WHERE estado = 'published'
   LIMIT 5;
   ```
   
2. **Check if embeddings exist:**
   ```sql
   SELECT COUNT(*) FROM courses WHERE embedding IS NOT NULL;
   ```
   
3. **Regenerate embeddings:**
   - Trigger a PATCH on courses to re-queue embedding generation
   - Wait for Edge Function to complete (check logs)

### Search is slow

1. **Verify IVFFlat index exists:**
   ```sql
   SELECT * FROM pg_indexes 
   WHERE tablename = 'courses' AND indexname LIKE '%embedding%';
   ```
   
2. **Check index stats:**
   ```sql
   SELECT * FROM pg_stat_user_indexes 
   WHERE indexrelname LIKE '%embedding%';
   ```
   
3. **Rebuild index if corrupted:**
   ```sql
   REINDEX INDEX courses_embedding_idx;
   ```

### Retrying failed embedding jobs

Manually trigger retry:
```sql
UPDATE embedding_jobs
SET status = 'pending'
WHERE status = 'failed' AND retry_count < max_retries
ORDER BY created_at DESC
LIMIT 1;
```

Then call the Edge Function with the job's `course_id` and `text_chunk`:
```bash
curl -X POST https://{project_id}.supabase.co/functions/v1/generate-embedding \
  -H "Authorization: Bearer {SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "course_id": "...",
    "text": "Curso: ... | Descripción: ...",
    "action": "update"
  }'
```

## Performance Characteristics

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Embed a course | O(t) | Where t = text length; 1–2s typical |
| Search (vector) | O(log n) | IVFFlat index; ~10-50ms for 1000 courses |
| Search (text) | O(n) | LIKE scan; ~50-200ms depending on data |
| Fallback to text search | ~50ms additional | Happens transparently if embedding fails |

## Best Practices

1. **Keep course text concise:** Embedding quality degrades with very long texts. Limit to ~500 chars.
2. **Publish courses before search:** Only published courses are searchable.
3. **Monitor embedding_jobs table:** Periodically check for failed jobs and retry if needed.
4. **Cache search results on client:** If search is expensive, cache results in React state.
5. **Use debouncing:** Always debounce search input on client (SearchCourses does this).
6. **Test embedding quality:** Compare vector results with text fallback to ensure embedding model is working.

## Future Improvements

- [ ] Admin dashboard for embedding job management (retry failed, regenerate all)
- [ ] Background job processor (retry failed jobs automatically on a schedule)
- [ ] Embedding quality metrics (track similarity score distribution)
- [ ] Multi-field search (search by instructor, category, price range + semantic query)
- [ ] Personalized search (rerank results by user's enrollment history)
