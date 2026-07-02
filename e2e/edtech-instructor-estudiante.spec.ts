import { test, expect } from '@playwright/test';

/**
 * Suite E2E: Flujos Instructor → Estudiante
 *
 * Flujo 1: Instructor crea y publica un curso
 * Flujo 2: Estudiante busca, se inscribe y verifica inscripción
 *
 * Estos flujos están encadenados: el curso creado en flujo 1
 * debe ser encontrado y utilizable en flujo 2.
 */

// Datos del curso que crearemos
const NEW_COURSE_TITLE = `Curso Test ${Date.now()}`; // Título único por timestamp
const NEW_COURSE_DESC = 'Descripción completa del curso de prueba E2E para verificar el flujo instructor-estudiante.';
const NEW_COURSE_PRICE = '29.99';
const NEW_COURSE_LEVEL = 'intermedio';

test.describe.serial('EdTech - Flujos Instructor → Estudiante', () => {
  /**
   * FLUJO 1: INSTRUCTOR
   * 1. Login como instructor
   * 2. Accede al panel (dashboard)
   * 3. Crea un nuevo curso con datos específicos
   * 4. Publica el curso
   * 5. Verifica que el curso aparece en el catálogo público
   */
  test.describe('Instructor: crear y publicar curso', () => {
    test.use({ storageState: 'e2e/.auth/instructor.json' });

    test('flujo completo: crear y publicar curso', async ({ page }) => {
      // 1. Navega al dashboard
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/dashboard/);

      // 2. Verifica que está en el panel del instructor
      const dashboardHeading = page.getByRole('heading', { name: /panel|mis cursos|dashboard/i }).first();
      await expect(dashboardHeading).toBeVisible();

      // 3. Busca el botón "Crear Curso" o "Nuevo Curso"
      const createCourseButton = page.getByRole('button', { name: /crear|nuevo|new/i }).first();
      await expect(createCourseButton).toBeVisible();

      // 4. Hace click para crear un nuevo curso
      await createCourseButton.click();

      // Espera a que se muestre el formulario
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // 5. Llena el formulario de creación de curso usando data-testid
      // Título
      const titleInput = page.getByTestId('course-title-input');
      await expect(titleInput).toBeVisible();
      await titleInput.fill(NEW_COURSE_TITLE);

      // Descripción
      const descInput = page.getByTestId('course-description-input');
      await expect(descInput).toBeVisible();
      await descInput.fill(NEW_COURSE_DESC);

      // Categoría
      const categorySelect = page.getByTestId('course-category-select');
      await expect(categorySelect).toBeVisible();
      // Selecciona la primera categoría disponible (índice 0 es generalmente "Seleccionar")
      const options = categorySelect.locator('option');
      const optionCount = await options.count();
      if (optionCount > 1) {
        const firstCategoryValue = await options.nth(1).getAttribute('value');
        if (firstCategoryValue) {
          await categorySelect.selectOption(firstCategoryValue);
        }
      }

      // Precio
      const priceInput = page.getByTestId('course-price-input');
      await expect(priceInput).toBeVisible();
      await priceInput.fill(NEW_COURSE_PRICE);

      // 6. Verifica que el formulario está lleno
      const titleValue = await titleInput.inputValue();
      expect(titleValue).toBe(NEW_COURSE_TITLE);

      // 7. Busca y hace click en botón Crear usando data-testid
      const createButton = page.getByTestId('create-course-button');
      await expect(createButton).toBeVisible();
      await createButton.click();

      // Espera a que se guarde el curso
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // 8. Verifica que el curso aparece en el listado del instructor
      const coursesList = page.getByTestId('instructor-courses-list');
      await expect(coursesList).toBeVisible({ timeout: 5000 });

      const courseRow = page.getByText(NEW_COURSE_TITLE);
      await expect(courseRow.first()).toBeVisible({ timeout: 5000 });

      // 9. Busca y publica el curso (si está en draft)
      // Espera a que aparezca el botón de publicar
      const courseInList = page.locator(`text=${NEW_COURSE_TITLE}`).first();

      // El botón de publicar debería estar visible si el curso está en draft
      // Intenta buscar un botón de publicar que esté cerca del curso
      const publishButtons = page.getByRole('button', { name: /publicar/i });
      const publishButton = publishButtons.first();

      if (await publishButton.isVisible().catch(() => false)) {
        await publishButton.click();
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      }

      // 10. Navega al catálogo público para verificar que el curso aparece
      await page.goto('/');

      // Busca el curso en el catálogo
      const courseInCatalog = page.getByText(NEW_COURSE_TITLE);
      await expect(courseInCatalog.first()).toBeVisible({ timeout: 10000 });

      console.log(`✅ Curso "${NEW_COURSE_TITLE}" creado y publicado exitosamente`);
    });
  });

  /**
   * FLUJO 2: ESTUDIANTE
   * 1. Login como estudiante
   * 2. Busca el curso creado por el instructor
   * 3. Se inscribe en el curso
   * 4. Verifica que el curso aparece en su panel de cursos inscritos
   */
  test.describe('Estudiante: buscar e inscribirse en curso', () => {
    test.use({ storageState: 'e2e/.auth/estudiante.json' });

    test('flujo completo: buscar, inscribirse y verificar', async ({ page }) => {
      // 1. Navega al home (catálogo)
      await page.goto('/');
      await expect(page).toHaveURL(/^http/);

      // 2. Usa la búsqueda para encontrar el curso del instructor
      const searchInput = page.getByPlaceholder(/buscar|search|escribe/i).first();
      await expect(searchInput).toBeVisible();

      // Escribe parte del título del curso
      const courseSearchTerm = NEW_COURSE_TITLE.substring(0, 15); // Primeros 15 caracteres
      await searchInput.fill(courseSearchTerm);

      // Espera a que se actualicen los resultados
      await page.waitForTimeout(1000); // Pequeña pausa para que se actualice la búsqueda

      // 3. Verifica que el curso aparece en los resultados
      const searchResult = page.getByText(NEW_COURSE_TITLE);
      await expect(searchResult.first()).toBeVisible({ timeout: 10000 });

      // 4. Hace click en el curso para ver los detalles
      await searchResult.first().click();
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verifica que está en la página del curso
      const courseTitle = page.getByRole('heading').filter({ hasText: NEW_COURSE_TITLE }).first();
      await expect(courseTitle).toBeVisible({ timeout: 5000 });

      // 5. Busca el botón de inscribirse usando data-testid
      const enrollButton = page.getByTestId('enroll-button');
      await expect(enrollButton).toBeVisible();

      // 6. Hace click para inscribirse
      await enrollButton.click();

      // Espera a que se procese la inscripción
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // Verifica que la inscripción fue exitosa (botón cambió o se mostró confirmación)
      const successMessage = page.getByText(/inscrito|enrolled|success|confirmar/i);
      const enrolledBadge = page.getByText(/ya estás inscrito|already enrolled|inscripción confirmada/i);

      const isSuccessful = await Promise.race([
        successMessage.first().isVisible().catch(() => false),
        enrolledBadge.first().isVisible().catch(() => false),
        page.waitForURL(/dashboard/, { timeout: 5000 }).then(() => true).catch(() => false)
      ]);

      expect(isSuccessful).toBe(true);

      // 7. Navega al dashboard para verificar que el curso aparece en los inscritos
      await page.goto('/dashboard');

      // Espera a que cargue el dashboard
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verifica que hay una sección de "Mis inscripciones"
      const enrolledCoursesSection = page.getByTestId('student-enrolled-courses');
      await expect(enrolledCoursesSection).toBeVisible({ timeout: 10000 });

      // 8. Verifica que el curso está listado en el dashboard del estudiante
      const courseInDashboard = page.getByText(NEW_COURSE_TITLE);
      await expect(courseInDashboard.first()).toBeVisible({ timeout: 5000 });

      // 9. Hace click en el curso para verificar que puede acceder a él
      await courseInDashboard.first().click();
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verifica que está dentro del curso (debe haber lecciones o contenido)
      const courseContent = page.getByRole('heading', { name: NEW_COURSE_TITLE }).first();
      await expect(courseContent).toBeVisible({ timeout: 5000 });

      console.log(`✅ Estudiante inscrito en "${NEW_COURSE_TITLE}" exitosamente`);
    });
  });

  /**
   * FLUJO 3: VERIFICACIÓN FINAL
   * Verifica que el curso está visible en el catálogo público y completo
   */
  test.describe('Verificación: curso en catálogo público', () => {
    // Sin autenticación requerida - visitante anónimo
    test('curso visible en catálogo para visitantes', async ({ page }) => {
      await page.goto('/');

      // Busca el curso en el catálogo
      const courseLink = page.getByText(NEW_COURSE_TITLE);
      await expect(courseLink.first()).toBeVisible({ timeout: 10000 });

      // Verifica que es clickeable
      await courseLink.first().click();
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verifica que el curso tiene detalles
      const courseHeading = page.getByRole('heading', { name: NEW_COURSE_TITLE });
      await expect(courseHeading.first()).toBeVisible({ timeout: 5000 });

      // Verifica que hay precio o descripción
      const courseInfo = page.getByText(NEW_COURSE_DESC);
      await expect(courseInfo).toBeVisible({ timeout: 5000 });

      console.log(`✅ Curso "${NEW_COURSE_TITLE}" es visible para visitantes`);
    });
  });
});
