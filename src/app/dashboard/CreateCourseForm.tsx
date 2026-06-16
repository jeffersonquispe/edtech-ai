'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = { id: string; nombre: string; slug: string };

export default function CreateCourseForm({ categories }: { categories: Category[] }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [precio, setPrecio] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, category_id: categoryId, precio, estado: 'draft' }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Error al crear curso');
      return;
    }
    setTitulo(''); setDescripcion(''); setPrecio(0);
    router.refresh();
  };

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Título</label>
        <input value={titulo} onChange={e => setTitulo(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} />
      </div>
      <div className="form-group">
        <label>Categoría</label>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Precio (S/)</label>
        <input type="number" min={0} value={precio} onChange={e => setPrecio(Number(e.target.value))} />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Creando...' : 'Crear curso (borrador)'}</button>
    </form>
  );
}
