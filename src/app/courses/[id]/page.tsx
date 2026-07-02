import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import EnrollButton from './EnrollButton';
import ReviewForm from './ReviewForm';
import { getCourseImage } from '@/lib/courseImages';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('titulo, descripcion, categories(nombre)')
    .eq('id', id)
    .maybeSingle();

  if (!course) return { title: 'Curso no encontrado | EdTech' };

  const category = (course.categories as any)?.nombre ?? '';
  return {
    title: `${course.titulo} | EdTech`,
    description: course.descripcion
      ? course.descripcion.slice(0, 155)
      : `Aprende ${course.titulo}${category ? ` en la categoría ${category}` : ''} con instructores verificados en EdTech.`,
  };
}

export default async function CoursePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: course },
    { data: { user } },
    { data: lessons },
    { data: reviews },
  ] = await Promise.all([
    supabase.from('courses').select('*, categories(nombre, slug)').eq('id', id).maybeSingle(),
    supabase.auth.getUser(),
    supabase.from('lessons').select('id, titulo, position').eq('course_id', id).order('position'),
    supabase
      .from('reviews')
      .select('id, rating, texto, created_at, profiles:student_id(nombre)')
      .eq('course_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (!course) notFound();

  let enrolled = false;
  let isInstructor = false;
  let isOwner = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle();
    isInstructor = profile?.rol === 'instructor';
    isOwner = isInstructor && course.instructor_id === user.id;
    if (!isInstructor) {
      const { data: enr } = await supabase
        .from('enrollments')
        .select('id')
        .eq('course_id', id)
        .eq('student_id', user.id)
        .maybeSingle();
      enrolled = !!enr;
    }
  }

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const categoryName = (course.categories as any)?.nombre ?? null;
  const categorySlug = (course.categories as any)?.slug ?? categoryName ?? '';
  const courseImageSrc = getCourseImage(course.titulo, categorySlug);

  const reviewCount = reviews?.length ?? 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.titulo,
    description: course.descripcion ?? '',
    image: `${appUrl}${courseImageSrc}`,
    provider: { '@type': 'Organization', name: 'EdTech' },
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: course.precio ?? 0,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container">
        {/* Breadcrumb */}
        <nav aria-label="Ruta de navegación">
          <a href="/" style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            ← Volver al catálogo de cursos
          </a>
        </nav>

        <div
          style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: '1fr 300px',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* Columna principal */}
          <div>
            {/* Banner del curso */}
            <div className="course-detail-banner">
              <Image
                src={courseImageSrc}
                alt={`Imagen representativa del curso: ${course.titulo}`}
                width={800}
                height={400}
                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                priority
              />
            </div>

            {/* Categoría */}
            {categoryName && (
              <p
                style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 8 }}
                aria-label={`Categoría: ${categoryName}`}
              >
                {categoryName}
              </p>
            )}

            {/* Título principal */}
            <h1 style={{ fontSize: '1.8rem', marginBottom: 12 }}>{course.titulo}</h1>

            {/* Descripción */}
            <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: 24 }}>
              {course.descripcion}
            </p>

            {/* Rating promedio */}
            {avgRating && (
              <p style={{ marginBottom: 24 }}>
                <span
                  className="stars"
                  aria-hidden="true"
                >
                  {'★'.repeat(Math.round(Number(avgRating)))}
                  {'☆'.repeat(5 - Math.round(Number(avgRating)))}
                </span>
                <span className="sr-only">
                  Calificación promedio: {avgRating} de 5 estrellas
                </span>
                <span
                  style={{ marginLeft: 6, color: '#6b7280', fontSize: '0.875rem' }}
                  aria-hidden="true"
                >
                  {avgRating} ({reviewCount} reseña{reviewCount !== 1 ? 's' : ''})
                </span>
              </p>
            )}

            {/* Lecciones */}
            <section aria-labelledby="lessons-heading">
              <h2 id="lessons-heading" style={{ fontSize: '1.1rem', marginBottom: 12 }}>
                Contenido del curso
              </h2>

              {!lessons || lessons.length === 0 ? (
                <p style={{ color: '#6b7280' }}>Aún no hay lecciones.</p>
              ) : (
                <ol
                  className="card"
                  style={{ padding: 0, overflow: 'hidden', listStyle: 'none', margin: 0 }}
                  aria-label="Lista de lecciones del curso"
                >
                  {(lessons as any[]).map((l, i) => (
                    <li
                      key={l.id}
                      style={{
                        padding: '12px 16px',
                        borderBottom:
                          i < lessons.length - 1 ? '1px solid #f3f4f6' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                      }}
                    >
                      <span
                        style={{ color: '#9ca3af', fontSize: '0.8rem', minWidth: 20 }}
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>

                      {enrolled ? (
                        <a href={`/lessons/${l.id}`}>
                          {`Lección ${i + 1}: ${l.titulo}`}
                        </a>
                      ) : (
                        <>
                          <span style={{ color: '#374151' }}>{l.titulo}</span>
                          <span
                            style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
                            aria-hidden="true"
                          >
                            🔒
                          </span>
                          <span className="sr-only">
                            (disponible al inscribirse)
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Reseñas */}
            <section aria-labelledby="reviews-heading" style={{ marginTop: 28 }}>
              <h2 id="reviews-heading" style={{ fontSize: '1.1rem', marginBottom: 12 }}>
                Reseñas
              </h2>

              {enrolled && <ReviewForm courseId={id} />}

              {!reviews || reviews.length === 0 ? (
                <p style={{ color: '#6b7280' }}>Aún no hay reseñas.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(reviews as any[]).map((r) => (
                    <li key={r.id} className="review-item">
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <span className="stars" aria-hidden="true">
                          {'★'.repeat(r.rating)}
                          {'☆'.repeat(5 - r.rating)}
                        </span>
                        <span className="sr-only">
                          {r.rating} de 5 estrellas
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {r.profiles?.nombre ?? 'Anónimo'}
                        </span>
                      </div>
                      {r.texto && (
                        <p style={{ fontSize: '0.875rem', color: '#374151' }}>{r.texto}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside aria-label="Información y acciones del curso">
            <div className="card" style={{ position: 'sticky', top: 16 }}>
              <p
                style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 16 }}
                aria-label={
                  course.precio === 0
                    ? 'Precio: Gratis'
                    : `Precio: S/ ${course.precio}`
                }
              >
                {course.precio === 0 ? 'Gratis' : `S/ ${course.precio}`}
              </p>

              {!isInstructor && (
                <>
                  <EnrollButton courseId={id} enrolled={enrolled} isLoggedIn={!!user} courseTitle={course.titulo} />
                  {enrolled && (
                    <p
                      style={{
                        marginTop: 12,
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        color: '#16a34a',
                        fontWeight: 600,
                      }}
                      role="status"
                    >
                      ✓ Ya estás inscrito
                    </p>
                  )}
                </>
              )}

              {isOwner && (
                <a
                  href="/dashboard"
                  className="btn btn-secondary"
                  style={{ display: 'block', textAlign: 'center' }}
                >
                  Gestionar curso en el dashboard
                </a>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
