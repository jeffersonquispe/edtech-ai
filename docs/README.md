# EdTech LMS Documentation

Comprehensive technical documentation for the Next.js 15 + Supabase EdTech Learning Management System.

## Quick Navigation

### Core Architecture
- **[CLAUDE.md](/CLAUDE.md)** — Project structure, commands, architecture overview (start here)

### API Reference
- **[API_COURSE_MANAGEMENT.md](API_COURSE_MANAGEMENT.md)** — Course CRUD endpoints (GET, PATCH, DELETE) + semantic search endpoint
- **[EMBEDDINGS_SYSTEM.md](EMBEDDINGS_SYSTEM.md)** — Vector embeddings, search architecture, Edge Functions

### Components & UI
- **[SEARCH_COURSES_COMPONENT.md](SEARCH_COURSES_COMPONENT.md)** — SearchCourses client component, usage, styling
- **[SEO_ACCESSIBILITY.md](SEO_ACCESSIBILITY.md)** — JSON-LD, metadata, semantic HTML, accessibility landmarks

## Documentation by Topic

### For API Developers
- **Course Management:** See [API_COURSE_MANAGEMENT.md](API_COURSE_MANAGEMENT.md)
  - Endpoint signatures (GET, PATCH, DELETE)
  - Authorization via RLS (RLS is source of truth, not API logic)
  - Error handling and status codes
  - Usage examples (cURL, fetch)

- **Semantic Search:** See [EMBEDDINGS_SYSTEM.md](EMBEDDINGS_SYSTEM.md)
  - Vector embedding pipeline (course creation → Edge Function → database)
  - Search endpoint (`POST /api/courses/search`)
  - Fallback to text search
  - Embedding job tracking and retry logic

### For Frontend Developers
- **Search UI:** See [SEARCH_COURSES_COMPONENT.md](SEARCH_COURSES_COMPONENT.md)
  - Component props and state
  - Debouncing strategy (500ms)
  - Styling and responsive layout
  - Error handling
  - Accessibility improvements needed

- **Course Detail Page:** See [SEO_ACCESSIBILITY.md](SEO_ACCESSIBILITY.md)
  - Semantic HTML structure
  - JSON-LD structured data (Course schema)
  - Metadata generation
  - Image alt text
  - ARIA labels and SR-only content

### For DevOps / Infrastructure
- **Environment Variables:** See [CLAUDE.md](/CLAUDE.md) "Environment Variables" section
  - Supabase credentials (public and private keys)
  - LiveKit configuration
  - App URL for SEO
  
- **Edge Functions:** See [EMBEDDINGS_SYSTEM.md](EMBEDDINGS_SYSTEM.md) "Edge Functions"
  - `generate-embedding` — Async course embedding (called by trigger)
  - `generate-query-embedding` — Query embedding for search
  - Deployment and configuration

### For Database Administrators
- **Schema Changes:** See [EMBEDDINGS_SYSTEM.md](EMBEDDINGS_SYSTEM.md) "Database Schema"
  - `embedding_jobs` table (tracks async jobs)
  - `courses.embedding` vector(384) column
  - Indexes: IVFFlat on `courses.embedding`

- **Triggers & Functions:** See [EMBEDDINGS_SYSTEM.md](EMBEDDINGS_SYSTEM.md) "Triggers"
  - `courses_insert_embedding` (auto-embed on create)
  - `courses_update_embedding` (re-embed if content changed)
  - `queue_embedding_job()` RPC function

- **Migrations:** See [EMBEDDINGS_SYSTEM.md](EMBEDDINGS_SYSTEM.md) "Migrations"
  - `0006_add_embeddings.sql` — Embedding infrastructure
  - `0007_search_function.sql` — Search functions

### For QA / Testing
- **Search Testing:** See [EMBEDDINGS_SYSTEM.md](EMBEDDINGS_SYSTEM.md) "Troubleshooting"
  - How to verify embeddings are generating
  - How to test vector vs. text search
  - Performance benchmarks

