'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'student' | 'instructor'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol } },
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 64 }}>
      <div className="card">
        <h1 style={{ marginBottom: 24, fontSize: '1.4rem' }}>Crear cuenta</h1>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value as 'student' | 'instructor')}>
              <option value="student">Estudiante</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
