'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EnrollButton({ courseId, enrolled, isLoggedIn }: { courseId: string; enrolled: boolean; isLoggedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (enrolled) return null;

  const enroll = async () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    setLoading(true);
    setError('');
    const res = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Error al inscribirse');
      return;
    }
    router.refresh();
  };

  return (
    <div>
      <button className="btn btn-primary" style={{ width: '100%' }} onClick={enroll} disabled={loading}>
        {loading ? 'Inscribiendo...' : isLoggedIn ? 'Inscribirse' : 'Iniciar sesión para inscribirse'}
      </button>
      {error && <p className="error-msg" style={{ textAlign: 'center' }}>{error}</p>}
    </div>
  );
}
