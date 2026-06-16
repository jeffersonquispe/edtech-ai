-- =====================================================================
-- 0005_seed_courses.sql — Inserta 7 cursos de ejemplo publicados
-- =====================================================================

-- NOTA: Asume que existe al menos un usuario instructor.
-- Si no existe, primero crea uno en Supabase Dashboard (Auth > Users).
-- Reemplaza el UUID de abajo con el ID real del instructor.

-- Obtener el ID del primer instructor (si solo hay uno)
-- O reemplaza manualmente: 'instructor-uuid-here' por el ID real
with instructor as (
  select id from public.profiles
  where rol = 'instructor'
  limit 1
),
categories as (
  select id, slug from public.categories
)
insert into public.courses (instructor_id, category_id, titulo, descripcion, precio, estado)
select
  (select id from instructor),
  (select id from categories where slug = c.category_slug),
  c.titulo,
  c.descripcion,
  c.precio,
  'published'
from (
  values
    ('Introducción a React 19', 'Aprende los fundamentos de React, hooks, y cómo construir aplicaciones modernas con la última versión de React 19.', 'programacion', 49.99),
    ('Diseño UI/UX para principiantes', 'Domina los principios de diseño, tipografía, color y user experience. Perfecto para diseñadores novatos.', 'diseno', 39.99),
    ('Estrategia de Marketing Digital', 'SEO, SEM, redes sociales y email marketing. Todo lo que necesitas para dominar el marketing online.', 'marketing', 59.99),
    ('Python para Ciencia de Datos', 'Aprende Python, pandas, NumPy y Matplotlib. Conviértete en un analista de datos profesional.', 'ciencia-de-datos', 69.99),
    ('Emprenderismo 101', 'De la idea al negocio: plan de negocio, financiamiento, y cómo escalar tu startup.', 'negocios', 44.99),
    ('Advanced TypeScript Patterns', 'Genéricos, decoradores, type guards y patrones avanzados. Para desarrolladores intermediate/senior.', 'programacion', 79.99),
    ('Branding & Identidad Visual', 'Crea una identidad visual sólida para tu marca. Logo, paleta de colores, y guidelines.', 'diseno', 54.99)
) as c(titulo, descripcion, category_slug, precio)
on conflict do nothing;
