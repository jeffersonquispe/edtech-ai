'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { getCourseImage } from '@/lib/courseImages';

interface SearchResult {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  estado: string;
  instructor_id: string;
  similarity?: number;
}

export default function SearchCourses({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [searchType, setSearchType] = useState<'vector' | 'text'>('vector');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await fetch('/api/courses/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 10 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Búsqueda fallida');
      }

      const data = await response.json();
      setResults(data.data || []);
      setSearchType(data.search_type || 'text');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en la búsqueda');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    performSearch(query);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      performSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Buscar cursos... (ej: Python, Machine Learning, Diseño)"
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              fontSize: 16,
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
        {searchType === 'vector' && (
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            🔍 Búsqueda semántica (vectorial)
          </p>
        )}
        {searchType === 'text' && (
          <p style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
            📝 Búsqueda por texto (fallback)
          </p>
        )}
      </form>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: 12,
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: 8,
            marginBottom: 16,
            fontSize: '0.875rem',
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: 16, color: '#374151' }}>
            {results.length === 0
              ? 'No se encontraron resultados'
              : `${results.length} curso${results.length !== 1 ? 's' : ''} encontrado${results.length !== 1 ? 's' : ''}`}
          </h3>

          {results.length > 0 && (
            <div className="grid" style={{ gap: 16 }}>
              {results.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    className="card"
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: 16,
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        minWidth: 120,
                        width: 120,
                        height: 120,
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#f3f4f6',
                      }}
                    >
                      <img
                        src={getCourseImage(course.titulo, '')}
                        alt={course.titulo}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.125rem', marginBottom: 8 }}>
                        {course.titulo}
                      </h4>

                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginBottom: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        {course.descripcion
                          ? course.descripcion.substring(0, 120) + '...'
                          : 'Sin descripción'}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                          {course.precio === 0 ? 'Gratis' : `S/ ${course.precio}`}
                        </span>

                        {/* Similarity Score */}
                        {course.similarity !== undefined && (
                          <span
                            style={{
                              fontSize: '0.875rem',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              padding: '4px 12px',
                              borderRadius: 16,
                              fontWeight: 600,
                            }}
                          >
                            {(course.similarity * 100).toFixed(0)}% relevancia
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
