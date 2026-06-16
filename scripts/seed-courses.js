#!/usr/bin/env node
/**
 * Script para insertar 7 cursos de ejemplo en Supabase.
 * Uso: node scripts/seed-courses.js
 *
 * Requiere que exista un instructor con email "instructor@example.com"
 * (o crea uno automaticamente si no existe)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const coursesData = [
  {
    titulo: 'Introducción a React 19',
    descripcion: 'Aprende los fundamentos de React, hooks, y cómo construir aplicaciones modernas con la última versión de React 19.',
    categorySlug: 'programacion',
    precio: 49.99,
  },
  {
    titulo: 'Diseño UI/UX para principiantes',
    descripcion: 'Domina los principios de diseño, tipografía, color y user experience. Perfecto para diseñadores novatos.',
    categorySlug: 'diseno',
    precio: 39.99,
  },
  {
    titulo: 'Estrategia de Marketing Digital',
    descripcion: 'SEO, SEM, redes sociales y email marketing. Todo lo que necesitas para dominar el marketing online.',
    categorySlug: 'marketing',
    precio: 59.99,
  },
  {
    titulo: 'Python para Ciencia de Datos',
    descripcion: 'Aprende Python, pandas, NumPy y Matplotlib. Conviértete en un analista de datos profesional.',
    categorySlug: 'ciencia-de-datos',
    precio: 69.99,
  },
  {
    titulo: 'Emprenderismo 101',
    descripcion: 'De la idea al negocio: plan de negocio, financiamiento, y cómo escalar tu startup.',
    categorySlug: 'negocios',
    precio: 44.99,
  },
  {
    titulo: 'Advanced TypeScript Patterns',
    descripcion: 'Genéricos, decoradores, type guards y patrones avanzados. Para desarrolladores intermediate/senior.',
    categorySlug: 'programacion',
    precio: 79.99,
  },
  {
    titulo: 'Branding & Identidad Visual',
    descripcion: 'Crea una identidad visual sólida para tu marca. Logo, paleta de colores, y guidelines.',
    categorySlug: 'diseno',
    precio: 54.99,
  },
];

async function seedCourses() {
  try {
    console.log('🌱 Iniciando seed de cursos...\n');

    // 1. Obtener o crear un usuario instructor
    console.log('📧 Buscando/creando instructor...');
    const instructorEmail = 'instructor@example.com';
    const instructorPassword = 'InstructorPassword123!';

    let instructorUser;
    let instructorProfile;

    // Buscar si ya existe
    const { data: existingUsers, error: searchError } = await supabase.auth.admin.listUsers();
    if (searchError) throw searchError;

    instructorUser = existingUsers.users.find(u => u.email === instructorEmail);

    if (!instructorUser) {
      // Crear nuevo usuario
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: instructorEmail,
        password: instructorPassword,
        email_confirm: true,
        user_metadata: { rol: 'instructor', nombre: 'Instructor Demo' },
      });
      if (createError) throw createError;
      instructorUser = newUser.user;
      console.log(`✓ Instructor creado: ${instructorEmail}`);
    } else {
      console.log(`✓ Instructor existente: ${instructorEmail}`);
    }

    // Obtener o crear perfil del instructor
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, rol')
      .eq('id', instructorUser.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') throw profileError;

    if (!profile) {
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: instructorUser.id, rol: 'instructor', nombre: 'Instructor Demo' });
      if (insertError) throw insertError;
      console.log('✓ Perfil de instructor creado');
    } else {
      console.log('✓ Perfil de instructor existe');
    }

    instructorProfile = instructorUser.id;

    // 2. Obtener categorías
    console.log('\n📚 Obteniendo categorías...');
    const { data: categories, error: catError } = await supabase.from('categories').select('id, slug');
    if (catError) throw catError;

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });
    console.log(`✓ ${categories.length} categorías encontradas`);

    // 3. Insertar cursos
    console.log('\n🎓 Insertando cursos...');
    const createdCourses = [];

    for (const courseData of coursesData) {
      const categoryId = categoryMap[courseData.categorySlug];
      if (!categoryId) {
        console.warn(`⚠ Categoría no encontrada: ${courseData.categorySlug}, saltando...`);
        continue;
      }

      const { data: course, error: insertError } = await supabase
        .from('courses')
        .insert({
          instructor_id: instructorProfile,
          category_id: categoryId,
          titulo: courseData.titulo,
          descripcion: courseData.descripcion,
          precio: courseData.precio,
          estado: 'published',
        })
        .select()
        .single();

      if (insertError) {
        console.error(`✗ Error al insertar "${courseData.titulo}":`, insertError.message);
        continue;
      }

      createdCourses.push(course);
      console.log(`✓ ${courseData.titulo} (S/ ${courseData.precio})`);
    }

    // 4. Resumen
    console.log(`\n✅ Seed completado: ${createdCourses.length} cursos creados`);
    console.log('\n📋 Resumen:');
    console.log(`   Instructor: ${instructorEmail}`);
    console.log(`   Cursos insertados: ${createdCourses.length}`);
    console.log(`   Estado: published (visible inmediatamente)`);
    console.log('\n🚀 Visita http://localhost:3000 para ver los cursos.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedCourses();
