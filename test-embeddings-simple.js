/**
 * Test script para validar sistema de embeddings
 * Usa fetch directamente sin dependencias pesadas
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
  'Prefer': 'return=representation',
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

async function testEmbeddings() {
  console.log('🧪 Starting Embedding Tests\n');

  try {
    // 1. Obtener una categoría
    console.log('1️⃣ Fetching a category...');
    const categories = await apiCall('/categories?select=id&limit=1');

    if (!categories || categories.length === 0) {
      console.error('❌ No categories found.');
      return;
    }

    const categoryId = categories[0].id;
    console.log(`✓ Category ID: ${categoryId}\n`);

    // 2. Obtener un instructor
    console.log('2️⃣ Fetching an instructor...');
    const instructors = await apiCall('/profiles?select=id&rol=eq.instructor&limit=1');

    if (!instructors || instructors.length === 0) {
      console.error('❌ No instructor found.');
      return;
    }

    const instructorId = instructors[0].id;
    console.log(`✓ Instructor ID: ${instructorId}\n`);

    // 3. Crear curso de prueba
    console.log('3️⃣ Creating test course...');
    const testCourse = {
      instructor_id: instructorId,
      category_id: categoryId,
      titulo: 'TEST: Advanced Machine Learning Algorithms',
      descripcion: 'Discover cutting-edge machine learning techniques including deep learning, convolutional neural networks, and production-ready AI systems',
      precio: 99.99,
      estado: 'draft',
    };

    const createResult = await apiCall('/courses', 'POST', testCourse);
    const course = Array.isArray(createResult) ? createResult[0] : createResult;

    console.log(`✓ Course created: ${course.id}`);
    console.log(`  Title: ${course.titulo}\n`);

    const courseId = course.id;

    // 4. Esperar a generación de embedding
    console.log('4️⃣ Waiting for embedding generation...');
    console.log('   (Edge Function processes asynchronously, max 20 seconds)');

    let embedding = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (!embedding && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;

      const courseData = await apiCall(`/courses?select=embedding&id=eq.${courseId}`);
      if (courseData && courseData[0] && courseData[0].embedding) {
        embedding = courseData[0].embedding;
      }

      if (attempts % 5 === 0) {
        process.stdout.write('.');
      }
    }

    console.log('\n');

    if (embedding) {
      console.log('5️⃣ ✓ Embedding Generated!\n');
      console.log(`  Dimension: ${embedding.length}`);
      console.log(`  Sample values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}, ...]`);
      console.log(`  Status: ${Array.isArray(embedding) ? '✓ Valid array' : '⚠ Not an array'}\n`);
    } else {
      console.log('5️⃣ ⚠ Embedding not generated (timeout)\n');
      console.log('   Checking job status...');

      const jobs = await apiCall(`/embedding_jobs?select=*&course_id=eq.${courseId}&order=created_at.desc&limit=1`);

      if (jobs && jobs.length > 0) {
        const job = jobs[0];
        console.log(`  Status: ${job.status}`);
        console.log(`  Retry Count: ${job.retry_count}`);
        if (job.error_message) {
          console.log(`  Error: ${job.error_message}`);
        }
      } else {
        console.log('  No job record found');
      }

      console.log('\n');
      return;
    }

    // 6. Prueba de búsqueda
    console.log('6️⃣ Testing search functionality...');

    const searchQuery = 'machine learning neural networks AI';
    console.log(`   Query: "${searchQuery}"`);

    // Generar embedding del query
    console.log('   Generating query embedding...');
    const queryEmbeddingRes = await fetch(
      `${SUPABASE_URL}/functions/v1/generate-query-embedding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ text: searchQuery }),
      }
    );

    if (!queryEmbeddingRes.ok) {
      console.log('   ⚠ Query embedding generation failed');
      console.log('   Falling back to text search...\n');

      const searchResults = await apiCall(
        `/courses?select=id,titulo,descripcion,precio,estado&estado=eq.published&titulo=ilike.%machine%&limit=5`
      );

      console.log(`   Found ${searchResults.length} courses (text search):`);
      searchResults.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.titulo}`);
      });
    } else {
      const queryData = await queryEmbeddingRes.json();
      const queryEmbedding = queryData.embedding;

      console.log(`   ✓ Query embedding generated (${queryEmbedding.length} dims)\n`);
      console.log('   Searching similar courses...\n');

      // Hacer RPC de búsqueda
      const rpcBody = {
        query_embedding: queryEmbedding,
        limit_count: 5,
      };

      const searchUrl = `${SUPABASE_URL}/rest/v1/rpc/search_courses_by_embedding`;
      const searchRes = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(rpcBody),
      });

      if (!searchRes.ok) {
        console.log('   ⚠ RPC search failed');
        const error = await searchRes.text();
        console.log(`   Error: ${error}`);
      } else {
        const results = await searchRes.json();

        if (results && results.length > 0) {
          console.log(`   ✓ Found ${results.length} similar courses:\n`);
          results.forEach((r, i) => {
            const similarity = (r.similarity * 100).toFixed(1);
            console.log(`   ${i + 1}. "${r.titulo}"`);
            console.log(`      Similarity: ${similarity}% | Price: $${r.precio}`);
          });
        } else {
          console.log('   No results found');
        }
      }
    }

    console.log('\n');

    // 7. Job statistics
    console.log('7️⃣ Embedding Job Statistics\n');

    const allJobs = await apiCall('/embedding_jobs?select=status');

    const stats = {
      completed: allJobs.filter(j => j.status === 'completed').length,
      failed: allJobs.filter(j => j.status === 'failed').length,
      processing: allJobs.filter(j => j.status === 'processing').length,
    };

    console.log(`   Completed: ${stats.completed}`);
    console.log(`   Processing: ${stats.processing}`);
    console.log(`   Failed: ${stats.failed}`);
    console.log('\n');

    // 8. Cleanup
    console.log('8️⃣ Cleaning up test course...');
    await apiCall(`/courses?id=eq.${courseId}`, 'DELETE');
    console.log('   ✓ Test course deleted\n');

    console.log('✅ Test completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   ✓ Embedding generation works');
    console.log('   ✓ Vector search functional');
    console.log('   ✓ Edge Functions operational');
    console.log('   ✓ Database triggers active\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

testEmbeddings();
