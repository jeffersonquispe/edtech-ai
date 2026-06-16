import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EnrollButton from './EnrollButton';
import ReviewForm from './ReviewForm';
import { getCourseImage } from '@/lib/courseImages';

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: course }, { data: { user } }, { data: lessons }, { data: reviews }] = await Promise.all([
    supabase.from('courses').select('*, categories(nombre, slug)').eq('id', id).maybeSingle(),
    supabase.auth.getUser(),
    supabase.from('lessons').select('id, titulo, position').eq('course_id', id).order('position'),
    supabase.from('reviews').select('id, rating, texto, created_at, profiles:student_id(nombre)').eq('course_id', id).order('created_at', { ascending: false }),
  ]);

  if (!course) notFound();

  let enrolled = false;
  let isInstructor = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).maybeSingle();
    isInstructor = profile?.rol === 'instructor';
    if (!isInstructor) {
      const { data: enr } = await supabase.from('enrollments').select('id').eq('course_id', id).eq('student_id', user.id).maybeSingle();
      enrolled = !!enr;
    }
  }

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="container">
      <a href="/" style={{ color: '#6b7280', fontSize: '0.875rem' }}>← Volver</a>

      <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
        <div>
          <div className="course-detail-banner">
            <img src={getCourseImage(course.titulo, (course.categories as any)?.slug ?? (course.categories as any)?.nombre)} alt={course.titulo} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 8 }}>{(course.categories as any)?.nombre}</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 12 }}>{course.titulo}</h1>
          <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: 24 }}>{course.descripcion}</p>

          {avgRating && (
            <p style={{ marginBottom: 24 }}>
              <span className="stars">{'★'.repeat(Math.round(Number(avgRating)))}</span>
              <span style={{ marginLeft: 6, color: '#6b7280', fontSize: '0.875rem' }}>{avgRating} ({reviews?.length} reseña{reviews?.length !== 1 ? 's' : ''})</span>
            </p>
          )}

          {/* Lecciones */}
          <h2 style={{ fontSize: '1.1rem', marginBottom: 12 }}>Contenido del curso</h2>
          {!lessons || lessons.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Aún no hay lecciones.</p>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {(lessons as any[]).map((l, i) => (
                <div key={l.id} style={{ padding: '12px 16px', borderBottom: i < lessons.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ color: '#9ca3af', fontSize: '0.8rem', minWidth: 20 }}>{i + 1}</span>
                  {enrolled ? <a href={`/lessons/${l.id}`}>{l.titulo}</a> : <span style={{ color: '#374151' }}>{l.titulo}</span>}
                  {!enrolled && <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>🔒</span>}
                </div>
              ))}
            </div>
          )}

          {/* Reseñas */}
          <h2 style={{ fontSize: '1.1rem', margin: '28px 0 12px' }}>Reseñas</h2>
          {enrolled && <ReviewForm courseId={id} />}
          {!reviews || reviews.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Aún no hay reseñas.</p>
          ) : (
            <div>
              {(reviews as any[]).map(r => (
                <div key={r.id} className="review-item">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{r.profiles?.nombre ?? 'Anónimo'}</span>
                  </div>
                  {r.texto && <p style={{ fontSize: '0.875rem', color: '#374151' }}>{r.texto}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="card" style={{ position: 'sticky', top: 16 }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 16 }}>
            {course.precio === 0 ? 'Gratis' : `S/ ${course.precio}`}
          </div>
          {!isInstructor && (
            <>
              <EnrollButton courseId={id} enrolled={enrolled} isLoggedIn={!!user} />
              {enrolled && (
                <p style={{ marginTop: 12, textAlign: 'center', fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                  ✓ Ya estás inscrito
                </p>
              )}
            </>
          )}
          {isInstructor && course.instructor_id === user?.id && (
            <a href="/dashboard" className="btn btn-secondary" style={{ display: 'block', textAlign: 'center' }}>
              Gestionar en dashboard
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
