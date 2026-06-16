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
      <a href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
        <span style={{ color: 'var(--color-neutral-900)' }}>EdTech</span>
        <span style={{ color: 'var(--color-indigo)' }}>Platform</span>
        <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-sage)', borderRadius: '50%', boxShadow: '0 0 8px var(--color-sage)', display: 'inline-block' }} title="Plataforma activa"></span>
      </a>
      <div className="nav-links">
        {user ? (
          <>
            <a href="/dashboard" style={{ fontWeight: 500 }}>Mis cursos</a>
            <span style={{ background: 'rgba(91, 79, 255, 0.08)', color: 'var(--color-indigo)', padding: '4px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 500 }}>
              {user.email}
            </span>
            <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={logout}>Salir</button>
          </>
        ) : (
          <>
            <a href="/login" style={{ fontWeight: 500, marginRight: 'var(--space-xs)' }}>Iniciar sesión</a>
            <a href="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>Registrarse</a>
          </>
        )}
      </div>
    </nav>
  );
}
