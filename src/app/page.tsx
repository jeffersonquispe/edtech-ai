import { createClient } from '@/lib/supabase/server';
import CourseCatalog from './CourseCatalog';
import SearchCourses from '@/components/SearchCourses';

export default async function Home() {
  const supabase = await createClient();

  const [{ data: courses }, { data: categories }] = await Promise.all([
    supabase
      .from('courses')
      .select('id, titulo, descripcion, precio, categories(nombre, slug)')
      .eq('estado', 'published')
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id, nombre, slug')
      .order('nombre', { ascending: true })
  ]);

  // El cliente Supabase sin tipos generados infiere las relaciones embebidas
  // como arreglos; las normalizamos a un solo objeto para el componente cliente.
  const normalizedCourses = (courses ?? []).map((c) => ({
    ...c,
    categories: Array.isArray(c.categories) ? c.categories[0] ?? null : c.categories,
  }));

  return (
    <div className="container">
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 24 }}>Explorar Cursos</h1>
        <SearchCourses />
      </div>

      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 24 }}>Catálogo Completo</h2>
        <CourseCatalog initialCourses={normalizedCourses} categories={categories ?? []} />
      </div>
    </div>
  );
}

