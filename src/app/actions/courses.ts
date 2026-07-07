'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { validateTitle, validateText, validatePrice, validateUUID, validatePosition, validateRating } from '@/lib/api/validation';

export async function createCourse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const titulo = formData.get('titulo') as string;
  const descripcion = formData.get('descripcion') as string;
  const categoryId = formData.get('categoryId') as string;
  const precio = formData.get('precio') as string;

  // Validate
  const titleValidation = validateTitle(titulo);
  if (!titleValidation.valid) throw new Error(titleValidation.error);

  const descValidation = validateText(descripcion, false);
  if (!descValidation.valid) throw new Error(descValidation.error);

  const categoryValidation = validateUUID(categoryId);
  if (!categoryValidation.valid) throw new Error('Categoría inválida');

  const priceValidation = validatePrice(precio);
  if (!priceValidation.valid) throw new Error(priceValidation.error);

  const { data, error } = await supabase
    .from('courses')
    .insert({
      instructor_id: user.id,
      titulo,
      descripcion: descripcion || null,
      category_id: categoryId,
      precio: Number(precio),
      estado: 'draft',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  return data;
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const idValidation = validateUUID(courseId);
  if (!idValidation.valid) throw new Error('ID inválido');

  const titulo = formData.get('titulo') as string | null;
  const descripcion = formData.get('descripcion') as string | null;
  const categoryId = formData.get('categoryId') as string | null;
  const precio = formData.get('precio') as string | null;
  const estado = formData.get('estado') as string | null;

  const patch: Record<string, any> = {};

  if (titulo) {
    const validation = validateTitle(titulo);
    if (!validation.valid) throw new Error(validation.error);
    patch.titulo = titulo;
  }

  if (descripcion) {
    const validation = validateText(descripcion, false);
    if (!validation.valid) throw new Error(validation.error);
    patch.descripcion = descripcion;
  }

  if (categoryId) {
    const validation = validateUUID(categoryId);
    if (!validation.valid) throw new Error('Categoría inválida');
    patch.category_id = categoryId;
  }

  if (precio) {
    const validation = validatePrice(precio);
    if (!validation.valid) throw new Error(validation.error);
    patch.precio = Number(precio);
  }

  if (estado) {
    if (!['draft', 'published', 'archived'].includes(estado)) {
      throw new Error('Estado inválido');
    }
    patch.estado = estado;
  }

  if (Object.keys(patch).length === 0) throw new Error('Sin cambios');

  const { data, error } = await supabase
    .from('courses')
    .update(patch)
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  revalidatePath(`/courses/${courseId}`);
  return data;
}

export async function enrollCourse(courseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const idValidation = validateUUID(courseId);
  if (!idValidation.valid) throw new Error('ID inválido');

  const { data, error } = await supabase
    .from('enrollments')
    .insert({ student_id: user.id, course_id: courseId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Ya está inscrito');
    if (error.code === '42501') throw new Error('No puede inscribirse');
    throw new Error(error.message);
  }

  revalidatePath(`/courses/${courseId}`);
  return data;
}

export async function addLesson(courseId: string, formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const idValidation = validateUUID(courseId);
  if (!idValidation.valid) throw new Error('ID inválido');

  const titulo = formData.get('titulo') as string;
  const contenido = formData.get('contenido') as string;
  const position = formData.get('position') as string;

  const titleValidation = validateTitle(titulo);
  if (!titleValidation.valid) throw new Error(titleValidation.error);

  const contentValidation = validateText(contenido, false);
  if (!contentValidation.valid) throw new Error(contentValidation.error);

  const posValidation = validatePosition(position);
  if (!posValidation.valid) throw new Error(posValidation.error);

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id: courseId,
      titulo,
      contenido: contenido || null,
      position: Number(position) || 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/courses/${courseId}`);
  return data;
}

export async function submitReview(courseId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const idValidation = validateUUID(courseId);
  if (!idValidation.valid) throw new Error('ID inválido');

  const rating = formData.get('rating') as string;
  const texto = formData.get('texto') as string;

  const ratingValidation = validateRating(Number(rating));
  if (!ratingValidation.valid) throw new Error(ratingValidation.error);

  const textValidation = validateText(texto, false);
  if (!textValidation.valid) throw new Error(textValidation.error);

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      student_id: user.id,
      course_id: courseId,
      rating: Number(rating),
      texto: texto || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Ya reseñó este curso');
    if (error.code === '42501') throw new Error('No puede reseñar');
    throw new Error(error.message);
  }

  revalidatePath(`/courses/${courseId}`);
  return data;
}

export async function publishCourse(courseId: string) {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const idValidation = validateUUID(courseId);
  if (!idValidation.valid) throw new Error('ID inválido');

  const { data, error } = await supabase
    .from('courses')
    .update({ estado: 'published' })
    .eq('id', courseId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/');
  return data;
}

export async function deleteCourse(courseId: string) {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const idValidation = validateUUID(courseId);
  if (!idValidation.valid) throw new Error('ID inválido');

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard');
  return true;
}
