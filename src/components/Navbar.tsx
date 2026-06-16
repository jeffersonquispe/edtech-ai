'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="nav">
      <a href="/" className="nav-brand">EdTech Platform</a>
      <div className="nav-links">
        {user ? (
          <>
            <a href="/dashboard">Mis cursos</a>
            <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{user.email}</span>
            <button className="btn btn-secondary" onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <a href="/login">Iniciar sesión</a>
            <a href="/register" className="btn btn-primary">Registrarse</a>
          </>
        )}
      </div>
    </nav>
  );
}
