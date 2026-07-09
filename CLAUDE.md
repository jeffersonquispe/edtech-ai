# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server; http://localhost:3000 (hot reload)
npm run build      # Next.js build (production)
npm run start      # Run production server
npm run lint       # ESLint
npm run test       # Run Vitest once
npm run test:watch # Vitest watch mode
```

## Flujo de entrega — autónomo, sin pausas de aprobación

Ver [docs/FLUJO-PROYECTO.md](docs/FLUJO-PROYECTO.md) para el detalle completo. Reglas operativas para Claude Code en este repo:

- Cuando una tarea encaje en el flujo OpenSpec (feature/fix no trivial), encadena **`/opsx:propose` → `/opsx:apply` → `/opsx:sync` (si aplica) → `/opsx:archive`** de punta a punta **sin detenerte a pedir aprobación en ningún paso intermedio**, incluida la revisión del proposal antes de implementar. Muestra el `proposal.md` generado en el chat por transparencia, pero no esperes un "sí, procede" explícito para pasar a `/opsx:apply` — el usuario puede interrumpir en caliente si no está de acuerdo (así opera este proyecto: Auto Mode).
- Al terminar cada turno, el hook `Stop` (`scripts/verify-flow.ps1`) corre lint+test y, si pasan, hace commit + push a `main` automáticamente — no pidas confirmación para eso, ya está configurado así a propósito.
- Al iniciar sesión, el hook `SessionStart` (`scripts/check-ci-status.ps1`) reporta el estado del último run de CI en `main` y los *changes* de OpenSpec activos sin archivar. Si reporta que el último run pasó y hay un change activo correspondiente a lo que se acaba de desplegar, corre `/opsx:archive` tú mismo sin preguntar.
- La única forma de frenar esta cadena es que el usuario lo pida explícitamente en el chat (p.ej. "para", "no hagas push todavía"). Sin esa señal, el default es seguir de largo.

## Architecture

Full-stack EdTech LMS: **Next.js 15 App Router** + **Supabase** (PostgreSQL + Auth) + **RLS as single source of truth for authorization**.

### High-Level Layers

**Presentation (Next.js Server & Client Components)**
- `src/app/page.tsx` — Home: list published courses (server-rendered via `await createClient()`)
- `src/app/login/`, `src/app/register/` — Auth forms (client components; use `createClient()` for browser)
- `src/app/courses/[id]/page.tsx` — Course detail (server fetch + embedded client components)
- `src/app/dashboard/page.tsx` — User panel (role-aware: show instructor or student view)
- `src/components/Navbar.tsx` — Reactive nav (watches `auth.onAuthStateChange()`)
- `src/app/globals.css` — Base styles (no UI library; custom CSS)

**API Layer (Next.js Route Handlers)**
- Every endpoint calls `requireUser()` first or handles public access explicitly
- `src/app/api/courses/route.ts` — GET (public list, RLS filters), POST (instructor only via RLS)
- `src/app/api/courses/[id]/route.ts` — GET (public), PATCH (owner only, includes estado/publish), DELETE (owner only)
- `src/app/api/courses/[id]/enroll` — POST (student inscribe; RLS enforces published course)
- `src/app/api/courses/[id]/reviews` — GET (public), POST (inscribed student only)
- `src/app/api/courses/search` — POST (semantic search via embeddings, with text fallback; public)
- `src/app/api/lessons/[id]` — PATCH/DELETE (owner of course only)
- Pattern: authenticate → run query → translate errors via `pgErrorToResponse()`

**Database (Supabase PostgreSQL + RLS)**
- RLS policies are the sole source of truth for all authorization
- Migrations in `supabase/migrations/` run in order (0001 schema → 0002 triggers → 0003 RLS policies → 0004 seed)
- Helper functions in RLS: `is_instructor()`, `owns_course()`, `is_enrolled()`, `course_published()`
- Error codes: 23505 (unique violation) → 409, 42501 (RLS deny) → 403, 23503 (FK) → 400

### Key Files

- `src/lib/supabase/server.ts` — Server-side Supabase client (uses cookies for RLS context)
- `src/lib/supabase/client.ts` — Browser-side Supabase client (for login/logout/onAuthStateChange)
- `src/lib/api/auth.ts` — `requireUser()`: throws HttpError(401) if no session
- `src/lib/api/errors.ts` — `pgErrorToResponse()`: maps Postgres errors to HTTP; `HttpError` class

### Authorization: RLS is Single Source of Truth

API routes do **NOT** re-check permissions — they delegate to RLS:
1. `await requireUser(supabase)` → fail early if no session (401)
2. Run Supabase query (RLS filters rows automatically)
3. If forbidden by RLS, Postgres returns `42501` → endpoint returns 403
4. If unique constraint fails, Postgres returns `23505` → endpoint returns 409

Example: `POST /api/courses/:id/enroll`
- User doesn't need to check "is student" — RLS does it
- Postgres enforces `student_id = auth.uid()` in the INSERT check
- Postgres enforces course is published via `course_published(course_id)` helper
- If either fails, 42501 → 403 Forbidden

**Never hardcode permission logic in the endpoint.** Trust RLS.

### Data Model

- `profiles` — 1:1 with auth.users; `rol`: student | instructor (auto-created on signup via 0002 trigger)
- `courses` — owned by instructor; `estado`: draft | published | archived; `embedding` vector(384) for semantic search
- `lessons` — N:1 with courses; ordered by `position`
- `enrollments` — N:N (student ↔ course); UNIQUE constraint prevents dups
- `reviews` — 1:1 per (student, course); UNIQUE constraint
- `embedding_jobs` — tracks async embedding generation: status (pending/processing/completed/failed), retry tracking, audit

### Server vs. Client Components

**Server Components** (`src/app/*.tsx` pages):
- Fetch from Supabase with `await createClient()` + cookies
- RLS automatically filters rows for the current user
- No session token in code; cookies handled by Next.js

**Client Components** (marked `'use client'`):
- Use `createClient()` (browser version) to authenticate, watch auth state
- Call APIs via `fetch('/api/...')` — cookies auto-sent
- Update UI based on `auth.onAuthStateChange()` listener

**Mixed Example** (`src/app/courses/[id]/page.tsx`):
- Server: fetch course, user, lessons, reviews
- Server: check enrollment status (to show/hide buttons)
- Client children: `<EnrollButton>`, `<ReviewForm>` (use browser Supabase client)

### Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public; used by both server and browser
- `SUPABASE_SERVICE_ROLE_KEY` — private; never expose; used by Edge Functions and `POST /api/courses/search` for embedding generation
- `LIVEKIT_URL` / `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` — server-only; used by `POST /api/livekit/token` to sign LiveKit access tokens. Never prefix the secret with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_LIVEKIT_URL` — public; the wss URL the browser client uses to join the room.
- `NEXT_PUBLIC_APP_URL` — public; base URL for OG/SEO; used in JSON-LD schema generation.

Path alias: `@/*` → `src/*`

### Vector Embeddings & Semantic Search

**How it works:**
1. When a course is created or updated (titulo/descripcion/category changes), a trigger fires (`courses_insert_embedding` / `courses_update_embedding`)
2. Trigger calls `queue_embedding_job()` which inserts a job into `embedding_jobs` table and calls Edge Function `generate-embedding`
3. Edge Function generates embedding using Supabase.ai `gte-small` model (384-dim vector), stores in `courses.embedding`
4. Job tracks status: pending → processing → completed (or failed with retry tracking)

**Search endpoint** (`POST /api/courses/search`):
- Body: `{ query: string, limit?: number }`
- Calls Edge Function `generate-query-embedding` to embed the query
- Uses RPC `search_courses_by_embedding()` for vector similarity (public; only returns published courses)
- Fallback: text search (LIKE on titulo/descripcion) if embedding generation fails
- Returns: `{ data: courses, count: number, search_type: 'vector' | 'text' }`

**Key files:**
- Migrations: `0006_add_embeddings.sql` (jobs table + triggers), `0007_search_function.sql` (RPC functions)
- Edge Functions: `supabase/functions/generate-embedding/` (async job processor), `generate-query-embedding/` (query embedding)
- Search component: `src/components/SearchCourses.tsx` (client; debounced search with inline feedback)
- API: `src/app/api/courses/search/route.ts` (orchestrates Edge Function + RPC)

### Agente de voz Edy (LiveKit)

Widget conversacional (voz + texto) embebido vía iframe. Conecta el navegador al agente Python externo ([edy-agent](https://github.com/jeffersonquispe/edy-agent)) a través de una sala LiveKit compartida.

- `src/app/api/livekit/token/route.ts` — firma tokens (auth opcional; incluye `student_id` si hay sesión).
- `src/app/agente-edy/` — cliente LiveKit (`EdyRoom.tsx`): micrófono, chat de texto (`sendText` topic `lk.chat`) y transcripción.
- `src/components/EdyWidget.tsx` — burbuja flotante global montada en `layout.tsx`; abre `/agente-edy` en un iframe de forma lazy.
- Requiere que el agente Python corra contra el mismo proyecto LiveKit y cubra rooms `edy-*`. El soporte de texto requiere habilitar el text-stream `lk.chat` en el agente.

### SEO & Accessibility Improvements

**Course detail page** (`src/app/courses/[id]/page.tsx`):
- JSON-LD structured data (`Course` schema with `AggregateRating`, `Offer`, instructor/provider info)
- Semantic HTML: breadcrumb nav, `<section>` landmarks with `aria-labelledby`, lesson list as `<ol aria-label>`
- Alt text on course images: `alt={Course title}` for discovery + accessibility
- SR-only content (`.sr-only` class): star ratings, enrollment status labels
- Metadata generation: page title, description (truncated to 155 chars), OG tags via Next.js `generateMetadata()`
- Missing alt on lesson links in locked state (accessibility guidance: add `aria-label` if icon-only)
