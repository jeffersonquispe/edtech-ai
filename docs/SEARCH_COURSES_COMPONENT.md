# SearchCourses Component

## Overview

`SearchCourses` is a client-side React component that provides semantic course search with debouncing and graceful fallback to text search.

**Location:** `src/components/SearchCourses.tsx`

**Features:**
- Debounced search (500ms) to avoid excessive API calls
- Inline search type indicator (vector vs. text)
- Similarity score display for vector search results
- Error handling and loading states
- Responsive card-based layout with course images
- No external UI library (custom CSS only)

## Usage

### Basic Integration

```tsx
import SearchCourses from '@/components/SearchCourses';

export default function Page() {
  return (
    <div className="container">
      <SearchCourses />
      {/* ... rest of page ... */}
    </div>
  );
}
```

### Props

**None.** The component is self-contained and manages all state internally.

## Component Structure

### State Variables

```typescript
const [query, setQuery] = useState('');              // Search input value
const [results, setResults] = useState<SearchResult[]>([]);
const [loading, setLoading] = useState(false);       // Loading indicator
const [error, setError] = useState('');              // Error message
const [searched, setSearched] = useState(false);     // Has search been performed?
const [searchType, setSearchType] = useState<'vector' | 'text'>('vector');
const debounceTimer = useRef<NodeJS.Timeout | null>(null);
```

### SearchResult Type

```typescript
interface SearchResult {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  estado: string;
  instructor_id: string;
  similarity?: number;  // Only present for vector search results
}
```

## Behavior

### Search Flow

1. **User types in search box:**
   - Input change handler (`handleSearch`) captures value
   - Clears existing debounce timer
   - Sets new 500ms timer to call `performSearch()`

2. **500ms delay passes or user submits form:**
   - `performSearch()` is called
   - Sets `loading = true`, `searched = true`, clears previous error
   - Calls `POST /api/courses/search` with query and limit=10

3. **API returns results:**
   - `setResults()` updates with search results
   - `setSearchType()` reflects whether search was vector or text
   - `loading = false`

4. **Error handling:**
   - If API fails, shows error message
   - Clears results (no stale data)
   - Sets `loading = false`

### Debouncing

```typescript
const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setQuery(value);

  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current);
  }

  debounceTimer.current = setTimeout(() => {
    performSearch(value);
  }, 500);  // Wait 500ms after last keystroke
};
```

**Purpose:** Reduce API calls while typing. Example: typing "Python" makes 1 API call instead of 6.

