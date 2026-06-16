'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ courseId }: { courseId: string }) {
  const [rating, setRating] = useState(5);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (done) return <p className="success-msg" style={{ marginBottom: 12 }}>¡Gracias por tu reseña!</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`/api/courses/${courseId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, texto }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Error al enviar reseña');
      return;
    }
    setDone(true);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="card" style={{ marginBottom: 20 }}>
      <p style={{ fontWeight: 600, marginBottom: 12 }}>Deja tu reseña</p>
      <div className="form-group">
        <label>Calificación</label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))}>
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} estrella{n !== 1 ? 's' : ''}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Comentario (opcional)</label>
        <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={3} />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Enviando...' : 'Enviar reseña'}</button>
    </form>
  );
}
