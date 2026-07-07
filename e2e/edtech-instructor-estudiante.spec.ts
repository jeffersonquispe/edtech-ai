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
      // 1. Navega al home primero para asegurar que se cargue la sesión
      await page.goto('/');

      // 2. Navega al dashboard
      await page.goto('/dashboard');

      // Si se redirige a login, significa que la sesión no se cargó correctamente
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      const url = page.url();
      if (url.includes('/login')) {
        throw new Error(`StorageState no se aplicó correctamente. URL: ${url}`);
      }
      await expect(page).toHaveURL(/\/dashboard/);

      // 2. Verifica que está en el panel del instructor
      console.log(`✅ En dashboard del instructor`);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // 3. Busca el formulario de crear curso
      const createForm = page.getByTestId('create-course-form');
      await expect(createForm).toBeVisible({ timeout: 5000 });
      console.log(`✅ Formulario de crear curso encontrado`);

      // 4. Llena el formulario de creación de curso usando data-testid
      console.log(`📝 Llenando formulario...`);

      // Título
      const titleInput = page.getByTestId('course-title-input');
      await expect(titleInput).toBeVisible();
      await titleInput.clear();
      await titleInput.fill(NEW_COURSE_TITLE);
      let titleValue = await titleInput.inputValue();
      console.log(`  ✓ Título completado: "${titleValue}"`);
      expect(titleValue).toBe(NEW_COURSE_TITLE);

      // Descripción
      const descInput = page.getByTestId('course-description-input');
      await expect(descInput).toBeVisible();
      await descInput.clear();
      await descInput.fill(NEW_COURSE_DESC);
      console.log(`  ✓ Descripción completada`);

      // Categoría
      const categorySelect = page.getByTestId('course-category-select');
      await expect(categorySelect).toBeVisible();
      const options = categorySelect.locator('option');
      const optionCount = await options.count();
      if (optionCount > 1) {
        const firstCategoryValue = await options.nth(1).getAttribute('value');
        if (firstCategoryValue) {
          await categorySelect.selectOption(firstCategoryValue);
          console.log(`  ✓ Categoría seleccionada: ${firstCategoryValue}`);
        }
      }

      // Precio
      const priceInput = page.getByTestId('course-price-input');
      await expect(priceInput).toBeVisible();
      await priceInput.clear();
      await priceInput.fill(NEW_COURSE_PRICE);
      console.log(`  ✓ Precio completado: ${NEW_COURSE_PRICE}`);

      // 5. Busca y hace click en botón Crear usando data-testid
      const createButton = page.getByTestId('create-course-button');
      await expect(createButton).toBeVisible();
      await expect(createButton).toBeEnabled();

      console.log(`🚀 Clickeando botón "Crear curso"`);
      await createButton.click();

      // Espera a que se guarde el curso
      console.log(`⏳ Esperando respuesta del servidor...`);
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        console.log(`⚠️  Timeout en networkidle`);
      });

      // Espera a que el formulario se resetee (indicador de éxito)
      console.log(`⏳ Verificando si el formulario se limpió...`);
      await page.waitForTimeout(2000);

      // 6. Recarga la página para asegurar que el curso aparece
      console.log(`🔄 Recargando página...`);
      await page.reload();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // 7. Verifica que el curso aparece en el listado del instructor
      console.log(`🔍 Buscando curso en listado después de recarga...`);
      const coursesList = page.getByTestId('instructor-courses-list');
      await expect(coursesList).toBeVisible({ timeout: 10000 });

      const courseRow = page.getByText(NEW_COURSE_TITLE);
      console.log(`📋 Buscando: "${NEW_COURSE_TITLE}"`);
      await expect(courseRow.first()).toBeVisible({ timeout: 10000 });

      console.log(`✅ Curso encontrado en listado`);

      // 8. Busca y publica el curso (si está en draft) — se escopa a la card del curso
      // creado para no publicar accidentalmente otro curso en borrador de una corrida previa.
      console.log(`📤 Buscando botón publicar...`);
      const courseCard = page.locator('[data-testid^="course-card-"]').filter({ hasText: NEW_COURSE_TITLE });
      const publishButton = courseCard.getByRole('button', { name: /publicar/i });

      if (await publishButton.isVisible().catch(() => false)) {
        console.log(`🚀 Publicando curso...`);
        await publishButton.click();

        // No confiar en networkidle: la server action puede tardar más de lo
        // que networkidle espera. Verifica el estado real recargando hasta que
        // el badge diga "published" (o falla explícitamente si nunca ocurre,
        // en vez de fallar 30s después en un locator sin relación aparente).
        await expect(async () => {
          await page.reload();
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
          const badgeText = await courseCard.locator('.badge').textContent().catch(() => null);
          expect(badgeText).toBe('published');
        }).toPass({ timeout: 20000, intervals: [1000, 2000, 4000] });

        console.log(`✅ Curso publicado (badge confirma estado "published")`);
      } else {
        console.log(`⚠️ No se encontró botón publicar visible para este curso (¿ya estaba publicado?)`);
      }

      // 9. Navega al catálogo público para verificar que el curso aparece.
      // revalidatePath('/') puede tardar un poco en propagarse bajo carga (CI),
      // así que reintenta con recargas en vez de esperar una sola vez.
      console.log(`🌐 Navegando al catálogo público...`);
      const courseInCatalog = page.getByText(NEW_COURSE_TITLE);
      await expect(async () => {
        await page.goto('/');
        await expect(courseInCatalog.first()).toBeVisible({ timeout: 5000 });
      }).toPass({ timeout: 30000, intervals: [1000, 2000, 4000] });

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

      console.log(`✅ En página de inicio del estudiante`);

      // 2. Usa la búsqueda para encontrar el curso del instructor
      const searchInput = page.getByPlaceholder(/buscar|search|escribe/i).first();
      await expect(searchInput).toBeVisible();

      // Escribe parte del título del curso
      const courseSearchTerm = NEW_COURSE_TITLE.substring(0, 15);
      console.log(`🔍 Buscando curso: "${courseSearchTerm}"`);
      await searchInput.fill(courseSearchTerm);

      // Espera a que se actualicen los resultados
      await page.waitForTimeout(1500);

      // 3. Verifica que el curso aparece en los resultados
      const searchResult = page.getByText(NEW_COURSE_TITLE);
      await expect(searchResult.first()).toBeVisible({ timeout: 10000 });

      console.log(`✅ Curso encontrado en resultados de búsqueda`);

      // 4. Hace click en el curso para ver los detalles
      await searchResult.first().click();
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verifica que está en la página del curso
      const courseTitle = page.getByRole('heading').filter({ hasText: NEW_COURSE_TITLE }).first();
      await expect(courseTitle).toBeVisible({ timeout: 5000 });

      console.log(`✅ En página de detalles del curso`);

      // 5. Busca el botón de inscribirse usando data-testid
      const enrollButton = page.getByTestId('enroll-button');
      await expect(enrollButton).toBeVisible();

      console.log(`🚀 Haciendo click en "Inscribirse"`);
      // 6. Hace click para inscribirse
      await enrollButton.click();

      // Espera a que se procese la inscripción
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      console.log(`✅ Inscripción procesada`);

      // Tras inscribirse, el EnrollButton llama a router.refresh() y desaparece
      // (el server component recalcula `enrolled` y ya no lo renderiza).
      await expect(enrollButton).toBeHidden({ timeout: 10000 });

      // 7. Navega al dashboard para verificar que el curso aparece en los inscritos
      console.log(`📊 Navegando al dashboard del estudiante...`);
      await page.goto('/dashboard');

      // Espera a que cargue el dashboard
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verifica que hay una sección de "Mis inscripciones"
      const enrolledCoursesSection = page.getByTestId('student-enrolled-courses');
      await expect(enrolledCoursesSection).toBeVisible({ timeout: 10000 });

      console.log(`✅ Sección de cursos inscritos encontrada`);

      // 8. Verifica que el curso está listado en el dashboard del estudiante
      const courseInDashboard = page.getByText(NEW_COURSE_TITLE);
      await expect(courseInDashboard.first()).toBeVisible({ timeout: 5000 });

      console.log(`✅ Curso aparece en panel de cursos inscritos`);

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
      console.log(`👤 Visitante anónimo navegando catálogo...`);
      await page.goto('/');

      // Busca el curso en el catálogo
      const courseLink = page.getByText(NEW_COURSE_TITLE);
      await expect(courseLink.first()).toBeVisible({ timeout: 10000 });

      console.log(`✅ Curso visible en catálogo para visitantes`);

      // Verifica que es clickeable
      await courseLink.first().click();
      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

      // Verifica que el curso tiene detalles
      const courseHeading = page.getByRole('heading', { name: NEW_COURSE_TITLE });
      await expect(courseHeading.first()).toBeVisible({ timeout: 5000 });

      // Verifica que hay precio o descripción
      const courseInfo = page.getByText(NEW_COURSE_DESC);
      await expect(courseInfo).toBeVisible({ timeout: 5000 });

      console.log(`✅ Curso "${NEW_COURSE_TITLE}" completamente visible y funcional`);
    });
  });
});
