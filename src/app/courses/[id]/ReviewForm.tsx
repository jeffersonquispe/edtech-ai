'use client';
import { useState } from 'react';
import { submitReview } from '@/app/actions/courses';

export default function ReviewForm({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (done) return <p className="success-msg" style={{ marginBottom: 12 }}>¡Gracias por tu reseña!</p>;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      await submitReview(courseId, formData);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 20 }}>
      <p style={{ fontWeight: 600, marginBottom: 12 }}>Deja tu reseña</p>
      <div className="form-group">
        <label htmlFor="rating">Calificación</label>
        <select id="rating" name="rating" defaultValue={5}>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrella{n !== 1 ? 's' : ''}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="texto">Comentario (opcional)</label>
        <textarea id="texto" name="texto" rows={3} />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Enviando...' : 'Enviar reseña'}</button>
    </form>
  );
}
