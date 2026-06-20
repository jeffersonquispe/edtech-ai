#!/usr/bin/env node
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

async function main() {
  console.log('📊 Verifying Embedding Status\n');

  try {
    // 1. Courses with/without embeddings
    console.log('1️⃣ Course Embedding Status:\n');

    const courses = await apiCall('/courses?select=id,titulo,embedding,estado&estado=eq.published');

    const withEmbeddings = courses.filter(c => c.embedding);
    const withoutEmbeddings = courses.filter(c => !c.embedding);

    console.log(`   Total published courses: ${courses.length}`);
    console.log(`   ✓ With embeddings: ${withEmbeddings.length}`);
    console.log(`   ⏳ Without embeddings: ${withoutEmbeddings.length}\n`);

    // 2. Job status
    console.log('2️⃣ Embedding Jobs Status:\n');

    const jobs = await apiCall('/embedding_jobs?select=status');

    const jobStats = {
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
    };

    console.log(`   ⏳ Pending: ${jobStats.pending}`);
    console.log(`   🔄 Processing: ${jobStats.processing}`);
    console.log(`   ✓ Completed: ${jobStats.completed}`);
    console.log(`   ❌ Failed: ${jobStats.failed}\n`);

    // 3. Sample embeddings
    if (withEmbeddings.length > 0) {
      console.log('3️⃣ Sample Embeddings:\n');

      withEmbeddings.slice(0, 3).forEach((course, i) => {
        const embedding = course.embedding;
        const dim = Array.isArray(embedding) ? embedding.length : 0;
        const sample = Array.isArray(embedding) ? embedding.slice(0, 3) : [];

        console.log(`   ${i + 1}. "${course.titulo}"`);
        console.log(`      Dimension: ${dim}`);
        console.log(`      Sample: [${sample.map(v => v.toFixed(4)).join(', ')}, ...]\n`);
      });
    }

    // 4. Next steps
    console.log('4️⃣ Next Steps:\n');

    if (jobStats.pending > 0 || jobStats.processing > 0) {
      console.log('   ⏳ Embeddings are still being generated.');
      console.log('   ✨ The search feature will work once processing completes.\n');
    } else {
      console.log('   ✅ All embeddings processed!');
      console.log('   🔍 Search feature is now fully operational.\n');
    }

    console.log('Test the search:');
    console.log('   curl -X POST https://pfykyfsbjrmqpugtyrlz.supabase.co/rest/v1/courses/search \');
    console.log('     -H "Content-Type: application/json" \');
    console.log('     -H "Authorization: Bearer $KEY" \');
    console.log('     -d \'{"query": "Python"}\'\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
