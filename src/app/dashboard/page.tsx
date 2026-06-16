import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CreateCourseForm from './CreateCourseForm';
import PublishButton from './PublishButton';
import { getCourseImage } from '@/lib/courseImages';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: courses } = await supabase
    .from('courses')
    .select('id, titulo, estado, precio, categories(nombre, slug)')
    .eq('instructor_id', user.id)
    .order('created_at', { ascending: false });

  const { data: categories } = await supabase.from('categories').select('id, nombre, slug');

  const isInstructor = user.user_metadata?.rol === 'instructor';

  return (
    <div className="container">
      <h1 style={{ fontSize: '1.4rem', marginBottom: 28 }}>Mi panel</h1>

      {isInstructor ? (
        <>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Mis cursos</h2>
          {courses && courses.length > 0 && (
            <div className="grid" style={{ marginBottom: 32 }}>
              {(courses as any[]).map(c => (
                <div key={c.id} className="card course-card" data-state={c.estado}>
                  <a href={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="course-card-image">
                      <img src={getCourseImage(c.titulo, c.categories?.slug ?? c.categories?.nombre)} alt={c.titulo} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                      <span style={{ fontSize: 'var(--text-utility)', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{(c.categories as any)?.nombre}</span>
                      <span className={`badge badge-${c.estado}`}>{c.estado}</span>
                    </div>
                    <h3>{c.titulo}</h3>
                    <div className="price" style={{ marginTop: 'var(--space-sm)' }}>{c.precio === 0 ? 'Gratis' : `S/ ${c.precio}`}</div>
                  </a>
                  <PublishButton courseId={c.id} estado={c.estado} />
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
          <p style={{ color: '#6b7280' }}>
            Explora <a href="/">los cursos disponibles</a> e inscríbete en los que te interesen.
          </p>
        </>
      )}
    </div>
  );
}
