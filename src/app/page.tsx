import { createClient } from '@/lib/supabase/server';
import CourseCatalog from './CourseCatalog';

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

  return (
    <div className="container">
      <CourseCatalog initialCourses={(courses as any) ?? []} categories={(categories as any) ?? []} />
    </div>
  );
}

