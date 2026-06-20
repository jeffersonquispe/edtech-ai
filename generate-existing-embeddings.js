#!/usr/bin/env node
/**
 * Script para generar embeddings para cursos existentes
 * Ejecutar: SUPABASE_SERVICE_ROLE_KEY="..." node generate-existing-embeddings.js
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

async function apiCall(endpoint, method = 'GET', body = null) {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`API error: ${res.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

async function generateEmbeddingForCourse(courseId) {
  console.log(`📝 Generating embedding for course ${courseId}...`);

  try {
    // Obtener datos del curso
    const courses = await apiCall(`/courses?select=id,titulo,descripcion,categories(nombre)&id=eq.${courseId}`);

    if (!courses || courses.length === 0) {
      console.log(`   ⚠️ Course not found`);
      return false;
    }

    const course = courses[0];

    // Armar texto autoexplicativo
    const text = `Curso: ${course.titulo} | Descripción: ${course.descripcion || 'Sin descripción'} | Categoría: ${course.categories?.nombre || 'General'}`;

    // Llamar Edge Function
    const functionRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-embedding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({
        course_id: courseId,
        text: text,
        action: 'insert',
      }),
    });

    if (!functionRes.ok) {
      const error = await functionRes.text();
      console.log(`   ❌ Edge Function error: ${error}`);
      return false;
    }

    console.log(`   ✓ Embedding queued`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Generating Embeddings for Existing Courses\n');

  try {
    // 1. Get all published courses without embeddings
    console.log('1️⃣ Fetching courses without embeddings...\n');

    const courses = await apiCall('/courses?select=id,titulo,descripcion,estado,embedding&estado=eq.published');

    const coursesWithoutEmbeddings = courses.filter(c => !c.embedding);

    console.log(`   Found ${courses.length} published courses`);
    console.log(`   ${coursesWithoutEmbeddings.length} need embeddings\n`);

    if (coursesWithoutEmbeddings.length === 0) {
      console.log('✅ All courses already have embeddings!\n');
      return;
    }

    // 2. Generate embeddings
    console.log(`2️⃣ Generating embeddings...\n`);

    let successCount = 0;
    let failureCount = 0;

    for (const course of coursesWithoutEmbeddings) {
      const success = await generateEmbeddingForCourse(course.id);
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }
      // Pequeña pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n3️⃣ Results:\n`);
    console.log(`   ✓ Queued: ${successCount}`);
    console.log(`   ❌ Failed: ${failureCount}`);
    console.log(`   ⏳ Total: ${coursesWithoutEmbeddings.length}\n`);

    // 3. Monitor progress
    console.log('4️⃣ Monitoring progress (30 seconds)...\n');

    for (let i = 0; i < 6; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));

      const jobs = await apiCall('/embedding_jobs?select=status,count()');
      const stats = {
        pending: jobs.filter(j => j.status === 'pending').length,
        processing: jobs.filter(j => j.status === 'processing').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
      };

      const elapsed = (i + 1) * 5;
      console.log(`   [${elapsed}s] ⏳ Pending: ${stats.pending}, 🔄 Processing: ${stats.processing}, ✓ Completed: ${stats.completed}, ❌ Failed: ${stats.failed}`);

      if (stats.pending === 0 && stats.processing === 0) {
        console.log(`\n   ✅ All jobs completed!\n`);
        break;
      }
    }

    // 4. Final summary
    console.log('5️⃣ Final Summary:\n');

    const finalCourses = await apiCall('/courses?select=id,embedding&estado=eq.published');
    const withEmbeddings = finalCourses.filter(c => c.embedding).length;

    console.log(`   Total courses: ${finalCourses.length}`);
    console.log(`   With embeddings: ${withEmbeddings}`);
    console.log(`   Without embeddings: ${finalCourses.length - withEmbeddings}\n`);

    console.log('✨ Embedding generation complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
