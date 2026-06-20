# 🚀 Deployment: Sistema de Embeddings Vectoriales

## Status: ✅ 90% Completado

### Pasos Completados

#### ✅ Edge Functions Desplegadas
```bash
✓ generate-embedding
✓ generate-query-embedding  
✓ retry-embedding-jobs
```

Verificar en Dashboard:
https://app.supabase.com/project/pfykyfsbjrmqpugtyrlz/functions

---

## ⏭️ Paso Faltante: Aplicar SQL Setup

### Opción A: Usar Supabase Dashboard (RECOMENDADO)

1. **Abre SQL Editor**:
   ```
   https://pfykyfsbjrmqpugtyrlz.supabase.co/dashboard/project/pfykyfsbjrmqpugtyrlz/sql/new
   ```

2. **Copia el SQL completo** del archivo `embedding-setup.sql`

3. **Pega y ejecuta** (botón RUN)

4. **Verifica el resultado**: Deberías ver "Success. No rows returned"

### Opción B: Automático (próximamente)

Cuando Supabase CLI soporte ejecución remota de SQL:
```bash
npx supabase db push --remote
```

---

## 🧪 Verificación Rápida

Después de ejecutar el SQL, verifica en SQL Editor:

```sql
-- Verificar tabla
SELECT COUNT(*) as tables FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'embedding_jobs';

-- Resultado esperado: 1

-- Verificar funciones
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('build_course_text', 'queue_embedding_job', 'search_courses_by_embedding')
ORDER BY routine_name;

-- Resultado esperado: 3 funciones
```

---

## 🧪 Pruebas de Sistema

Una vez el SQL esté aplicado:

```bash
# Ejecutar script de prueba completo
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..." node test-embeddings-simple.js
```

**El script:**
1. ✓ Crea curso de prueba
2. ✓ Espera generación de embedding (Edge Function)
3. ✓ Verifica que embedding se guardó
4. ✓ Prueba búsqueda vectorial
5. ✓ Valida tabla de jobs
6. ✓ Limpia datos de prueba

### Salida Esperada

```
🧪 Starting Embedding Tests

1️⃣ Fetching a category...
✓ Category ID: 74d218c1-f5da-405f-bae0-b4507a03b069

2️⃣ Fetching an instructor...
✓ Instructor ID: de1f69ac-e630-4b7f-8d71-5bf80795b9d7

3️⃣ Creating test course...
✓ Course created: 0299664c-f4b0-4dae-9d3f-a606e2a6cee4

4️⃣ Waiting for embedding generation...
.....
5️⃣ ✓ Embedding Generated!

6️⃣ Testing search functionality...
✓ Found 1 similar courses:
   1. TEST: Advanced Machine Learning Algorithms (98.5%)

7️⃣ Embedding Job Statistics
   Completed: 1
   Processing: 0
   Failed: 0

✅ Test completed successfully!
```

---

## 📊 Flujo Completo de Embeddings

```
1. Instructor crea/edita curso
   ↓
2. Trigger automático encola job
   ↓
3. Edge Function `generate-embedding`:
   - Arma texto autoexplicativo del curso
   - Genera embedding con Supabase.ai (gte-small)
   - Guarda en courses.embedding
   ↓
4. Registra en embedding_jobs:
   - Status: completed | failed | processing
   - Retry count para reintentos
   ↓
5. Búsqueda: POST /api/courses/search
   - Genera embedding del query
   - Busca similar courses
   - Retorna ordenados por similaridad
```

---

## 🎯 Configuración Cron (Opcional)

Para reintentos automáticos cada 5 minutos, agregar a `supabase.toml`:

```toml
[crons]
[crons."0 * * * * *"]
  path = "/functions/v1/retry-embedding-jobs"
  method = "GET"
```

O:
```bash
npx supabase cron add --function retry-embedding-jobs --schedule '*/5 * * * *'
```

---

## 📁 Archivos del Sistema

```
✓ supabase/functions/
  ├── generate-embedding/index.ts (DEPLOYED)
  ├── generate-query-embedding/index.ts (DEPLOYED)
  └── retry-embedding-jobs/index.ts (DEPLOYED)

✓ supabase/migrations/
  ├── 0006_add_embeddings.sql
  └── 0007_search_function.sql

✓ src/app/api/
  └── courses/search/route.ts (READY)

✓ Documentación
  ├── docs/EMBEDDINGS.md
  ├── EMBEDDINGS_SETUP.md
  ├── EMBEDDINGS_DEPLOYMENT.md (este archivo)
  └── embedding-setup.sql

✓ Tests
  ├── test-embeddings-simple.js
  └── setup-embeddings.js
```

---

## 🔗 URLs Útiles

- **Supabase Dashboard**: https://app.supabase.com/project/pfykyfsbjrmqpugtyrlz
- **SQL Editor**: https://pfykyfsbjrmqpugtyrlz.supabase.co/dashboard/project/pfykyfsbjrmqpugtyrlz/sql/new
- **Functions Panel**: https://app.supabase.com/project/pfykyfsbjrmqpugtyrlz/functions
- **Database**: https://app.supabase.com/project/pfykyfsbjrmqpugtyrlz/editor

---

## 📋 Checklist Final

- [x] Edge Functions creadas y desplegadas
- [x] Migraciones SQL listas
- [x] Tests automatizados listos
- [x] Documentación completa
- [ ] **TODO**: Ejecutar SQL setup en Supabase Dashboard
- [ ] **TODO**: Ejecutar pruebas (`test-embeddings-simple.js`)
- [ ] **TODO**: Agregar búsqueda a UI (próximo PR)

---

## 💡 Próximos Pasos Después de Activar

1. **Agregar búsqueda a UI**:
   ```tsx
   // Componente SearchCourses
   const results = await fetch('/api/courses/search', {
     method: 'POST',
     body: JSON.stringify({ query: searchTerm })
   });
   ```

2. **Mostrar resultados con scores**:
   ```tsx
   {results.map(r => (
     <div>
       <h3>{r.titulo}</h3>
       <p>Relevancia: {(r.similarity * 100).toFixed(1)}%</p>
     </div>
   ))}
   ```

3. **Agregar filtros avanzados**:
   - Por categoría + búsqueda vectorial
   - Ordenar por relevancia o fecha
   - Paginación de resultados

---

**Última actualización**: 2026-06-19
**Versión**: 1.0 (Edge Functions deployed, DB setup pending)
