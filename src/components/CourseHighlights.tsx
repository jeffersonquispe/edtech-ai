import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { getCourseImage } from '@/lib/courseImages';

type CourseRow = {
  id: string;
  titulo: string;
  precio: number;
  categories: { nombre: string; slug: string } | null;
};

export default async function CourseHighlights() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('courses')
    .select('id, titulo, precio, categories(nombre, slug)')
    .eq('estado', 'published')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data || data.length === 0) {
    return null;
  }

  const courses = data as unknown as CourseRow[];

  return (
    <section style={{ padding: '64px 24px', background: '#F6F4F0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body-s)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#5B4FFF',
            fontWeight: 600,
            marginBottom: 8,
          }}>
            Destacados
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display-m)',
            fontWeight: 700,
            color: '#1A1A1A',
          }}>
            Cursos más recientes
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {courses.map((course) => {
            const categorySlug = course.categories?.slug ?? '';
            const categoryName = course.categories?.nombre ?? '';
            const imgSrc = getCourseImage(course.titulo, categorySlug || categoryName);

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
              >
                <article style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'box-shadow var(--transition-normal), transform var(--transition-normal)',
                }}>

                  {/* Thumbnail */}
                  <div style={{ position: 'relative', aspectRatio: '16/9', flexShrink: 0 }}>
                    <Image
                      src={imgSrc}
                      alt={course.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                    {categoryName && (
                      <span style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: 'rgba(91,79,255,0.9)',
                        color: '#fff',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-utility)',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>
                        {categoryName}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{
                    padding: '20px 22px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    flexGrow: 1,
                  }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-body-l)',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      lineHeight: 1.35,
                    }}>
                      {course.titulo}
                    </h3>

                    <div style={{
                      marginTop: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'var(--text-display-s, 1.25rem)',
                        fontWeight: 700,
                        color: '#5B4FFF',
                      }}>
                        {course.precio === 0
                          ? 'Gratis'
                          : `S/ ${Number(course.precio).toFixed(2)}`}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-body-s)',
                        color: '#5B4FFF',
                        fontWeight: 500,
                      }}>
                        Ver curso →
                      </span>
                    </div>
                  </div>

                </article>
              </Link>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              background: '#5B4FFF',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 'var(--text-body-m)',
              padding: '13px 32px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
            }}
          >
            Ver catálogo completo
          </Link>
        </div>

      </div>
    </section>
  );
}
