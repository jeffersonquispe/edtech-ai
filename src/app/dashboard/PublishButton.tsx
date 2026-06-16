'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PublishButton({ courseId, estado }: { courseId: string; estado: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (estado !== 'draft') return null;

  const publish = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'published' }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      className="btn btn-primary"
      style={{ fontSize: '0.75rem', padding: '4px 12px', marginTop: 10, width: '100%' }}
      onClick={publish}
      disabled={loading}
    >
      {loading ? 'Publicando...' : 'Publicar'}
    </button>
  );
}
