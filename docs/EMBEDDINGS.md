# Sistema de Embeddings para Búsqueda Vectorial

## Visión General

El sistema de embeddings automáticamente genera representaciones vectoriales de los cursos usando el modelo gratuito `gte-small` de Supabase.ai. Esto permite búsqueda por similitud semántica.

## Flujo de Ingesta

### 1. Trigger en Base de Datos
Cuando se **inserta** o **edita** un curso:

```sql
INSERT INTO courses (titulo, descripcion, category_id, ...)
→ Trigger `courses_insert_embedding`
→ Llamada a Edge Function `generate-embedding`
```

### 2. Armado de Texto Autoexplicativo

El texto del curso se construye de forma clara y separada:

```
Curso: Introducción a Python | 
Descripción: Aprende los fundamentos de Python desde cero | 
Categoría: Programación
```

**Regla**: Cada chunk debe ser autoexplicativo (no depende del contexto anterior)

### 3. Generación de Embedding

La Edge Function `generate-embedding`:
- Recibe el texto del curso
- Usa `new Supabase.ai.Session('gte-small')` para generar embedding (384 dimensiones)
- Guarda el embedding en `courses.embedding`
- Registra el job en tabla `embedding_jobs` para auditoría y reintentos

### 4. Manejo de Reintentos

Si la generación falla:
- **Reintento automático**: Backoff exponencial (1s, 2s, 4s)
- **Máximo 3 intentos**: Durante la llamada inicial
- **Reintentos diferidos**: Edge Function `retry-embedding-jobs` (cron, cada 5 min)
  - Reintenta jobs con `status='failed'` y `retry_count < max_retries`
  - Soporta hasta 3 reintentos totales

## Arquitectura

### Base de Datos

```sql
-- Columna de embedding (ya creada)
ALTER TABLE courses ADD COLUMN embedding vector(384);
CREATE INDEX ON courses USING hnsw (embedding vector_cosine_ops);

-- Tabla para auditoría y reintentos
CREATE TABLE embedding_jobs (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  action TEXT ('insert' | 'update'),
  text_chunk TEXT,
  status TEXT ('pending' | 'processing' | 'completed' | 'failed'),
  error_message TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  ...
);
```

### Edge Functions

#### 1. `generate-embedding` (POST)
- **Entrada**: `{ course_id, text, action }`
- **Proceso**:
  1. Generar embedding con gte-small
  2. Guardar en `courses.embedding`
  3. Registrar job como `completed`
  4. Si falla: registrar como `failed` + retry_count++
- **Reintentos**: 3 intentos internos con backoff exponencial
- **Timeout**: 60 segundos

#### 2. `generate-query-embedding` (POST)
- **Entrada**: `{ text }`
- **Salida**: `{ embedding: number[], dimension: 384 }`
- Genera embedding para queries de búsqueda

#### 3. `retry-embedding-jobs` (GET)
- **Trigger**: Cron cada 5 minutos (o manual)
- **Función**: Reintenta jobs fallidos que aún tienen reintentos disponibles
- **Reintentos**: 2 más con backoff de 1s cada uno

### API

#### POST `/api/courses/search`

Búsqueda por similitud de embeddings.

**Request**:
```json
{
  "query": "Python para principiantes",
  "limit": 10
}
```

**Response** (si hay embedding):
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Introducción a Python",
      "descripcion": "...",
      "precio": 0,
      "estado": "published",
      "instructor_id": "uuid",
      "similarity": 0.85  // 0 a 1, más alto = más similar
    }
  ],
  "count": 1,
  "search_type": "vector"  // "vector" o "text"
}
```

**Fallback**: Si no hay embeddings o la generación falla, usa búsqueda de texto (LIKE).

## Flujo de Actualización

### Escenario: Instructor edita un curso

```
1. PATCH /api/courses/:id { titulo: "Nuevo título" }
2. Trigger: `courses_update_embedding` detecta cambio
3. Si cambió (titulo | descripcion | category_id):
   → Encola job: INSERT INTO embedding_jobs
   → Llama Edge Function generate-embedding
4. Edge Function:
   → Genera nuevo embedding
   → Actualiza courses.embedding
   → Marca job como "completed"
```

## Estadísticas de Job

Monitorear el estado de embeddings:

```sql
-- Ver jobs pendientes
SELECT * FROM embedding_jobs WHERE status = 'pending';

-- Ver jobs fallidos (no reintentos restantes)
SELECT * FROM embedding_jobs 
WHERE status = 'failed' AND retry_count >= max_retries;

-- Tasa de éxito
SELECT 
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as success,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
  COUNT(*) as total
FROM embedding_jobs;
```

## Configuración

### Variables de Entorno

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Cron (Reintentos)

Agregar en `vercel.json` o Supabase cron:

```json
{
  "crons": [
    {
      "path": "/functions/v1/retry-embedding-jobs",
      "schedule": "*/5 * * * *"  // Cada 5 minutos
    }
  ]
}
```

## Performance

- **Dimensión**: 384 (gte-small es ligero)
- **Índice**: HNSW (mejor para búsqueda, más rápido que IVFFlat)
- **Latencia**:
  - Generación de embedding: ~500ms
  - Búsqueda vectorial: ~10-50ms (dependiendo del volumen)

## Casos de Uso

### 1. Búsqueda semántica
```
Query: "cursos de backend"
→ Encuentra Python, Node.js, Go (semánticamente relacionados)
```

### 2. Recomendaciones
```
Usar similitud de embedding para recomendar cursos relacionados
```

### 3. Deduplicación
```
Detectar cursos muy similares comparando embeddings
```

## Troubleshooting

### Embedding no se genera
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` sea válido
- Revisar tabla `embedding_jobs` para ver si hay errores
- Verificar logs de Edge Function

### Búsqueda lenta
- Índice HNSW creado: `CREATE INDEX ... USING hnsw`
- Reindexar: `REINDEX INDEX courses_embedding_idx;`

### Embedding diferente después de actualizar
- Normal: cambio en titulo/descripcion → nuevo embedding
- Revisar tabla `embedding_jobs` para auditoría

## Próximos Pasos

- [ ] Cachear embeddings de queries frecuentes
- [ ] Implementar similarity threshold
- [ ] Dashboard de estadísticas de embeddings
- [ ] Batch generation para actualización masiva
