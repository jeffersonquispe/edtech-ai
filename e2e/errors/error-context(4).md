# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: edtech-instructor-estudiante.spec.ts >> EdTech - Flujos Instructor → Estudiante >> Instructor: crear y publicar curso >> flujo completo: crear y publicar curso
- Location: e2e\edtech-instructor-estudiante.spec.ts:30:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Suite E2E: Flujos Instructor → Estudiante
  5   |  *
  6   |  * Flujo 1: Instructor crea y publica un curso
  7   |  * Flujo 2: Estudiante busca, se inscribe y verifica inscripción
  8   |  *
  9   |  * Estos flujos están encadenados: el curso creado en flujo 1
  10  |  * debe ser encontrado y utilizable en flujo 2.
  11  |  */
  12  | 
  13  | // Datos del curso que crearemos
  14  | const NEW_COURSE_TITLE = `Curso Test ${Date.now()}`; // Título único por timestamp
  15  | const NEW_COURSE_DESC = 'Descripción completa del curso de prueba E2E para verificar el flujo instructor-estudiante.';
  16  | const NEW_COURSE_PRICE = '29.99';
  17  | 
  18  | test.describe.serial('EdTech - Flujos Instructor → Estudiante', () => {
  19  |   /**
  20  |    * FLUJO 1: INSTRUCTOR
  21  |    * 1. Login como instructor
  22  |    * 2. Accede al panel (dashboard)
  23  |    * 3. Crea un nuevo curso con datos específicos
  24  |    * 4. Publica el curso
  25  |    * 5. Verifica que el curso aparece en el catálogo público
  26  |    */
  27  |   test.describe('Instructor: crear y publicar curso', () => {
  28  |     test.use({ storageState: 'e2e/.auth/instructor.json' });
  29  | 
  30  |     test('flujo completo: crear y publicar curso', async ({ page }) => {
  31  |       // 1. Navega al home primero para asegurar que se cargue la sesión
> 32  |       await page.goto('/');
      |                  ^ Error: page.goto: Test timeout of 30000ms exceeded.
  33  | 
  34  |       // 2. Navega al dashboard
  35  |       await page.goto('/dashboard');
  36  | 
  37  |       // Si se redirige a login, significa que la sesión no se cargó correctamente
  38  |       // Espera a que se cargue el dashboard o login
  39  |       await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  40  | 
  41  |       // Verifica que estamos en dashboard o login
  42  |       const url = page.url();
  43  |       if (url.includes('/login')) {
  44  |         // Si estamos en login, algo falló con la sesión
  45  |         throw new Error(`StorageState no se aplicó correctamente. URL: ${url}`);
  46  |       }
  47  |       await expect(page).toHaveURL(/\/dashboard/);
  48  | 
  49  |       // 2. Verifica que está en el panel del instructor
  50  |       const dashboardHeading = page.getByRole('heading', { name: /panel|mis cursos|dashboard/i }).first();
  51  |       await expect(dashboardHeading).toBeVisible();
  52  | 
  53  |       // 3. Busca el botón "Crear Curso" o "Nuevo Curso"
  54  |       const createCourseButton = page.getByRole('button', { name: /crear|nuevo|new/i }).first();
  55  |       await expect(createCourseButton).toBeVisible();
  56  | 
  57  |       // 4. Hace click para crear un nuevo curso
  58  |       await createCourseButton.click();
  59  | 
  60  |       // Espera a que se muestre el formulario
  61  |       await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  62  | 
  63  |       // 5. Llena el formulario de creación de curso usando data-testid
  64  |       // Título
  65  |       const titleInput = page.getByTestId('course-title-input');
  66  |       await expect(titleInput).toBeVisible();
  67  |       await titleInput.fill(NEW_COURSE_TITLE);
  68  | 
  69  |       // Descripción
  70  |       const descInput = page.getByTestId('course-description-input');
  71  |       await expect(descInput).toBeVisible();
  72  |       await descInput.fill(NEW_COURSE_DESC);
  73  | 
  74  |       // Categoría
  75  |       const categorySelect = page.getByTestId('course-category-select');
  76  |       await expect(categorySelect).toBeVisible();
  77  |       // Selecciona la primera categoría disponible (índice 0 es generalmente "Seleccionar")
  78  |       const options = categorySelect.locator('option');
  79  |       const optionCount = await options.count();
  80  |       if (optionCount > 1) {
  81  |         const firstCategoryValue = await options.nth(1).getAttribute('value');
  82  |         if (firstCategoryValue) {
  83  |           await categorySelect.selectOption(firstCategoryValue);
  84  |         }
  85  |       }
  86  | 
  87  |       // Precio
  88  |       const priceInput = page.getByTestId('course-price-input');
  89  |       await expect(priceInput).toBeVisible();
  90  |       await priceInput.fill(NEW_COURSE_PRICE);
  91  | 
  92  |       // 6. Verifica que el formulario está lleno
  93  |       const titleValue = await titleInput.inputValue();
  94  |       expect(titleValue).toBe(NEW_COURSE_TITLE);
  95  | 
  96  |       // 7. Busca y hace click en botón Crear usando data-testid
  97  |       const createButton = page.getByTestId('create-course-button');
  98  |       await expect(createButton).toBeVisible();
  99  | 
  100 |       console.log(`📝 Creando curso: ${NEW_COURSE_TITLE}`);
  101 |       await createButton.click();
  102 | 
  103 |       // Espera a que se guarde el curso
  104 |       console.log(`⏳ Esperando respuesta del servidor...`);
  105 |       await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
  106 |         console.log(`⚠️  Timeout en networkidle, continuando...`);
  107 |       });
  108 | 
  109 |       // Pequeña pausa para asegurar que el formulario se resetea
  110 |       await page.waitForTimeout(1000);
  111 | 
  112 |       // 8. Verifica que el curso aparece en el listado del instructor
  113 |       console.log(`🔍 Buscando curso en listado...`);
  114 |       const coursesList = page.getByTestId('instructor-courses-list');
  115 |       await expect(coursesList).toBeVisible({ timeout: 5000 });
  116 | 
  117 |       // Espera un poco más para que se renderice el nuevo curso
  118 |       await page.waitForTimeout(2000);
  119 | 
  120 |       const courseRow = page.getByText(NEW_COURSE_TITLE);
  121 |       console.log(`📋 Verificando si el curso aparece en el listado...`);
  122 |       await expect(courseRow.first()).toBeVisible({ timeout: 10000 });
  123 | 
  124 |       // 9. Busca y publica el curso (si está en draft)
  125 |       // Espera a que aparezca el botón de publicar
  126 |       // El botón de publicar debería estar visible si el curso está en draft
  127 |       // Intenta buscar un botón de publicar que esté cerca del curso
  128 |       const publishButtons = page.getByRole('button', { name: /publicar/i });
  129 |       const publishButton = publishButtons.first();
  130 | 
  131 |       if (await publishButton.isVisible().catch(() => false)) {
  132 |         await publishButton.click();
```