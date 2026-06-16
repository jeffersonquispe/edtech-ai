/**
 * Utility to map course titles and categories to local generated images.
 * Provides fallback support for dynamically created courses.
 */
export function getCourseImage(title: string = '', categoryNameOrSlug: string = ''): string {
  const cleanTitle = title.toLowerCase();
  const cleanCategory = categoryNameOrSlug.toLowerCase();

  // 1. Exact or partial matches on course title
  if (cleanTitle.includes('react')) {
    return '/images/courses/react19.png';
  }
  if (cleanTitle.includes('typescript')) {
    return '/images/courses/typescript.png';
  }
  if (cleanTitle.includes('ui/ux') || cleanTitle.includes('ui ux') || cleanTitle.includes('diseño ui')) {
    return '/images/courses/uiux.png';
  }
  if (cleanTitle.includes('branding') || cleanTitle.includes('identidad visual')) {
    return '/images/courses/branding.png';
  }
  if (cleanTitle.includes('marketing')) {
    return '/images/courses/marketing.png';
  }
  if (cleanTitle.includes('python') || cleanTitle.includes('ciencia de datos')) {
    return '/images/courses/python.png';
  }
  if (cleanTitle.includes('emprenderismo') || cleanTitle.includes('negocio') || cleanTitle.includes('startup')) {
    return '/images/courses/negocios.png';
  }

  // 2. Fallbacks based on category slug/name
  if (cleanCategory.includes('programacion') || cleanCategory.includes('programación')) {
    return '/images/courses/react19.png';
  }
  if (cleanCategory.includes('diseno') || cleanCategory.includes('diseño')) {
    return '/images/courses/uiux.png';
  }
  if (cleanCategory.includes('marketing')) {
    return '/images/courses/marketing.png';
  }
  if (cleanCategory.includes('ciencia-de-datos') || cleanCategory.includes('ciencia de datos') || cleanCategory.includes('datos')) {
    return '/images/courses/python.png';
  }
  if (cleanCategory.includes('negocios') || cleanCategory.includes('negocio')) {
    return '/images/courses/negocios.png';
  }

  // Default fallback
  return '/images/courses/react19.png';
}
