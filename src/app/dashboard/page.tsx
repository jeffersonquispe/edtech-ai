import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateCourseForm from './CreateCourseForm';
import PublishButton from './PublishButton';
import CourseOptions from './CourseOptions';
import { getCourseImage } from '@/lib/courseImages';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: courses }, { data: enrolledCourses }, { data: categories }] = await Promise.all([
    supabase.from('profiles').select('rol').eq('id', user.id).maybeSingle(),
    supabase
      .from('courses')
      .select('id, titulo, descripcion, estado, precio, category_id, categories(nombre, slug)')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('enrollments')
      .select('courses(id, titulo, precio, estado, categories(nombre, slug))')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('id, nombre, slug'),
  ]);

  const isInstructor = profile?.rol === 'instructor';

  const enrolledCourseIds = (enrolledCourses ?? [])
    .map((e: any) => e.courses?.id)
    .filter(Boolean);

  const progressByCourse: Record<string, { completed: number; total: number }> = {};
  if (!isInstructor && enrolledCourseIds.length > 0) {
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id, course_id')
      .in('course_id', enrolledCourseIds);

    for (const cid of enrolledCourseIds) progressByCourse[cid] = { completed: 0, total: 0 };
    const lessonCourseMap: Record<string, string> = {};
    for (const l of allLessons ?? []) {
      lessonCourseMap[l.id] = l.course_id;
      if (progressByCourse[l.course_id]) progressByCourse[l.course_id].total += 1;
    }

    const lessonIds = Object.keys(lessonCourseMap);
    if (lessonIds.length > 0) {
      const { data: completions } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('student_id', user.id)
        .in('lesson_id', lessonIds);

      for (const c of completions ?? []) {
        const cid = lessonCourseMap[c.lesson_id];
        if (cid && progressByCourse[cid]) progressByCourse[cid].completed += 1;
      }
    }
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: '1.4rem', marginBottom: 28 }}>Mi panel</h1>

      {isInstructor ? (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Mis cursos</h2>
          {courses && courses.length > 0 && (
            <div style={{ marginBottom: 32 }} data-testid="instructor-courses-list">
              {(courses as any[]).map(c => (
                <div key={c.id} className="card" style={{ marginBottom: 16, padding: '20px' }} data-testid={`course-card-${c.id}`}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16 }}>
                    {/* Thumbnail */}
                    <div className="course-card-image" style={{ width: 120, height: 120 }}>
                      <img src={getCourseImage(c.titulo, c.categories?.slug ?? c.categories?.nombre)} alt={c.titulo} />
                    </div>

                    {/* Course Info */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                        <div>
                          <a href={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h3 style={{ marginBottom: 4 }}>{c.titulo}</h3>
                          </a>
                          <span style={{ fontSize: 'var(--text-utility)', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                            {(c.categories as any)?.nombre}
                          </span>
                        </div>
                        <span className={`badge badge-${c.estado}`} style={{ whiteSpace: 'nowrap' }}>{c.estado}</span>
                      </div>

                      <p style={{ color: '#6b7280', marginBottom: 12, fontSize: '0.875rem' }}>
                        {c.descripcion ? c.descripcion.substring(0, 100) + '...' : 'Sin descripción'}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div className="price">{c.precio === 0 ? 'Gratis' : `S/ ${c.precio}`}</div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <PublishButton courseId={c.id} estado={c.estado} />
                        <CourseOptions
                          courseId={c.id}
                          titulo={c.titulo}
                          descripcion={c.descripcion}
                          categoryId={c.category_id}
                          precio={c.precio}
                          estado={c.estado}
                          categories={categories ?? []}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Crear nuevo curso</h2>
          <div className="card" style={{ maxWidth: 500 }}>
            <CreateCourseForm categories={categories ?? []} />
          </div>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Mis inscripciones</h2>
          {enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="grid" style={{ marginBottom: 32 }} data-testid="student-enrolled-courses">
              {enrolledCourses.map((enrollment: any) => {
                const c = enrollment.courses;
                const progress = progressByCourse[c.id];
                const percent = progress && progress.total > 0
                  ? Math.round((progress.completed / progress.total) * 100)
                  : 0;
                const isComplete = progress && progress.total > 0 && percent === 100;
                return (
                  <div key={c.id} className="card course-card" data-testid={`enrolled-course-${c.id}`}>
                    <a href={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="course-card-image">
                        <img src={getCourseImage(c.titulo, c.categories?.slug ?? c.categories?.nombre)} alt={c.titulo} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                        <span style={{ fontSize: 'var(--text-utility)', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{c.categories?.nombre}</span>
                        {isComplete && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                            Completado
                          </span>
                        )}
                      </div>
                      <h3>{c.titulo}</h3>
                      {progress && progress.total > 0 && (
                        <div style={{ marginTop: 'var(--space-sm)' }} role="status">
                          <div style={{ height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden', marginBottom: 4 }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${percent}%`,
                                background: isComplete ? '#16a34a' : '#3b82f6',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {progress.completed} de {progress.total} lecciones — {percent}%
                          </span>
                        </div>
                      )}
                      <div className="price" style={{ marginTop: 'var(--space-sm)' }}>{c.precio === 0 ? 'Gratis' : `S/ ${c.precio}`}</div>
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>
              Aún no te has inscrito en ningún curso. Explora <a href="/">los cursos disponibles</a> e inscríbete en los que te interesen.
            </p>
          )}
        </>
      )}
    </div>
  );
}
