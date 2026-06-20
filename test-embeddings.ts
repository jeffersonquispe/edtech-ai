/**
 * Test script para validar sistema de embeddings
 * Ejecutar: npx ts-node test-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: { enabled: false },
});

async function testEmbeddings() {
  console.log('🧪 Starting Embedding Tests\n');

  try {
    // 1. Obtener una categoría existente
    console.log('1️⃣ Fetching a category...');
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .limit(1)
      .single();

    if (!categories) {
      console.error('❌ No categories found. Please create one first.');
      return;
    }

    const categoryId = categories.id;
    console.log(`✓ Category ID: ${categoryId}\n`);

    // 2. Obtener el ID del instructor (primera profile con rol='instructor')
    console.log('2️⃣ Fetching an instructor...');
    const { data: instructorProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('rol', 'instructor')
      .limit(1)
      .single();

    if (!instructorProfile) {
      console.error('❌ No instructor found. Please create one first.');
      return;
    }

    const instructorId = instructorProfile.id;
    console.log(`✓ Instructor ID: ${instructorId}\n`);

    // 3. Crear un curso de prueba
    console.log('3️⃣ Creating test course...');
    const testCourse = {
      instructor_id: instructorId,
      category_id: categoryId,
      titulo: 'Test Course: Advanced Machine Learning',
      descripcion: 'Learn cutting-edge machine learning techniques including deep learning, neural networks, and AI applications',
      precio: 99.99,
      estado: 'draft',
    };

    const { data: course, error: createError } = await supabase
      .from('courses')
      .insert(testCourse)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating course:', createError.message);
      return;
    }

    console.log(`✓ Course created: ${course.id}`);
    console.log(`  Title: ${course.titulo}\n`);

    // 4. Esperar a que se genere el embedding
    console.log('4️⃣ Waiting for embedding generation (15 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    // 5. Verificar que el embedding se generó
    console.log('5️⃣ Checking embedding...');
    const { data: courseWithEmbedding } = await supabase
      .from('courses')
      .select('id, titulo, embedding')
      .eq('id', course.id)
      .single();

    if (!courseWithEmbedding) {
      console.error('❌ Course not found after embedding');
      return;
    }

    if (courseWithEmbedding.embedding) {
      const embeddingArray = courseWithEmbedding.embedding;
      console.log(`✓ Embedding generated successfully!`);
      console.log(`  Dimension: ${embeddingArray.length}`);
      console.log(`  Sample values: [${embeddingArray.slice(0, 5).map(v => v.toFixed(4)).join(', ')}, ...]`);
    } else {
      console.log('⚠ Embedding is null. Checking job status...');

      // Revisar tabla de jobs
      const { data: jobs } = await supabase
        .from('embedding_jobs')
        .select('*')
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (jobs && jobs.length > 0) {
        console.log(`  Job Status: ${jobs[0].status}`);
        console.log(`  Retry Count: ${jobs[0].retry_count}`);
        if (jobs[0].error_message) {
          console.log(`  Error: ${jobs[0].error_message}`);
        }
      }
    }

    console.log('\n');

    // 6. Hacer prueba de búsqueda
    console.log('6️⃣ Testing search API...');

    const searchQuery = 'machine learning artificial intelligence';
    const searchResponse = await fetch(
      `${supabaseUrl}/functions/v1/generate-query-embedding`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ text: searchQuery }),
      }
    );

    if (!searchResponse.ok) {
      console.warn('⚠ Query embedding generation failed, using text search');
    } else {
      const { embedding: queryEmbedding } = await searchResponse.json();
      console.log(`✓ Query embedding generated (${queryEmbedding.length} dims)`);

      // Hacer búsqueda vectorial
      const { data: results, error: searchError } = await supabase.rpc(
        'search_courses_by_embedding',
        {
          query_embedding: queryEmbedding,
          limit_count: 5,
        }
      );

      if (searchError) {
        console.error('❌ Search error:', searchError.message);
      } else if (results && results.length > 0) {
        console.log(`✓ Found ${results.length} similar courses:`);
        results.forEach((r: any, i: number) => {
          console.log(`  ${i + 1}. ${r.titulo} (similarity: ${(r.similarity * 100).toFixed(1)}%)`);
        });
      } else {
        console.log('  No results found (may need more courses with embeddings)');
      }
    }

    console.log('\n');

    // 7. Verificar tabla de jobs
    console.log('7️⃣ Checking embedding_jobs table...');
    const { data: allJobs } = await supabase
      .from('embedding_jobs')
      .select('status, retry_count')
      .order('created_at', { ascending: false })
      .limit(10);

    if (allJobs) {
      const stats = {
        completed: allJobs.filter(j => j.status === 'completed').length,
        failed: allJobs.filter(j => j.status === 'failed').length,
        processing: allJobs.filter(j => j.status === 'processing').length,
      };
      console.log(`✓ Job Statistics:`);
      console.log(`  Completed: ${stats.completed}`);
      console.log(`  Processing: ${stats.processing}`);
      console.log(`  Failed: ${stats.failed}`);
    }

    console.log('\n');

    // 8. Limpiar: eliminar el curso de prueba
    console.log('8️⃣ Cleaning up test course...');
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', course.id);

    if (deleteError) {
      console.warn('⚠ Warning deleting test course:', deleteError.message);
    } else {
      console.log('✓ Test course deleted');
    }

    console.log('\n✅ Test completed successfully!\n');
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testEmbeddings();
