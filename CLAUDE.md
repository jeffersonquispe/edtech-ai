# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # ESLint
npm run test       # Run tests once (Vitest)
npm run test:watch # Run tests in watch mode
```

## Architecture

Full-stack EdTech LMS built with **Next.js 15 App Router**, **TypeScript**, and **Supabase** (PostgreSQL + Auth).

### Key directories

- `src/app/api/courses/` — REST API routes. Pattern: authenticate with `requireUser()`, run query, translate errors via `handleApiError()`.
- `src/app/courses/[id]/` — Course detail page with client components (`EnrollButton`, `ReviewForm`).
- `src/lib/supabase/server.ts` — Server-side Supabase client (RLS-aware, reads cookies for auth).
- `src/lib/supabase/client.ts` — Browser-side Supabase client for client components.
- `src/lib/api/auth.ts` — `requireUser()` helper; throws 401 if unauthenticated.
- `src/lib/api/errors.ts` — Maps PostgreSQL error codes to HTTP responses (23505 → 409, 42501 → 403, etc.).
- `supabase/migrations/` — SQL migrations; run in order against the Supabase project.

### Authorization model

**RLS is the single source of truth for authorization.** API routes do not re-implement permission logic — they rely on Supabase Row Level Security policies defined in `supabase/migrations/0003_rls_policies.sql`. When an operation is forbidden, Postgres returns a `42501` error which `handleApiError` translates to 403.

Key RLS helper functions: `is_instructor()`, `owns_course(course_id)`, `is_enrolled(course_id)`, `course_published(course_id)`.

### Data model

- `profiles` — 1:1 with `auth.users`; `rol` enum: `student` | `instructor`. Auto-created via trigger in migration 0002.
- `courses` — owned by instructors; `estado` enum: `draft` | `published` | `archived`.
- `lessons` — ordered by `position` within a course.
- `enrollments` — student ↔ course junction with UNIQUE constraint.
- `reviews` — one per student per course (UNIQUE constraint).

### Environment variables

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — used in both browser and server clients.
- `SUPABASE_SERVICE_ROLE_KEY` — only for migrations/seeding, never used in request paths.

Path alias `@/*` maps to `src/*`.
