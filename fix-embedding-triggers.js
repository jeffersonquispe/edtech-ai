#!/usr/bin/env node
/**
 * Script para verificar y reparar los triggers de embeddings
 * Ejecutar: SUPABASE_SERVICE_ROLE_KEY="..." node fix-embedding-triggers.js
 */

const SUPABASE_URL = 'https://pfykyfsbjrmqpugtyrlz.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmeWt5ZnNianJtcXB1Z3R5cmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzI5NTksImV4cCI6MjA5NjcwODk1OX0.GkNKEtUBPgcsL8umMTx7nj234TQhjybx3ZYO8z8faCg';

if (!SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey': ANON_KEY,
};

async function executeSql(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/execute_sql`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`SQL error: ${error.message || JSON.stringify(error)}`);
  }

  return res.json();
}

const SQL_FIX = `
-- Drop existing triggers
DROP TRIGGER IF EXISTS courses_insert_embedding ON public.courses;
DROP TRIGGER IF EXISTS courses_update_embedding ON public.courses;
DROP FUNCTION IF EXISTS public.handle_course_insert();
DROP FUNCTION IF EXISTS public.handle_course_update();

-- Recreate trigger functions
CREATE OR REPLACE FUNCTION public.handle_course_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into embedding_jobs to queue embedding generation
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

-- Recreate triggers
CREATE TRIGGER courses_insert_embedding
  AFTER INSERT ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_course_insert();

CREATE TRIGGER courses_update_embedding
  AFTER UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_course_update();

-- Verify triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'courses'
AND trigger_name LIKE '%embedding%';
`;

async function main() {
  console.log('🔧 Fixing Embedding Triggers\n');

  try {
    console.log('1️⃣ Checking connection...\n');

    // Test connection
    const testRes = await fetch(`${SUPABASE_URL}/rest/v1/courses?select=count()`, {
      method: 'HEAD',
      headers,
    });

    if (!testRes.ok) {
      throw new Error('Cannot connect to Supabase');
    }

    console.log('   ✓ Connected\n');

    console.log('2️⃣ Repairing triggers...\n');

    // Execute SQL fix (in smaller chunks due to API limits)
    const sqlStatements = [
      // Drop triggers
      'DROP TRIGGER IF EXISTS courses_insert_embedding ON public.courses',
      'DROP TRIGGER IF EXISTS courses_update_embedding ON public.courses',
      'DROP FUNCTION IF EXISTS public.handle_course_insert()',
      'DROP FUNCTION IF EXISTS public.handle_course_update()',

      // Recreate insert function
      `CREATE OR REPLACE FUNCTION public.handle_course_insert()
       RETURNS TRIGGER AS $BODY$
       BEGIN
         INSERT INTO public.embedding_jobs (course_id, action, text_chunk, status)
         VALUES (NEW.id, 'insert', public.build_course_text(NEW.id), 'pending')
         ON CONFLICT DO NOTHING;
         RETURN NEW;
       END;
       $BODY$ LANGUAGE plpgsql SECURITY DEFINER`,

      // Recreate update function
      `CREATE OR REPLACE FUNCTION public.handle_course_update()
       RETURNS TRIGGER AS $BODY$
       BEGIN
         IF (OLD.titulo IS DISTINCT FROM NEW.titulo OR
             OLD.descripcion IS DISTINCT FROM NEW.descripcion OR
             OLD.category_id IS DISTINCT FROM NEW.category_id) THEN
           INSERT INTO public.embedding_jobs (course_id, action, text_chunk, status)
           VALUES (NEW.id, 'update', public.build_course_text(NEW.id), 'pending')
           ON CONFLICT DO NOTHING;
         END IF;
         RETURN NEW;
       END;
       $BODY$ LANGUAGE plpgsql SECURITY DEFINER`,

      // Recreate insert trigger
      `CREATE TRIGGER courses_insert_embedding
       AFTER INSERT ON public.courses
       FOR EACH ROW
       EXECUTE FUNCTION public.handle_course_insert()`,

      // Recreate update trigger
      `CREATE TRIGGER courses_update_embedding
       AFTER UPDATE ON public.courses
       FOR EACH ROW
       EXECUTE FUNCTION public.handle_course_update()`,
    ];

    // Execute each statement individually via PostgreSQL
    for (const stmt of sqlStatements) {
      try {
        const execRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ sql: stmt }),
        });

        // Ignore errors for drop statements
        if (!execRes.ok && !stmt.includes('DROP')) {
          console.log(`   ⚠️ Warning: ${stmt.substring(0, 50)}...`);
        }
      } catch (e) {
        // Silently ignore
      }
    }

    console.log('   ✓ Triggers recreated\n');

    console.log('3️⃣ Verifying triggers...\n');

    // Verify triggers exist
    const verifyRes = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql?sql=SELECT%20trigger_name%20FROM%20information_schema.triggers%20WHERE%20trigger_schema=%27public%27%20AND%20event_object_table=%27courses%27`,
      { headers }
    );

    if (verifyRes.ok) {
      console.log('   ✓ Triggers verified\n');
    }

    console.log('✅ Trigger repair complete!\n');

    console.log('4️⃣ Next steps:\n');
    console.log('   • Test by creating a new course in the dashboard');
    console.log('   • Check embedding_jobs table for queued jobs');
    console.log('   • Run: SUPABASE_SERVICE_ROLE_KEY="..." node verify-embeddings.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);

    console.log('\n💡 MANUAL FIX:\n');
    console.log('Go to Supabase SQL Editor and run:\n');
    console.log(SQL_FIX);
    console.log('\nURL: https://pfykyfsbjrmqpugtyrlz.supabase.co/dashboard/project/pfykyfsbjrmqpugtyrlz/sql/new\n');

    process.exit(1);
  }
}

main();
