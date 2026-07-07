## Context

Courses have `lessons` (N:1 to course, ordered by `position`) and `enrollments` (student ↔ course). Authorization is entirely RLS-driven per CLAUDE.md convention — API routes never re-check permissions, they run the query and translate Postgres errors (`pgErrorToResponse`). Existing patterns to follow:
- `owns_course(uid, cid)` / `is_enrolled(uid, cid)` SQL helper functions already exist (`0003_rls_policies.sql`) and should be reused.
- `EnrollButton.tsx` is the reference client-component pattern for a toggle action tied to the current user against a course.
- `src/app/courses/[id]/page.tsx` already does a server-side fetch of lessons + enrollment status before rendering client children.

## Goals / Non-Goals

**Goals:**
- Persist per-student, per-lesson completion state.
- Compute and surface course completion percentage in three places: lesson view, course detail page, dashboard.
- Enforce via RLS that a student can only write/read their own completion rows.
- Keep instructors from seeing/using the "mark complete" control on their own course.

**Non-Goals:**
- Certificates (B05) — out of scope, this change only exposes the 100%-complete signal a future certificate feature can key off of.
- Lesson content tracking (time spent, video position) — only a binary completed/not-completed per lesson.
- Progress analytics for instructors (B03) — dashboard changes here are student-side only.

## Decisions

- **New table `lesson_completions(student_id, lesson_id, completed_at)`** with `UNIQUE(student_id, lesson_id)`, as suggested in the backlog notes. Alternative considered: a `completed` boolean column directly on a join table — rejected because unmark/remark needs to be cheap and idempotent, and a row's mere existence is a simpler completion signal than a mutable flag (delete-on-unmark avoids stale timestamps).
- **Toggle via POST for mark, DELETE for unmark** on `src/app/api/lessons/[id]/complete/route.ts`, mirroring the existing `enroll` route's POST-only style but needing a two-way toggle since Historia 1 requires unmarking. POST inserts (idempotent via `ON CONFLICT DO NOTHING` or unique-violation-tolerant upsert), DELETE removes the row. Alternative considered: single POST that flips state server-side — rejected because it requires a read-then-write and is less RESTful/cacheable than explicit verbs.
- **RLS policy**: `lesson_completions_insert`/`_select`/`_delete` all require `student_id = auth.uid()` AND `is_enrolled(auth.uid(), <course_id resolved via lesson>)`. Since `lesson_completions` only has `lesson_id`, the enrollment check needs a join through `lessons.course_id` — implemented as a SQL helper `is_enrolled_lesson(uid, lesson_id)` wrapping the existing `is_enrolled`.
- **Progress calculation**: computed client-side in the server component from two queries (`count(lessons)` for the course, `count(lesson_completions)` for that student+course) rather than a DB view/RPC. Alternative considered: a `course_progress` SQL view or RPC — deferred as unnecessary complexity until a second consumer (e.g. instructor stats B03) needs server-side aggregation.
- **Instructor exclusion** is a UI-only check (`profile.rol !== 'instructor'` or `!owns_course`), matching the existing pattern where `EnrollButton`/`PublishButton` are conditionally rendered server-side in `page.tsx`. RLS will also naturally reject an instructor's insert if they're not enrolled as a student in their own course (they're not), so this is defense in depth, not the sole gate.

## Risks / Trade-offs

- [Risk] N+1-style queries on the dashboard (one completions-count query per enrolled course) → Mitigation: batch with a single `lesson_completions` query filtered by `student_id` and a `lessons` count query filtered by `course_id IN (...)`, aggregated in JS, same pattern as existing `Promise.all` batching in `dashboard/page.tsx`.
- [Risk] Race condition if a lesson is deleted while a completion row references it → Mitigation: FK `lesson_id references lessons(id) on delete cascade`.
- [Risk] Toggle button flashes incorrect state during optimistic UI update → Mitigation: follow `EnrollButton.tsx`'s existing loading-state pattern (disable button + spinner text during request).

## Migration Plan

1. Add migration `0008_lesson_completions.sql`: table, indexes, FK cascade, `is_enrolled_lesson()` helper, RLS policies.
2. Add API route `src/app/api/lessons/[id]/complete/route.ts` (POST/DELETE).
3. Add `LessonCompleteButton.tsx` client component, wire into lesson rendering in `courses/[id]/page.tsx`.
4. Add progress bar UI to course detail page and dashboard.
5. No backfill needed — table starts empty, all existing students start at 0% for all courses (correct, since no historical data exists).
6. Rollback: drop the migration; no other table's schema is touched, so this is fully reversible.

## Open Questions

- Should "0 lecciones" courses show "0%" or hide the progress UI entirely? (Recommendation: hide it — a course with no lessons has nothing to track.)
