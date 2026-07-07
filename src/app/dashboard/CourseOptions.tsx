'use client';

import { useState } from 'react';
import { updateCourse, deleteCourse } from '@/app/actions/courses';

interface CourseOptionsProps {
  courseId: string;
  titulo: string;
  descripcion?: string | null;
  categoryId: string;
  precio: number;
  estado: 'draft' | 'published' | 'archived';
  categories: Array<{ id: string; nombre: string }>;
  onUpdate?: () => void;
}

export default function CourseOptions({
  courseId,
  titulo,
  descripcion,
  categoryId,
  precio,
  estado,
  categories,
  onUpdate,
}: CourseOptionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await updateCourse(courseId, formData);
      setSuccess('Curso actualizado');
      setIsEditing(false);
      onUpdate?.();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteCourse(courseId);
      setSuccess('Curso eliminado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      setLoading(false);
    }
  };

  if (isDeleting) {
    return (
      <div
        style={{
          padding: 16,
          backgroundColor: '#fee2e2',
          borderRadius: 8,
          border: '1px solid #fca5a5',
        }}
      >
        <p style={{ marginBottom: 12, fontWeight: 500 }}>
          ¿Estás seguro de que deseas eliminar este curso?
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Eliminando...' : 'Confirmar eliminación'}
          </button>
          <button
            onClick={() => setIsDeleting(false)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div style={{ padding: 16, backgroundColor: '#f9fafb', borderRadius: 8 }}>
        <h4 style={{ marginBottom: 16 }}>Editar Curso</h4>
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
              Título
            </label>
            <input
              name="titulo"
              defaultValue={titulo}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
              Descripción
            </label>
            <textarea
              name="descripcion"
              defaultValue={descripcion || ''}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
              Categoría
            </label>
            <select
              name="categoryId"
              defaultValue={categoryId}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
              Precio (S/)
            </label>
            <input
              name="precio"
              type="number"
              min={0}
              step="0.01"
              defaultValue={precio}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
              }}
            />
          </div>

          {estado === 'draft' && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem' }}>
                Estado
              </label>
              <select
                name="estado"
                defaultValue={estado}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                }}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: 12, padding: 8, backgroundColor: '#fee2e2', borderRadius: 6, fontSize: '0.875rem', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={() => setIsEditing(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #7dd3fc',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Editar
      </button>
      <button
        onClick={() => setIsDeleting(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #fca5a5',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Eliminar
      </button>
    </div>
  );
}
