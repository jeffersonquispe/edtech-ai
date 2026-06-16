-- =====================================================================
-- 0002_profiles_trigger.sql — Alta automática de perfil al registrarse
-- Un usuario = un rol. Rol por defecto 'student'.
-- El rol/nombre puede venir en raw_user_meta_data al hacer signUp.
-- =====================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, rol, nombre, avatar_url)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'rol')::user_role, 'student'),
    new.raw_user_meta_data ->> 'nombre',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
