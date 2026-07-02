import { test, expect } from '@playwright/test';

test.describe('Smoke Test: Instructor Dashboard', () => {
  test.use({ storageState: 'e2e/.auth/instructor.json' });

  test('instructor puede acceder al dashboard', async ({ page }) => {
    console.log('🚀 Iniciando smoke test...');
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    const url = page.url();
    console.log(`📍 URL actual: ${url}`);
    
    if (url.includes('/login')) {
      throw new Error('Redirigido a login - StorageState no funciona');
    }

    // Verifica que está en dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    console.log('✅ En dashboard');

    // Verifica que hay contenido
    const content = await page.textContent('body');
    console.log(`📝 Contenido de página (primeros 500 chars):`);
    console.log(content?.substring(0, 500));

    // Busca el formulario
    const form = page.getByTestId('create-course-form');
    const isFormVisible = await form.isVisible().catch(() => false);
    console.log(`📋 Formulario visible: ${isFormVisible}`);

    if (isFormVisible) {
      // Verifica cada input
      const titleInput = page.getByTestId('course-title-input');
      const descInput = page.getByTestId('course-description-input');
      const categorySelect = page.getByTestId('course-category-select');
      const priceInput = page.getByTestId('course-price-input');

      console.log(`📝 Title input visible: ${await titleInput.isVisible().catch(() => false)}`);
      console.log(`📝 Desc input visible: ${await descInput.isVisible().catch(() => false)}`);
      console.log(`📝 Category select visible: ${await categorySelect.isVisible().catch(() => false)}`);
      console.log(`📝 Price input visible: ${await priceInput.isVisible().catch(() => false)}`);
    }

    // Verifica lista de cursos
    const coursesList = page.getByTestId('instructor-courses-list');
    const isListVisible = await coursesList.isVisible().catch(() => false);
    console.log(`📋 Courses list visible: ${isListVisible}`);

    if (isListVisible) {
      const coursesContent = await coursesList.textContent();
      console.log(`📚 Cursos existentes: ${coursesContent?.substring(0, 200)}`);
    }
  });
});