- **SEO Testing:** See [SEO_ACCESSIBILITY.md](SEO_ACCESSIBILITY.md) "Testing Accessibility"
  - Schema validation tools
  - Lighthouse audits
  - Manual accessibility testing

## Recent Changes (June 2026)

### Vector Embeddings System
- **Added:** Semantic search via vector embeddings (gte-small, 384-dim)
- **Added:** `embedding_jobs` table for async job tracking
- **Added:** Edge Functions: `generate-embedding`, `generate-query-embedding`
- **Added:** SearchCourses React component with debouncing
- **Migration:** 0006_add_embeddings.sql, 0007_search_function.sql
- **Files:** `src/app/api/courses/search/route.ts`, `src/components/SearchCourses.tsx`

### Course Edit/Delete Functionality
- **Added:** PATCH /api/courses/[id] (update titulo, descripcion, category, precio, estado)
- **Added:** DELETE /api/courses/[id] (cascade to lessons, enrollments, reviews)
- **RLS:** All authorization enforced via RLS policies (owner-only)
- **Files:** `src/app/api/courses/[id]/route.ts`

### SEO & Accessibility Improvements
- **Added:** JSON-LD Course schema (with ratings, offers, organization)
- **Added:** Semantic HTML: `<section>`, `<nav>`, `<ol>` landmarks
- **Added:** ARIA labels: `aria-labelledby`, `aria-label`, `aria-hidden`
- **Added:** SR-only content for stars and icons
- **Added:** Metadata generation via `generateMetadata()`
- **Added:** Image alt text on course banners
- **Files:** `src/app/courses/[id]/page.tsx`, SearchCourses component

### Configuration
- **Added:** `NEXT_PUBLIC_APP_URL` env var (for JSON-LD absolute URLs)

## Architecture Highlights

### Authorization Model
**RLS (Row-Level Security) is the single source of truth.**

- API endpoints do NOT check permissions
- All authorization is enforced by Postgres RLS policies
- Forbidden errors (403) come from `42501` Postgres error code
- Example: `PATCH /api/courses/[id]` can be called by anyone, but Postgres blocks non-owners

### Search Architecture
```
User input (SearchCourses) 
  ↓
POST /api/courses/search (debounced, limit=10)
  ↓
Edge Function: generate-query-embedding
  ↓
RPC: search_courses_by_embedding (vector similarity)
  ↓
Results (vector search) or fallback to text search
```

### Embedding Pipeline
```
Course created/updated
  ↓
Trigger: queue_embedding_job()
  ↓
Edge Function: generate-embedding (async)
  ↓
Save to courses.embedding (vector(384))
  ↓
Searchable via semantic search
```

## Development Setup

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000, hot reload)
npm run dev

# Run Supabase migrations (first time only)
supabase migration up

# Run tests
npm run test
npm run test:watch

# Lint
npm run lint
```

### Environment Variables

See [CLAUDE.md](/CLAUDE.md) "Environment Variables" for full list. Minimum:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For JSON-LD (SEO)
```

## Key Files Reference

### API Routes
- `src/app/api/courses/route.ts` — List, create courses
- `src/app/api/courses/[id]/route.ts` — Get, update, delete course
- `src/app/api/courses/search/route.ts` — Semantic search
- `src/app/api/courses/[id]/enroll/route.ts` — Student enrollment
- `src/app/api/courses/[id]/reviews/route.ts` — Course reviews

### Components
- `src/components/SearchCourses.tsx` — Search UI with debouncing
- `src/app/courses/[id]/page.tsx` — Course detail (server component)
- `src/app/courses/[id]/EnrollButton.tsx` — Enrollment button (client)
- `src/app/courses/[id]/ReviewForm.tsx` — Review form (client)

### Database
- `supabase/migrations/0006_add_embeddings.sql` — Embedding infrastructure
- `supabase/migrations/0007_search_function.sql` — Search RPC functions

