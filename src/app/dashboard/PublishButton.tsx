'use client';
import { useState } from 'react';
import { publishCourse } from '@/app/actions/courses';

export default function PublishButton({ courseId, estado }: { courseId: string; estado: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (estado !== 'draft') return null;

  const publish = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await publishCourse(courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="btn btn-primary"
        style={{ fontSize: '0.75rem', padding: '4px 12px', marginTop: 10, width: '100%' }}
        onClick={publish}
        disabled={loading}
        data-testid={`publish-button-${courseId}`}
      >
        {loading ? 'Publicando...' : 'Publicar'}
      </button>
      {error && <p className="error-msg" style={{ fontSize: '0.75rem', marginTop: 4 }}>{error}</p>}
    </div>
  );
}
