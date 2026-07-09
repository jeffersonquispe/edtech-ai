'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Suggestion {
  id: string;
  titulo: string;
  precio: number;
}

export default function NavbarSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const response = await fetch('/api/courses/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, limit: 5 }),
      });
      if (!response.ok) {
        setSuggestions([]);
        return;
      }
      const data = await response.json();
      setSuggestions(data.data ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length < 2) {
      setSuggestions([]);
      setSearched(false);
      setOpen(false);
      return;
    }

    setOpen(true);
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value.trim());
    }, 300);
  };

  const closeDropdown = () => {
    setOpen(false);
    setSuggestions([]);
    setSearched(false);
  };

  const handleSelectSuggestion = (id: string) => {
    setQuery('');
    closeDropdown();
    router.push(`/courses/${id}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    closeDropdown();
    router.push(`/?q=${encodeURIComponent(trimmed)}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder="Buscar cursos..."
          aria-label="Buscar cursos"
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          aria-label="Buscar"
          style={{
            marginLeft: 4,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          🔍
        </button>
      </form>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {loading && (
            <div style={{ padding: 12, fontSize: 14, color: '#6b7280' }}>Buscando...</div>
          )}

          {!loading && searched && suggestions.length === 0 && (
            <div style={{ padding: 12, fontSize: 14, color: '#6b7280' }}>
              No se encontraron cursos
            </div>
          )}

          {!loading &&
            suggestions.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => handleSelectSuggestion(course.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  padding: '10px 12px',
                  border: 'none',
                  borderBottom: '1px solid #f3f4f6',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                }}
              >
                <span>{course.titulo}</span>
                <span style={{ color: '#6b7280', fontWeight: 600 }}>
                  {course.precio === 0 ? 'Gratis' : `S/ ${course.precio}`}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