### Edge Functions
- `supabase/functions/generate-embedding/index.ts` — Async embedding generator
- `supabase/functions/generate-query-embedding/index.ts` — Query embedding

### Utilities
- `src/lib/supabase/server.ts` — Server-side Supabase client (uses cookies for RLS)
- `src/lib/supabase/client.ts` — Browser-side client
- `src/lib/api/auth.ts` — `requireUser()` helper
- `src/lib/api/errors.ts` — Error handling, `pgErrorToResponse()`

## Common Tasks

### Add a New Course Endpoint

1. Create file: `src/app/api/courses/{endpoint}/route.ts`
2. Call `requireUser(supabase)` first (throw 401 if not authenticated)
3. Run Supabase query (RLS will filter rows)
4. Catch Postgres errors, translate to HTTP via `pgErrorToResponse()`
5. Document in [API_COURSE_MANAGEMENT.md](API_COURSE_MANAGEMENT.md)

Example:
```typescript
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  try {
    await requireUser(supabase);  // Throws HttpError(401) if no session
    
    const body = await req.json();
    // Validate input...
    
    const { data, error } = await supabase.from('courses').insert(...);
    
    if (error) return pgErrorToResponse(error);
    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
```

### Regenerate Embeddings for All Courses

```bash
# In Supabase SQL editor:
UPDATE embedding_jobs
SET status = 'pending'
WHERE status = 'failed' AND retry_count < max_retries;
```

Or trigger manually by PATCHing each course:
```bash
curl -X PATCH http://localhost:3000/api/courses/{id} \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Current Title"}'  # No change, but triggers re-embedding
```

### Test Search Results

```bash
curl -X POST http://localhost:3000/api/courses/search \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning", "limit": 5}'
```

Check response:
- `search_type`: "vector" (good) or "text" (fallback)
- `similarity`: 0–1 score (vector search only)
- `count`: number of results

## FAQ

### Q: Why use RLS for authorization instead of API logic?
**A:** RLS is enforced at the database layer, making it impossible to bypass. API logic can be accidentally skipped or modified. RLS is the single source of truth.

### Q: How do I know if an embedding failed?
**A:** Check `embedding_jobs` table:
```sql
SELECT * FROM embedding_jobs WHERE status = 'failed' ORDER BY created_at DESC;
```

### Q: Can I search unpublished courses?
**A:** No. The search RPC function filters `estado = 'published'` only. Draft/archived courses are not searchable.

### Q: What if embedding generation times out?
**A:** Job marked as `failed`, can be retried. Edge Functions have 60s timeout; very large texts may exceed this. Consider truncating course descriptions.

### Q: How do I update NEXT_PUBLIC_APP_URL after deployment?
**A:** Set it in your deployment platform (Vercel, etc.) and redeploy. Next.js will rebuild with new URL. JSON-LD will use correct absolute URLs.

### Q: Is search accessible?
**A:** Mostly yes. Needs improvements:
- Add `aria-label` to search input
- Add `aria-live="polite"` to results section
- See [SEARCH_COURSES_COMPONENT.md](SEARCH_COURSES_COMPONENT.md) "Accessibility" for details

## Support & Maintenance

### Monitoring
- Check Edge Function logs regularly for failures
- Monitor `embedding_jobs` table for stuck jobs
- Track search latency and hit rates

### Updates
- Keep Supabase SDK up to date
- Update model (if switching from gte-small to another)
- Monitor Supabase.ai model availability

### Documentation
- Keep this README updated with new features
- Update API docs when endpoints change
- Add migration notes when schema changes

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.3.0 | June 2026 | Vector embeddings, course edit/delete, SEO/accessibility |
| 0.2.0 | May 2026 | Dashboard improvements, enrollment fixes |
| 0.1.0 | Apr 2026 | Initial release |

---

**Last updated:** June 26, 2026  
**Maintainer:** EdTech Dev Team
