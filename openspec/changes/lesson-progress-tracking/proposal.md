## Why

Students currently have no way to track which lessons they've completed. This is the most visible gap in the student experience: the platform can't tell what a student has consumed, can't show progress on the course or dashboard, and can't gate future features like certificates (backlog B05) that depend on completion state.

## What Changes

- Add a `lesson_completions` table recording which student has completed which lesson, with RLS so students can only read/write their own rows.
- Add an endpoint to toggle (mark/unmark) a lesson as completed for the current student.
- Show a "Mark as completed" control on the lesson view for enrolled students only (hidden for the course's instructor).
- Show a per-course progress indicator (`X de Y lecciones — Z%`) on the course detail page for enrolled students.
- Show a per-course progress indicator on the student dashboard's enrolled-courses list, with a distinct "Completado" label at 100%.

## Capabilities

### New Capabilities
- `lesson-progress`: tracking, toggling, and displaying per-student lesson completion and course-level progress percentage.

### Modified Capabilities
(none — no existing spec's requirements change; lessons/enrollments behavior is extended, not altered)

## Impact

- New migration: `lesson_completions` table + RLS policies (student-owned rows only).
- New API route: `src/app/api/lessons/[id]/complete` (POST toggle, or POST/DELETE pair).
- `src/app/courses/[id]/page.tsx`: fetch completions for the enrolled student, render per-lesson checked state and course progress bar.
- New client component for the "Mark as completed" toggle (mirrors `EnrollButton.tsx` pattern).
- `src/app/dashboard/page.tsx`: fetch completion counts per enrolled course, render progress per course card.
- No changes to existing tables' schemas; purely additive.
