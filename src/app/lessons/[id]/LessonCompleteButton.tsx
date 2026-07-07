'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LessonCompleteButton({ lessonId, completed }: { lessonId: string; completed: boolean }) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, {
        method: isCompleted ? 'DELETE' : 'POST',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Error al actualizar el progreso');
      }
      setIsCompleted(!isCompleted);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el progreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <button
        className={isCompleted ? 'btn btn-secondary' : 'btn btn-primary'}
        onClick={toggle}
        disabled={loading}
        data-testid="lesson-complete-button"
        aria-pressed={isCompleted}
      >
        {loading
          ? 'Actualizando...'
          : isCompleted
          ? '✓ Completada — clic para desmarcar'
          : 'Marcar como completada'}
      </button>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}
