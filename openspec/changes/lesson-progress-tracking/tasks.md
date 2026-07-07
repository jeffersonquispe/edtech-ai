## 1. Database

- [x] 1.1 Create migration `0008_lesson_completions.sql`: `lesson_completions(student_id uuid, lesson_id uuid, completed_at timestamptz default now())` with `PRIMARY KEY (student_id, lesson_id)` (or UNIQUE constraint), FK `lesson_id references lessons(id) on delete cascade`, FK `student_id references profiles(id) on delete cascade`
- [x] 1.2 Add index on `lesson_completions(student_id)` and `lesson_completions(lesson_id)` for aggregation queries
- [x] 1.3 Add SQL helper `is_enrolled_lesson(uid uuid, lid uuid)` that joins `lessons.course_id` into the existing `is_enrolled()` check
- [x] 1.4 Enable RLS on `lesson_completions`; add `select`/`insert`/`delete` policies requiring `student_id = auth.uid()` and `is_enrolled_lesson(auth.uid(), lesson_id)`
- [x] 1.5 Apply migration locally and verify policies with `supabase db` / manual SQL checks (student can only see own rows)

## 2. API

- [x] 2.1 Create `src/app/api/lessons/[id]/complete/route.ts` with `POST` (insert completion, tolerate unique-violation as success) and `DELETE` (remove completion) handlers, following the `requireUser()` → query → `pgErrorToResponse()` pattern from `src/app/api/lessons/[id]/route.ts`
- [ ] 2.2 Confirm RLS-driven 403 on POST/DELETE from a non-enrolled user or instructor (no app-level permission check needed)

## 3. Course Detail Page

- [x] 3.1 In `src/app/courses/[id]/page.tsx`, fetch the current student's completions for the course's lessons (server-side) alongside existing lesson/enrollment fetch
- [x] 3.2 Compute completed count, total lessons, and percentage; render a progress indicator (e.g. "3 de 8 lecciones — 37%") for enrolled students, hidden if the course has zero lessons
- [x] 3.3 Create `LessonCompleteButton.tsx` client component (mirroring `EnrollButton.tsx`'s loading-state pattern) that POSTs/DELETEs to `/api/lessons/[id]/complete` and reflects checked/unchecked state
- [x] 3.4 Render `LessonCompleteButton` per lesson only for enrolled students who are not the course owner
- [x] 3.5 Show "100% completado" state distinctly on the course page when all lessons are complete

## 4. Dashboard

- [x] 4.1 In `src/app/dashboard/page.tsx`, batch-fetch lesson counts per enrolled course and the student's completions across all enrolled courses (avoid N+1 — one query per data source, aggregate in JS)
- [x] 4.2 Render a progress indicator on each enrolled course card reflecting that course's completed/total ratio
- [x] 4.3 Add a "Completado" badge/label on course cards at 100% completion, visually distinct from in-progress cards

## 5. Verification

- [ ] 5.1 Manually verify: student marks a lesson complete → check icon appears, course % updates, dashboard % updates
- [ ] 5.2 Manually verify: student unmarks a completed lesson → check icon disappears, percentages recalculate
- [ ] 5.3 Manually verify: instructor viewing their own course's lesson does not see the "Marcar como completada" control
- [ ] 5.4 Manually verify: a second student's progress is independent (does not affect or reflect the first student's completions)
- [ ] 5.5 Manually verify: attempting to call the complete/uncomplete API for a lesson in a course the user isn't enrolled in returns 403
