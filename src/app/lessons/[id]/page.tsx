import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import LessonCompleteButton from './LessonCompleteButton';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: lesson }, { data: profile }] = await Promise.all([
    supabase.from('lessons').select('*, courses(id, titulo, instructor_id)').eq('id', id).maybeSingle(),
    user
      ? supabase.from('profiles').select('rol').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!lesson) notFound();

  const courseId = lesson.courses.id;
  const isInstructor = profile?.rol === 'instructor';

  // Fetch course and enrollment status in parallel
  const [{ data: courseData }, { data: enrollment }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', courseId).maybeSingle(),
    user && !isInstructor
      ? supabase.from('enrollments').select('id').eq('course_id', courseId).eq('student_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // Check access: must be instructor (owner) or enrolled student
  const isOwner = user && isInstructor && courseData?.instructor_id === user.id;
  const isEnrolled = !!enrollment;

  if (!isOwner && !isEnrolled) {
    notFound();
  }

  let isCompleted = false;
  if (user && isEnrolled) {
    const { data: completion } = await supabase
      .from('lesson_completions')
      .select('lesson_id')
      .eq('student_id', user.id)
      .eq('lesson_id', id)
      .maybeSingle();
    isCompleted = !!completion;
  }

  // Get all lessons in course for navigation
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, titulo, position')
    .eq('course_id', courseId)
    .order('position');

  const lessonIndex = allLessons?.findIndex(l => l.id === id) ?? -1;
  const nextLesson = lessonIndex >= 0 && lessonIndex < (allLessons?.length ?? 0) - 1
    ? allLessons?.[lessonIndex + 1]
    : null;
  const prevLesson = lessonIndex > 0 ? allLessons?.[lessonIndex - 1] : null;

  return (
    <div className="container">
      <a href={`/courses/${courseId}`} style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Volver al curso</a>

      <div style={{ marginTop: 20, maxWidth: 800 }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: 12 }}>{lesson.titulo}</h1>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 24 }}>
          Curso: <a href={`/courses/${courseId}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>{lesson.courses.titulo}</a>
        </div>

        <div className="card" style={{ padding: 32, marginBottom: 32, lineHeight: 1.8, color: '#374151' }}>
          {lesson.contenido ? (
            <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {lesson.contenido}
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Esta lección aún no tiene contenido.</p>
          )}
        </div>

        {isEnrolled && !isOwner && (
          <LessonCompleteButton lessonId={id} completed={isCompleted} />
        )}

        {/* Navigation */}
        {(prevLesson || nextLesson) && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', marginTop: 32, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            {prevLesson ? (
              <a href={`/lessons/${prevLesson.id}`} className="btn btn-secondary">
                ← {prevLesson.titulo}
              </a>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <a href={`/lessons/${nextLesson.id}`} className="btn btn-secondary" style={{ marginLeft: 'auto' }}>
                {nextLesson.titulo} →
              </a>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
