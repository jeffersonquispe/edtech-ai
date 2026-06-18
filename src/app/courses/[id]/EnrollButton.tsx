'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { enrollCourse } from '@/app/actions/courses';

export default function EnrollButton({ courseId, enrolled, isLoggedIn }: { courseId: string; enrolled: boolean; isLoggedIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  if (enrolled) return null;

  const enroll = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await enrollCourse(courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al inscribirse');
    } finally {
      setLoading(false);
    }
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
