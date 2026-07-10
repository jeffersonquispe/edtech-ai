'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getCourseImage } from '@/lib/courseImages';

type Course = {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  categories: { nombre: string; slug: string } | null;
};

type Category = {
  id: string;
  nombre: string;
  slug: string;
};

export default function CourseCatalog({
  initialCourses,
  categories,
}: {
  initialCourses: Course[];
  categories: Category[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredCourses = activeCategory === 'all'
    ? initialCourses
    : initialCourses.filter(c => c.categories?.slug === activeCategory);

  return (
    <div>
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-accent-line"></div>
        <h1 className="hero-title">Primero lo nuestro, apunta a IA</h1>
        <p className="hero-subtitle">
          Explora cursos dictados por profesionales de la industria y potencia tu carrera en tecnología, diseño y negocios.
        </p>
      </header>

      {/* Filter Chips */}
      <div className="filter-container">
        <button
          className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          Todos los cursos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-chip ${activeCategory === cat.slug ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.slug)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grid of Courses */}
      {filteredCourses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
          <p style={{ fontSize: '1.1rem' }}>No hay cursos disponibles en esta categoría.</p>
        </div>
      ) : (
        <div className="grid">
          {filteredCourses.map((c) => (
            <Link key={c.id} href={`/courses/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card course-card" data-state="published">
                <div className="course-card-image">
                  <img src={getCourseImage(c.titulo, c.categories?.slug ?? c.categories?.nombre)} alt={c.titulo} />
                </div>
                <div style={{ fontSize: 'var(--text-utility)', color: '#6b7280', marginBottom: 'var(--space-xs)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  {c.categories?.nombre ?? 'General'}
                </div>
                <h3>{c.titulo}</h3>
                <p style={{ marginTop: 'var(--space-sm)' }}>
                  {c.descripcion?.slice(0, 100) ?? 'Sin descripción'}
                  {c.descripcion && c.descripcion.length > 100 ? '...' : ''}
                </p>
                <div className="price">
                  {c.precio === 0 ? 'Gratis' : `S/ ${c.precio}`}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
