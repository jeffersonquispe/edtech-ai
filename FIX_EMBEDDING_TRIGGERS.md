# 🔧 Reparando los Triggers de Embeddings

## Problema
Los triggers que generan automáticamente embeddings cuando se crean nuevos cursos no están activándose.

## Solución

### Opción A: Manual via Supabase Dashboard (Recomendado)

1. **Abre Supabase SQL Editor**:
   ```
   https://pfykyfsbjrmqpugtyrlz.supabase.co/dashboard/project/pfykyfsbjrmqpugtyrlz/sql/new
   ```

2. **Copia y pega el siguiente SQL**:

```sql
-- Drop existing triggers (clean slate)
DROP TRIGGER IF EXISTS courses_insert_embedding ON public.courses;
DROP TRIGGER IF EXISTS courses_update_embedding ON public.courses;
DROP FUNCTION IF EXISTS public.handle_course_insert();
DROP FUNCTION IF EXISTS public.handle_course_update();

-- Recreate trigger function for INSERT
CREATE OR REPLACE FUNCTION public.handle_course_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue embedding job when new course is created
  INSERT INTO public.embedding_jobs (course_id, action, text_chunk, status)
  VALUES (
    NEW.id,
    'insert',
    public.build_course_text(NEW.id),
    'pending'
  ) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger function for UPDATE
CREATE OR REPLACE FUNCTION public.handle_course_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if title, description, or category changed
  IF (
    OLD.titulo IS DISTINCT FROM NEW.titulo OR
    OLD.descripcion IS DISTINCT FROM NEW.descripcion OR
    OLD.category_id IS DISTINCT FROM NEW.category_id
  ) THEN
    INSERT INTO public.embedding_jobs (course_id, action, text_chunk, status)
    VALUES (
      NEW.id,
      'update',
      public.build_course_text(NEW.id),
      'pending'
    ) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for INSERT events
CREATE TRIGGER courses_insert_embedding
  AFTER INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_course_insert();

-- Create trigger for UPDATE events
CREATE TRIGGER courses_update_embedding
  AFTER UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_course_update();

-- Verify triggers were created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'courses'
AND trigger_name LIKE '%embedding%';
```

3. **Haz click en "RUN"** para ejecutar el SQL

4. **Verifica** que veas 2 filas en el resultado (2 triggers creados)

---

## Verificación

### Después de ejecutar el SQL:

1. **Crea un nuevo curso** en el dashboard
2. **Espera 2-3 segundos**
3. **Verifica en SQL Editor**:
   ```sql
   SELECT course_id, status, retry_count, error_message
   FROM embedding_jobs
   ORDER BY created_at DESC
   LIMIT 5;
   ```

   Deberías ver tu nuevo curso con `status = 'pending'` o `status = 'completed'`

### Alternativa: Verificar con Script

```bash
SUPABASE_SERVICE_ROLE_KEY="..." node verify-embeddings.js
```

---

## Qué Hace Este SQL

| Componente | Descripción |
|-----------|------------|
| **DROP TRIGGER** | Elimina triggers antiguos que puedan estar rotos |
| **CREATE FUNCTION** | Define la lógica de qué hacer cuando ocurren eventos |
| **CREATE TRIGGER** | Vincula la función a los eventos INSERT/UPDATE |
| **Verify Query** | Comprueba que los triggers se crearon |

---

## ✅ Checklist Final

- [ ] Ejecuté el SQL en Supabase Dashboard
- [ ] Vi 2 filas en el resultado de verificación
- [ ] Creé un nuevo curso en el dashboard
- [ ] El curso aparece en `embedding_jobs` table
- [ ] La búsqueda funciona para nuevos cursos

---

## 🐛 Si Algo Falla

**Error: "Function build_course_text does not exist"**
- Significa que falta la migración de embeddings
- Ejecuta `embedding-setup.sql` primero

**Error: "relation embedding_jobs does not exist"**
- La tabla no fue creada
- Ejecuta `embedding-setup.sql` primero

**Los triggers no se disparan**
- Verifica que la función no tiene errores
- Revisa los logs de Supabase Functions
- Ejecuta de nuevo todo el SQL anterior

---

## 📚 Flujo Completo

```
1. Instructor crea curso
   ↓
2. Trigger courses_insert_embedding se dispara
   ↓
3. Llama handle_course_insert()
   ↓
4. Inserta job en embedding_jobs table (status='pending')
   ↓
5. Edge Function generate-embedding procesa el job
   ↓
6. Genera embedding y guarda en courses.embedding
   ↓
7. Búsqueda vectorial ya disponible para ese curso
```

---

**Última actualización**: 2026-06-19