### Manual Search (Form Submission)

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current);  // Cancel pending debounce
  }
  performSearch(query);  // Immediate search
};
```

**Use case:** User clicks "Search" button before 500ms debounce completes.

### Cleanup

```typescript
useEffect(() => {
  return () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };
}, []);
```

Clears debounce timer when component unmounts (prevents memory leaks).

## UI Elements

### Search Form

```tsx
<form onSubmit={handleSubmit}>
  <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
    <input
      type="text"
      value={query}
      onChange={handleSearch}
      placeholder="Buscar cursos... (ej: Python, Machine Learning, Diseño)"
      // Inline styles: flex layout, responsive width
    />
    <button type="submit" disabled={loading} className="btn btn-primary">
      {loading ? 'Buscando...' : 'Buscar'}
    </button>
  </div>

  {/* Search type indicator */}
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
```

**Features:**
- Autofocus on input (loads with cursor ready)
- Placeholder suggests example queries
- Button disables during loading (prevents double-submit)
- Colored badge indicates search type

### Error Message

```tsx
{error && (
  <div
    style={{
      padding: 12,
      backgroundColor: '#fee2e2',  // Light red
      color: '#dc2626',              // Dark red
      borderRadius: 8,
      marginBottom: 16,
      fontSize: '0.875rem',
    }}
  >
    ❌ {error}
  </div>
)}
```

Shows only if search failed.

### Results Display

```tsx
{searched && !loading && (
  <div>
    <h3>
      {results.length === 0
        ? 'No se encontraron resultados'
        : `${results.length} curso${...} encontrado${...}`}
    </h3>

    {results.length > 0 && (
      <div className="grid" style={{ gap: 16 }}>
        {results.map((course) => (
          <Link href={`/courses/${course.id}`}>
            <div className="card" /* ... styling ... */>
              {/* Course image */}
              <div style={{ minWidth: 120, width: 120, height: 120, ... }}>
                <img
                  src={getCourseImage(course.titulo, '')}
                  alt={course.titulo}
                  style={{ ... }}
                />
              </div>

              {/* Course details */}
              <div style={{ flex: 1 }}>
                <h4>{course.titulo}</h4>
                <p>{course.descripcion.substring(0, 120)}...</p>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{course.precio === 0 ? 'Gratis' : `S/ ${course.precio}`}</span>

                  {/* Similarity badge (vector search only) */}
                  {course.similarity !== undefined && (
                    <span style={{ ... }}>
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
```

**Features:**
- Clickable course cards (links to `/courses/{id}`)
- Course image from `getCourseImage()` utility
- Truncated description (120 chars)
- Price display (respects free courses)
- Similarity score badge (vector search only; uses blue color)
- Hover effect (increases box shadow)
- Result count with proper pluralization

## Styling

### CSS Classes Used

- `btn btn-primary` — Primary button style
- `card` — Card container style
- `grid` — Grid layout container

### Inline Styles (when no CSS class available)

- Flexbox layouts for alignment and spacing
- Color palette: grays (#6b7280, #374151), reds (#fee2e2, #dc2626), blues (#dbeafe, #1e40af)
- Font sizes: mostly 0.875rem (small), 1rem (normal), 1.125rem (course title), 1.8rem (headings)
- Spacing: 8px, 12px, 16px, 24px, 32px gaps

## API Integration

### Endpoint

```
POST /api/courses/search
```

### Request

```typescript
const response = await fetch('/api/courses/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: searchQuery, limit: 10 }),
});
```

### Response

```typescript
interface ApiResponse {
  data: SearchResult[];
  count: number;
  search_type: 'vector' | 'text';
}
```

### Error Handling

```typescript
if (!response.ok) {
  const data = await response.json();
  throw new Error(data.error || 'Búsqueda fallida');
}
```

If API error, displays error message and clears results.

## Performance Considerations

### Debouncing

- **500ms delay** balances responsiveness and API efficiency
- For "Python" (6 chars): 1 API call instead of 6
- User sees results ~500ms after typing (not instant, but acceptable UX)

### Result Limit

- `limit: 10` hardcoded (show top 10 results)
- Prevents large response payloads
- Matches desktop/mobile usability (scrolling long lists is tedious)

### Image Loading

- Uses `getCourseImage()` utility (generates placeholder or real image URL)
- Lazy loading via browser default (no explicit optimizations)
- Consider adding `loading="lazy"` to `<img>` if performance needed

## Accessibility

### Current State

- ✅ Form submission with `<form onSubmit>`
- ✅ Semantic `<input>` with placeholder
- ✅ Button with disabled state (feedback for users)
- ✅ Error messages shown (not hidden to screenreaders)
- ✅ Result count with plural handling

### Improvements Needed

- ⚠️ Add `aria-label` to search input (e.g., "Buscar cursos por título o descripción")
- ⚠️ Add `aria-live="polite"` to results section (announce new results)
- ⚠️ Add `aria-busy` to button during search (`aria-busy={loading}`)
- ⚠️ Add `role="region"` to results container with `aria-label`

### Example Enhancement

```tsx
<input
  type="text"
  aria-label="Buscar cursos por título, descripción o categoría"
  // ...
/>

<button
  type="submit"
  disabled={loading}
  aria-busy={loading}
>
  {loading ? 'Buscando...' : 'Buscar'}
</button>

<div
  role="region"
  aria-label="Resultados de búsqueda"
  aria-live="polite"
  aria-atomic="false"
>
  {/* Results here */}
</div>
```

## Common Use Cases

### Place on home page

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main className="container">
      <h1>Catálogo de Cursos</h1>
      <SearchCourses />  {/* Appears at top */}
      {/* ... other listings ... */}
    </main>
  );
}
```

### Place on dedicated search page

```tsx
// src/app/search/page.tsx
export default function SearchPage() {
  return (
    <main className="container">
      <h1>Buscar Cursos</h1>
      <SearchCourses />
    </main>
  );
}
```

### Conditional display (search bar in nav)

```tsx
// In navbar or global search widget
{showSearch && <SearchCourses />}
```

## Testing

### Unit Tests (example with Vitest)

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchCourses from '@/components/SearchCourses';

describe('SearchCourses', () => {
  it('debounces search input', async () => {
    const user = userEvent.setup();
    render(<SearchCourses />);

    const input = screen.getByPlaceholderText(/Buscar cursos/i);
    await user.type(input, 'Python');

    // API should not be called yet (debouncing)
    expect(fetch).not.toHaveBeenCalled();

    // Wait for debounce to complete
    await waitFor(() => expect(fetch).toHaveBeenCalled(), { timeout: 600 });
  });

  it('shows error on failed search', async () => {
    // Mock fetch to reject
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const user = userEvent.setup();
    render(<SearchCourses />);

    const input = screen.getByPlaceholderText(/Buscar cursos/i);
    await user.type(input, 'Python');

    await waitFor(() => {
      expect(screen.getByText(/Error en la búsqueda/i)).toBeInTheDocument();
    });
  });
});
```

## Related Components

- **Navbar:** May include a search box that opens this component
- **CourseCard:** Could be extracted from results display for reuse
- **CoursePage:** Links to `/courses/{id}` from search results

## Future Enhancements

- [ ] Filters (price range, category, rating)
- [ ] Sort options (relevance, price, rating, newest)
- [ ] Pagination (show more results)
- [ ] Search history/suggestions
- [ ] Advanced search syntax (e.g., "instructor:John price:<50")
- [ ] Keyboard navigation (arrow keys to select, Enter to open course)
- [ ] Voice search integration
