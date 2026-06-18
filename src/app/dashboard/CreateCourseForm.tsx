'use client';
import { useState } from 'react';
import { createCourse } from '@/app/actions/courses';

type Category = { id: string; nombre: string; slug: string };

export default function CreateCourseForm({ categories }: { categories: Category[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      await createCourse(formData);
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-group">
        <label>Título</label>
        <input name="titulo" required />
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea name="descripcion" rows={3} />
      </div>
      <div className="form-group">
        <label>Categoría</label>
        <select name="categoryId" defaultValue={categories[0]?.id ?? ''}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Precio (S/)</label>
        <input name="precio" type="number" min={0} defaultValue={0} />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button className="btn btn-primary" disabled={loading}>{loading ? 'Creando...' : 'Crear curso (borrador)'}</button>
    </form>
  );
}
