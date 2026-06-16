import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('id, titulo, descripcion, precio, categories(nombre)')
    .eq('estado', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="container">
      <h1 style={{ marginBottom: 8, fontSize: '1.6rem' }}>Cursos disponibles</h1>
      <p style={{ color: '#6b7280', marginBottom: 28 }}>Explora nuestra oferta de cursos en línea</p>

      {!courses || courses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
          <p style={{ fontSize: '1.1rem' }}>Aún no hay cursos publicados.</p>
          <p style={{ marginTop: 8, fontSize: '0.875rem' }}>
            ¿Eres instructor? <a href="/dashboard">Crea el primero</a>
          </p>
        </div>
      ) : (
        <div className="grid">
          {courses.map((c: any) => (
            <Link key={c.id} href={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card course-card">
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 8 }}>
                  {c.categories?.nombre ?? 'General'}
                </div>
                <h3>{c.titulo}</h3>
                <p style={{ marginTop: 8 }}>{c.descripcion?.slice(0, 100) ?? 'Sin descripción'}{c.descripcion?.length > 100 ? '...' : ''}</p>
                <div className="price">{c.precio === 0 ? 'Gratis' : `S/ ${c.precio}`}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
