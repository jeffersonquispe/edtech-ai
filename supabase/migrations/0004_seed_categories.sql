-- =====================================================================
-- 0004_seed_categories.sql — Catálogo inicial de categorías
-- =====================================================================

insert into public.categories (nombre, slug) values
  ('Programación',       'programacion'),
  ('Diseño',             'diseno'),
  ('Negocios',           'negocios'),
  ('Marketing',          'marketing'),
  ('Ciencia de Datos',   'ciencia-de-datos')
on conflict (slug) do nothing;
