## ADDED Requirements

### Requirement: Student can mark a lesson as completed
An enrolled student SHALL be able to mark a lesson they are viewing as completed. The system SHALL persist the completion per (student, lesson) pair.

#### Scenario: Marking a lesson completed
- **WHEN** an enrolled student clicks "Marcar como completada" on a lesson
- **THEN** the system records a completion for that student and lesson
- **AND** the lesson displays a completed indicator (check icon)
- **AND** the course's completion percentage updates to reflect the new count

#### Scenario: Viewing an already-completed lesson
- **WHEN** a student who previously completed a lesson views it again
- **THEN** the lesson shows the completed state without requiring the student to mark it again

### Requirement: Student can unmark a completed lesson
An enrolled student SHALL be able to remove the completion record for a lesson they previously marked as completed.

#### Scenario: Unmarking a completed lesson
- **WHEN** a student who has completed a lesson clicks the control to unmark it
- **THEN** the system deletes the completion record for that student and lesson
- **AND** the lesson no longer displays the completed indicator
- **AND** the course's completion percentage updates to reflect the removal

### Requirement: Only enrolled students can record completions
The system SHALL restrict writing and reading of lesson completions to the student who owns them, and only for lessons in courses they are enrolled in.

#### Scenario: Instructor cannot mark progress on own course
- **WHEN** the instructor who owns a course views one of its lessons
- **THEN** the "Marcar como completada" control is not shown

#### Scenario: A student cannot read or write another student's completions
- **WHEN** a student attempts to insert, read, or delete a lesson completion row belonging to a different student
- **THEN** the operation is rejected by row-level security

#### Scenario: A non-enrolled user cannot mark a lesson completed
- **WHEN** a user who is not enrolled in a course attempts to mark one of its lessons as completed
- **THEN** the operation is rejected by row-level security

### Requirement: Course completion percentage is visible on the course detail page
The system SHALL show an enrolled student the number and percentage of lessons they have completed for a course, on that course's detail page.

#### Scenario: Partial progress shown on course page
- **WHEN** an enrolled student who has completed some but not all lessons of a course visits the course detail page
- **THEN** the page shows a progress indicator with the count and percentage completed (e.g. "3 de 8 lecciones — 37%")

#### Scenario: No progress yet
- **WHEN** a student who just enrolled and has not completed any lessons views the course progress
- **THEN** the page shows "0 de N lecciones" or "0% completado"

#### Scenario: Full completion shown on course page
- **WHEN** a student has completed all lessons in a course
- **THEN** the page shows "100% completado"

### Requirement: Course completion percentage is visible on the student dashboard
The system SHALL show a completion percentage or progress indicator for each course a student is enrolled in, on their dashboard, without requiring navigation into each course.

#### Scenario: Dashboard shows per-course progress
- **WHEN** a student with multiple enrolled courses at different completion levels visits their dashboard
- **THEN** each enrolled course card shows its own progress indicator reflecting completed lessons divided by total lessons for that course
- **AND** the progress shown for one course is unaffected by other students' progress in the same course

#### Scenario: Fully completed course is visually distinguished
- **WHEN** a student has completed 100% of an enrolled course's lessons
- **THEN** that course's card on the dashboard displays a distinguishing "Completado" label
