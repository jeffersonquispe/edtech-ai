import { createClient } from '@supabase/supabase-js';

/**
 * Global Teardown: borra los cursos de prueba creados por los specs E2E
 * (títulos que empiezan con "Curso Test") para que la tabla `courses`
 * no crezca sin límite en cada corrida de CI y degrade el rendimiento
 * de la página de catálogo.
 */
async function globalTeardown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.log('⚠️  Global teardown: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY, se omite limpieza');
    return;
  }

  const supabase = createClient(url, serviceKey);

  const { data, error } = await supabase
    .from('courses')
    .delete()
    .like('titulo', 'Curso Test%')
    .select('id');

  if (error) {
    console.log(`⚠️  Global teardown: error al limpiar cursos de prueba: ${error.message}`);
    return;
  }

  console.log(`🧹 Global teardown: ${data?.length ?? 0} curso(s) de prueba eliminado(s)`);
}

export default globalTeardown;
